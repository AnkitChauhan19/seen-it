import type { WatchlistPriority } from "@/components/watchlist/priority-badge";

export type TmdbMediaType = "movie" | "tv";
export type UserMediaStatus = "watchlist" | "watched";
export type LibraryCategory =
  | "movie"
  | "anime"
  | "tv_show"
  | "web_series"
  | "theaters";

export type MediaRow = {
  id: string;
  tmdb_id: number;
  tmdb_media_type: TmdbMediaType;
  title: string;
  overview: string;
  release_year: string | null;
  poster_path: string | null;
  vote_average: number | null;
  is_anime: boolean;
};

export type UserMediaRow = {
  id: string;
  user_id: string;
  media_id: string;
  status: UserMediaStatus;
  library_category: LibraryCategory | null;
  priority: WatchlistPriority;
  personal_rating: number | null;
  watched_date: string | null;
  created_at: string;
  updated_at: string;
  media: MediaRow;
};

export type MediaSnapshot = {
  compositeId: string;
  title: string;
  overview?: string;
  releaseYear?: string;
  posterPath?: string;
  voteAverage?: number;
  mediaKind?: "movie" | "tv" | "anime";
};

export const LIBRARY_CATEGORY_LABELS: Record<LibraryCategory, string> = {
  movie: "Movie",
  anime: "Anime",
  tv_show: "TV Show",
  web_series: "Web Series",
  theaters: "Theaters",
};

/** Add-to-library menu (order matters for UI). */
export const LIBRARY_ADD_OPTIONS: { category: LibraryCategory; label: string }[] =
  [
    { category: "movie", label: "Add to Movies" },
    { category: "tv_show", label: "Add to TV Shows" },
    { category: "anime", label: "Add to Anime" },
    { category: "web_series", label: "Add to Web Series" },
    { category: "theaters", label: "Add to Theaters" },
  ];
