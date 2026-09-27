import type { WatchlistPriority } from "@/components/watchlist/priority-badge";
import { parseCompositeMediaId } from "@/lib/parse-media-id";
import { supabase } from "@/lib/supabase";
import type {
  LibraryCategory,
  MediaSnapshot,
  UserMediaRow,
  UserMediaStatus,
} from "@/types/user-media";

function normalizeUserMediaRow(row: unknown): UserMediaRow {
  const record = row as UserMediaRow & { media: UserMediaRow["media"] | UserMediaRow["media"][] };
  const media = Array.isArray(record.media) ? record.media[0] : record.media;
  return { ...record, media };
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

export async function addToLibrary(
  snapshot: MediaSnapshot,
  category: LibraryCategory,
): Promise<void> {
  const userId = await requireUserId();
  const mediaId = await ensureMediaRecord(snapshot);
  const today = new Date().toISOString().slice(0, 10);

  const { error } = await supabase.from("user_media").upsert(
    {
      user_id: userId,
      media_id: mediaId,
      status: "watched",
      library_category: category,
      watched_date: today,
      priority: "medium",
    },
    { onConflict: "user_id,media_id" },
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
  avgRating: number | null;
}> {
  const { data, error } = await supabase
    .from("user_media")
    .select("status, library_category, personal_rating");

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const watched = rows.filter((r) => r.status === "watched");
  const watchlist = rows.filter((r) => r.status === "watchlist");
  const theaters = watched.filter((r) => r.library_category === "theaters");
  const ratings = watched
    .map((r) => r.personal_rating)
    .filter((r): r is number => typeof r === "number");

  const avgRating =
    ratings.length > 0
      ? ratings.reduce((sum, n) => sum + n, 0) / ratings.length
      : null;

  return {
    watchedCount: watched.length,
    watchlistCount: watchlist.length,
    theatersCount: theaters.length,
    avgRating,
  };
}
