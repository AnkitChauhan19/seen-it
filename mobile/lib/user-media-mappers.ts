import type { WatchlistItem } from "@/components/watchlist/watchlist-item-card";
import type { WatchlistFilter } from "@/components/watchlist/watchlist-filter-chips";
import type { LibraryFilter } from "@/components/library/library-filter-chips";
import {
  normalizeShelfCategory,
  rowHasTheaterMembership,
  type ShelfLibraryCategory,
} from "@/lib/library-membership";
import { LIBRARY_CATEGORY_LABELS } from "@/types/user-media";
import type { LibraryCategory, UserMediaRow } from "@/types/user-media";
import { toCompositeMediaId } from "@/lib/parse-media-id";

export function libraryCategoryLabel(category: LibraryCategory | null): string {
  if (!category) return "Watched";
  return LIBRARY_CATEGORY_LABELS[category];
}

export function mediaTypeLabel(row: UserMediaRow): string {
  const shelf = normalizeShelfCategory(row.library_category);
  if (row.status === "watched" && shelf) {
    return libraryCategoryLabel(shelf);
  }
  if (row.status === "watched" && rowHasTheaterMembership(row)) {
    return LIBRARY_CATEGORY_LABELS.theaters;
  }
  if (row.media.is_anime) return "Anime";
  if (row.media.tmdb_media_type === "movie") return "Movie";
  return "TV Show";
}

export function toWatchlistItem(row: UserMediaRow): WatchlistItem {
  return {
    id: row.id,
    userMediaId: row.id,
    mediaCompositeId: toCompositeMediaId(
      row.media.tmdb_media_type,
      row.media.tmdb_id,
    ),
    title: row.media.title,
    year: row.media.release_year ?? "—",
    type: mediaTypeLabel(row),
    mediaKind: row.media.is_anime
      ? "anime"
      : row.media.tmdb_media_type === "movie"
        ? "movie"
        : "tv",
    genres: "",
    synopsis: row.media.overview,
    posterPath: row.media.poster_path ?? undefined,
    priority: row.priority,
  };
}

export type LibraryListItem = WatchlistItem & {
  libraryCategory: ShelfLibraryCategory | null;
  inTheaters: boolean;
  personalRating: number | null;
  updatedAt: string;
  theaterLine?: string;
};

function theaterDetailLine(row: UserMediaRow): string | undefined {
  if (!rowHasTheaterMembership(row)) return undefined;
  const raw = row.theater_watch;
  const tw = Array.isArray(raw) ? raw[0] : raw;
  if (!tw) return undefined;
  const parts = [tw.theater_name, tw.language, tw.format].filter(Boolean);
  return parts.length > 0 ? parts.join(" • ") : undefined;
}

export function toLibraryItem(row: UserMediaRow): LibraryListItem {
  const shelf = normalizeShelfCategory(row.library_category);
  const inTheaters = rowHasTheaterMembership(row);
  return {
    ...toWatchlistItem(row),
    libraryCategory: shelf,
    inTheaters,
    type: shelf
      ? libraryCategoryLabel(shelf)
      : inTheaters
        ? LIBRARY_CATEGORY_LABELS.theaters
        : mediaTypeLabel(row),
    personalRating: row.personal_rating,
    updatedAt: row.updated_at ?? row.created_at,
    theaterLine: theaterDetailLine(row),
  };
}

export function matchesWatchlistFilter(
  row: UserMediaRow,
  filter: WatchlistFilter,
): boolean {
  if (filter === "All") return true;
  if (filter === "Movies") {
    return row.media.tmdb_media_type === "movie" && !row.media.is_anime;
  }
  if (filter === "Anime") return row.media.is_anime;
  if (filter === "TV Shows") {
    return row.media.tmdb_media_type === "tv" && !row.media.is_anime;
  }
  return true;
}

export function matchesLibraryFilter(
  row: UserMediaRow,
  filter: LibraryFilter,
): boolean {
  const shelf = normalizeShelfCategory(row.library_category);
  const inTheaters = rowHasTheaterMembership(row);

  if (filter === "All") return shelf !== null || inTheaters;
  if (filter === "Movies") return shelf === "movie";
  if (filter === "TV Shows") return shelf === "tv_show";
  if (filter === "Web Series") return shelf === "web_series";
  if (filter === "Anime") return shelf === "anime";
  if (filter === "Theaters") return inTheaters;
  return true;
}
