export const queryKeys = {
  watchlist: (filter: string) => ["watchlist", filter] as const,
  library: (filter: string) => ["library", filter] as const,
  userMediaState: (compositeId: string) => ["user-media-state", compositeId] as const,
  homeStats: () => ["home-stats"] as const,
  recentlyWatched: () => ["recently-watched"] as const,
  watchlistPreview: () => ["watchlist-preview"] as const,
};
