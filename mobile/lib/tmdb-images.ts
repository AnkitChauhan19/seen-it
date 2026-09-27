const TMDB_POSTER_BASE = "https://image.tmdb.org/t/p/w342";

export function tmdbPosterUrl(posterPath: string): string {
  if (!posterPath) {
    return "";
  }
  return `${TMDB_POSTER_BASE}${posterPath}`;
}
