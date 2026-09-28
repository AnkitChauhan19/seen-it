export const queryKeys = {
  watchlist: (userId: string, filter: string) =>
    ["watchlist", userId, filter] as const,
  library: (userId: string, filter: string) =>
    ["library", userId, filter] as const,
  userMediaState: (userId: string, compositeId: string) =>
    ["user-media-state", userId, compositeId] as const,
  homeStats: (userId: string) => ["home-stats", userId] as const,
  recentlyWatched: (userId: string) => ["recently-watched", userId] as const,
  watchlistPreview: (userId: string) => ["watchlist-preview", userId] as const,
};
