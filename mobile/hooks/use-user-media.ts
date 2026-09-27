import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { WatchlistFilter } from "@/components/watchlist/watchlist-filter-chips";
import type { LibraryFilter } from "@/components/library/library-filter-chips";
import type { WatchlistPriority } from "@/components/watchlist/priority-badge";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/store/auth-store";
import {
  matchesLibraryFilter,
  matchesWatchlistFilter,
  toLibraryItem,
  toWatchlistItem,
} from "@/lib/user-media-mappers";
import {
  addToLibrary,
  addToWatchlist,
  fetchHomeStats,
  fetchUserMediaByCompositeId,
  listUserMediaByStatus,
  removeUserMedia,
  updateWatchlistPriority,
} from "@/lib/user-media-repository";
import type { LibraryCategory, MediaSnapshot } from "@/types/user-media";

function invalidateUserMediaQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: ["watchlist"] });
  void queryClient.invalidateQueries({ queryKey: ["library"] });
  void queryClient.invalidateQueries({ queryKey: ["user-media-state"] });
  void queryClient.invalidateQueries({ queryKey: queryKeys.homeStats() });
  void queryClient.invalidateQueries({ queryKey: queryKeys.recentlyWatched() });
  void queryClient.invalidateQueries({ queryKey: queryKeys.watchlistPreview() });
}

export function useWatchlist(filter: WatchlistFilter) {
  const session = useAuthStore((s) => s.session);
  return useQuery({
    queryKey: queryKeys.watchlist(filter),
    enabled: !!session,
    queryFn: async () => {
      const rows = await listUserMediaByStatus("watchlist");
      return rows
        .filter((row) => matchesWatchlistFilter(row, filter))
        .map(toWatchlistItem);
    },
  });
}

export function useLibrary(filter: LibraryFilter) {
  const session = useAuthStore((s) => s.session);
  return useQuery({
    queryKey: queryKeys.library(filter),
    enabled: !!session,
    queryFn: async () => {
      const rows = await listUserMediaByStatus("watched");
      return rows
        .filter((row) => matchesLibraryFilter(row, filter))
        .map(toLibraryItem);
    },
  });
}

export function useUserMediaState(compositeId: string) {
  const session = useAuthStore((s) => s.session);
  return useQuery({
    queryKey: queryKeys.userMediaState(compositeId),
    queryFn: () => fetchUserMediaByCompositeId(compositeId),
    enabled: !!session && compositeId.length > 0,
  });
}

export function useHomeStats() {
  const session = useAuthStore((s) => s.session);
  return useQuery({
    queryKey: queryKeys.homeStats(),
    enabled: !!session,
    queryFn: fetchHomeStats,
  });
}

export function useRecentlyWatched(limit = 5) {
  const session = useAuthStore((s) => s.session);
  return useQuery({
    queryKey: queryKeys.recentlyWatched(),
    enabled: !!session,
    queryFn: async () => {
      const rows = await listUserMediaByStatus("watched");
      return rows.slice(0, limit).map(toLibraryItem);
    },
  });
}

export function useWatchlistPreview(limit = 6) {
  const session = useAuthStore((s) => s.session);
  return useQuery({
    queryKey: queryKeys.watchlistPreview(),
    enabled: !!session,
    queryFn: async () => {
      const rows = await listUserMediaByStatus("watchlist");
      return rows.slice(0, limit).map(toWatchlistItem);
    },
  });
}

export function useUserMediaMutations() {
  const queryClient = useQueryClient();

  const onSuccess = () => invalidateUserMediaQueries(queryClient);

  const addWatchlist = useMutation({
    mutationFn: ({
      snapshot,
      priority,
    }: {
      snapshot: MediaSnapshot;
      priority?: WatchlistPriority;
    }) => addToWatchlist(snapshot, priority),
    onSuccess,
  });

  const addLibrary = useMutation({
    mutationFn: ({
      snapshot,
      category,
    }: {
      snapshot: MediaSnapshot;
      category: LibraryCategory;
    }) => addToLibrary(snapshot, category),
    onSuccess,
  });

  const remove = useMutation({
    mutationFn: (userMediaId: string) => removeUserMedia(userMediaId),
    onSuccess,
  });

  const setPriority = useMutation({
    mutationFn: ({
      userMediaId,
      priority,
    }: {
      userMediaId: string;
      priority: WatchlistPriority;
    }) => updateWatchlistPriority(userMediaId, priority),
    onSuccess,
  });

  return { addWatchlist, addLibrary, remove, setPriority };
}
