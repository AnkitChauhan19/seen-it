import type { WatchlistItem } from "@/components/watchlist/watchlist-item-card";
import type { WatchlistFilter } from "@/components/watchlist/watchlist-filter-chips";
import type { LibraryFilter } from "@/components/library/library-filter-chips";
import { LIBRARY_CATEGORY_LABELS } from "@/types/user-media";
import type { LibraryCategory, UserMediaRow } from "@/types/user-media";
import { toCompositeMediaId } from "@/lib/parse-media-id";

export function libraryCategoryLabel(category: LibraryCategory | null): string {
  if (!category) return "Watched";
  return LIBRARY_CATEGORY_LABELS[category];
}

export function mediaTypeLabel(row: UserMediaRow): string {
  if (row.status === "watched" && row.library_category) {
    return libraryCategoryLabel(row.library_category);
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
  libraryCategory: LibraryCategory | null;
  personalRating: number | null;
  updatedAt: string;
};

export function toLibraryItem(row: UserMediaRow): LibraryListItem {
  return {
    ...toWatchlistItem(row),
    libraryCategory: row.library_category,
    type: libraryCategoryLabel(row.library_category),
    personalRating: row.personal_rating,
    updatedAt: row.updated_at ?? row.created_at,
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
  if (filter === "All") return true;
  if (filter === "Movies") return row.library_category === "movie";
  if (filter === "TV Shows") return row.library_category === "tv_show";
  if (filter === "Web Series") return row.library_category === "web_series";
  if (filter === "Anime") return row.library_category === "anime";
  if (filter === "Theaters") return row.library_category === "theaters";
  return true;
}
