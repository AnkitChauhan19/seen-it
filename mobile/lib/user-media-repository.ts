import type { WatchlistPriority } from "@/components/watchlist/priority-badge";
import { parseCompositeMediaId } from "@/lib/parse-media-id";
import { supabase } from "@/lib/supabase";
import {
  isTheaterEligibleRow,
  normalizeShelfCategory,
  type ShelfLibraryCategory,
} from "@/lib/library-membership";
import type {
  LibraryCategory,
  MediaSnapshot,
  TheaterWatchInput,
  TheaterWatchRow,
  UserMediaRow,
  UserMediaStatus,
} from "@/types/user-media";

function normalizeTheaterWatch(
  value: TheaterWatchRow | TheaterWatchRow[] | null | undefined,
): TheaterWatchRow | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizeUserMediaRow(row: unknown): UserMediaRow {
  const record = row as UserMediaRow & {
    media: UserMediaRow["media"] | UserMediaRow["media"][];
    theater_watches?: TheaterWatchRow | TheaterWatchRow[];
  };
  const media = Array.isArray(record.media) ? record.media[0] : record.media;
  const theater_watch = normalizeTheaterWatch(
    record.theater_watch ?? record.theater_watches,
  );
  return { ...record, media, theater_watch };
}

const USER_MEDIA_SELECT = `
  id,
  user_id,
  media_id,
  status,
  library_category,
  priority,
  personal_rating,
  watched_date,
  created_at,
  updated_at,
  media:media_id (
    id,
    tmdb_id,
    tmdb_media_type,
    title,
    overview,
    release_year,
    poster_path,
    vote_average,
    is_anime
  ),
  theater_watches (
    theater_name,
    language,
    format
  )
`;

function isAnimeKind(mediaKind?: string): boolean {
  return mediaKind === "anime";
}

async function requireUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!user) throw new Error("You must be signed in.");
  return user.id;
}

/** Persists a small metadata snapshot only when the user adds a title (not on search). */
export async function ensureMediaRecord(snapshot: MediaSnapshot): Promise<string> {
  const parsed = parseCompositeMediaId(snapshot.compositeId);
  if (!parsed) {
    throw new Error("Invalid media id.");
  }

  const { data, error } = await supabase
    .from("media")
    .upsert(
      {
        tmdb_id: parsed.tmdbId,
        tmdb_media_type: parsed.tmdbMediaType,
        title: snapshot.title,
        overview: snapshot.overview ?? "",
        release_year: snapshot.releaseYear ?? null,
        poster_path: snapshot.posterPath ?? null,
        vote_average: snapshot.voteAverage ?? null,
        is_anime: isAnimeKind(snapshot.mediaKind),
      },
      { onConflict: "tmdb_id,tmdb_media_type" },
    )
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id;
}

export async function fetchUserMediaByCompositeId(
  compositeId: string,
): Promise<UserMediaRow | null> {
  const parsed = parseCompositeMediaId(compositeId);
  if (!parsed) return null;

  const { data: mediaRow, error: mediaError } = await supabase
    .from("media")
    .select("id")
    .eq("tmdb_id", parsed.tmdbId)
    .eq("tmdb_media_type", parsed.tmdbMediaType)
    .maybeSingle();

  if (mediaError) throw new Error(mediaError.message);
  if (!mediaRow) return null;

  const { data, error } = await supabase
    .from("user_media")
    .select(USER_MEDIA_SELECT)
    .eq("media_id", mediaRow.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? normalizeUserMediaRow(data) : null;
}

export async function listUserMediaByStatus(
  status: UserMediaStatus,
): Promise<UserMediaRow[]> {
  const { data, error } = await supabase
    .from("user_media")
    .select(USER_MEDIA_SELECT)
    .eq("status", status)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeUserMediaRow);
}

export async function addToWatchlist(
  snapshot: MediaSnapshot,
  priority: WatchlistPriority = "medium",
): Promise<void> {
  const userId = await requireUserId();
  const mediaId = await ensureMediaRecord(snapshot);

  const { error } = await supabase.from("user_media").upsert(
    {
      user_id: userId,
      media_id: mediaId,
      status: "watchlist",
      library_category: null,
      priority,
      watched_date: null,
    },
    { onConflict: "user_id,media_id" },
  );

  if (error) throw new Error(error.message);
}

async function upsertWatchedShelf(
  userId: string,
  mediaId: string,
  category: ShelfLibraryCategory,
): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("user_media")
    .upsert(
      {
        user_id: userId,
        media_id: mediaId,
        status: "watched",
        library_category: category,
        watched_date: today,
        priority: "medium",
      },
      { onConflict: "user_id,media_id" },
    )
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

/** Theater-only adds also land in Movies when no other shelf is set (not the reverse). */
async function ensureMovieShelfIfUnset(userMediaId: string): Promise<void> {
  const { data, error } = await supabase
    .from("user_media")
    .select("library_category")
    .eq("id", userMediaId)
    .single();

  if (error) throw new Error(error.message);
  if (normalizeShelfCategory(data.library_category)) {
    return;
  }

  const { error: updateError } = await supabase
    .from("user_media")
    .update({ library_category: "movie" })
    .eq("id", userMediaId);

  if (updateError) throw new Error(updateError.message);
}

async function ensureWatchedForTheater(
  userId: string,
  mediaId: string,
): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);

  const { data: existing, error: fetchError } = await supabase
    .from("user_media")
    .select("id, status, watched_date")
    .eq("user_id", userId)
    .eq("media_id", mediaId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);

  if (existing) {
    const patch: {
      status: "watched";
      watched_date?: string;
    } = { status: "watched" };
    if (existing.status !== "watched" || !existing.watched_date) {
      patch.watched_date = today;
    }

    const { data, error } = await supabase
      .from("user_media")
      .update(patch)
      .eq("id", existing.id)
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return data.id;
  }

  const { data, error } = await supabase
    .from("user_media")
    .insert({
      user_id: userId,
      media_id: mediaId,
      status: "watched",
      library_category: null,
      watched_date: today,
      priority: "medium",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

async function fetchUserMediaById(userMediaId: string): Promise<UserMediaRow | null> {
  const { data, error } = await supabase
    .from("user_media")
    .select(USER_MEDIA_SELECT)
    .eq("id", userMediaId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? normalizeUserMediaRow(data) : null;
}

async function cleanupUserMediaIfEmpty(userMediaId: string): Promise<void> {
  const row = await fetchUserMediaById(userMediaId);
  if (!row || row.status !== "watched") return;

  const hasShelf =
    row.library_category !== null && row.library_category !== "theaters";
  const hasTheater = normalizeTheaterWatch(row.theater_watch) !== null;

  if (!hasShelf && !hasTheater) {
    await removeUserMedia(userMediaId);
  }
}

export async function addToLibrary(
  snapshot: MediaSnapshot,
  category: LibraryCategory,
): Promise<void> {
  if (category === "theaters") {
    throw new Error("Use addToLibraryTheater for theater visits.");
  }

  const userId = await requireUserId();
  const mediaId = await ensureMediaRecord(snapshot);
  await upsertWatchedShelf(userId, mediaId, category);
}

export async function addToLibraryTheater(
  snapshot: MediaSnapshot,
  details: TheaterWatchInput,
): Promise<void> {
  const userId = await requireUserId();
  const mediaId = await ensureMediaRecord(snapshot);

  const { data: mediaRow, error: mediaError } = await supabase
    .from("media")
    .select("tmdb_media_type, is_anime")
    .eq("id", mediaId)
    .single();

  if (mediaError) throw new Error(mediaError.message);
  if (
    mediaRow.tmdb_media_type !== "movie" ||
    mediaRow.is_anime
  ) {
    throw new Error("Only movies can be added to theaters.");
  }

  const userMediaId = await ensureWatchedForTheater(userId, mediaId);
  await ensureMovieShelfIfUnset(userMediaId);

  const row = await fetchUserMediaById(userMediaId);
  if (row && !isTheaterEligibleRow(row)) {
    throw new Error("Only movies can be added to theaters.");
  }

  const { error } = await supabase.from("theater_watches").upsert(
    {
      user_media_id: userMediaId,
      theater_name: details.theaterName,
      language: details.language,
      format: details.format,
    },
    { onConflict: "user_media_id" },
  );

  if (error) throw new Error(error.message);
}

export async function removeUserMedia(userMediaId: string): Promise<void> {
  const { error } = await supabase
    .from("user_media")
    .delete()
    .eq("id", userMediaId);

  if (error) throw new Error(error.message);
}

export async function removeTheaterMembership(
  userMediaId: string,
): Promise<void> {
  const { error } = await supabase
    .from("theater_watches")
    .delete()
    .eq("user_media_id", userMediaId);

  if (error) throw new Error(error.message);
  await cleanupUserMediaIfEmpty(userMediaId);
}

export async function removeShelfMembership(userMediaId: string): Promise<void> {
  const { error } = await supabase
    .from("user_media")
    .update({ library_category: null })
    .eq("id", userMediaId);

  if (error) throw new Error(error.message);
  await cleanupUserMediaIfEmpty(userMediaId);
}

export async function removeByCompositeId(compositeId: string): Promise<void> {
  const row = await fetchUserMediaByCompositeId(compositeId);
  if (!row) return;
  await removeUserMedia(row.id);
}

export async function updateWatchlistPriority(
  userMediaId: string,
  priority: WatchlistPriority,
): Promise<void> {
  const { error } = await supabase
    .from("user_media")
    .update({ priority, status: "watchlist" })
    .eq("id", userMediaId);

  if (error) throw new Error(error.message);
}

export async function fetchHomeStats(): Promise<{
  watchedCount: number;
  watchlistCount: number;
  theatersCount: number;
}> {
  const { data, error } = await supabase
    .from("user_media")
    .select("status, library_category");

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const watched = rows.filter((r) => r.status === "watched");
  const watchlist = rows.filter((r) => r.status === "watchlist");
  const { count: theatersCount, error: theaterError } = await supabase
    .from("theater_watches")
    .select("id", { count: "exact", head: true });

  if (theaterError) throw new Error(theaterError.message);

  return {
    watchedCount: watched.length,
    watchlistCount: watchlist.length,
    theatersCount: theatersCount ?? 0,
  };
}
