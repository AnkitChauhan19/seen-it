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
  addToLibraryTheater,
  addToWatchlist,
  fetchHomeStats,
  fetchUserMediaByCompositeId,
  listUserMediaByStatus,
  removeShelfMembership,
  removeTheaterMembership,
  removeUserMedia,
  updateWatchlistPriority,
} from "@/lib/user-media-repository";
import type {
  LibraryCategory,
  MediaSnapshot,
  TheaterWatchInput,
} from "@/types/user-media";

function invalidateUserMediaQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
) {
  void queryClient.invalidateQueries({ queryKey: ["watchlist", userId] });
  void queryClient.invalidateQueries({ queryKey: ["library", userId] });
  void queryClient.invalidateQueries({ queryKey: ["user-media-state", userId] });
  void queryClient.invalidateQueries({ queryKey: queryKeys.homeStats(userId) });
  void queryClient.invalidateQueries({
    queryKey: queryKeys.recentlyWatched(userId),
  });
  void queryClient.invalidateQueries({
    queryKey: queryKeys.watchlistPreview(userId),
  });
}

export function useWatchlist(filter: WatchlistFilter) {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id ?? "";
  return useQuery({
    queryKey: queryKeys.watchlist(userId, filter),
    enabled: !!userId,
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
  const userId = session?.user.id ?? "";
  return useQuery({
    queryKey: queryKeys.library(userId, filter),
    enabled: !!userId,
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
  const userId = session?.user.id ?? "";
  return useQuery({
    queryKey: queryKeys.userMediaState(userId, compositeId),
    queryFn: () => fetchUserMediaByCompositeId(compositeId),
    enabled: !!userId && compositeId.length > 0,
  });
}

export function useHomeStats() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id ?? "";
  return useQuery({
    queryKey: queryKeys.homeStats(userId),
    enabled: !!userId,
    queryFn: fetchHomeStats,
  });
}

export function useRecentlyWatched(limit = 5) {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id ?? "";
  return useQuery({
    queryKey: queryKeys.recentlyWatched(userId),
    enabled: !!userId,
    queryFn: async () => {
      const rows = await listUserMediaByStatus("watched");
      return rows.slice(0, limit).map(toLibraryItem);
    },
  });
}

export function useWatchlistPreview(limit = 6) {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id ?? "";
  return useQuery({
    queryKey: queryKeys.watchlistPreview(userId),
    enabled: !!userId,
    queryFn: async () => {
      const rows = await listUserMediaByStatus("watchlist");
      return rows.slice(0, limit).map(toWatchlistItem);
    },
  });
}

export function useUserMediaMutations() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.session?.user.id);

  const onSuccess = () => {
    if (userId) {
      invalidateUserMediaQueries(queryClient, userId);
    }
  };

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

  const addLibraryTheater = useMutation({
    mutationFn: ({
      snapshot,
      details,
    }: {
      snapshot: MediaSnapshot;
      details: TheaterWatchInput;
    }) => addToLibraryTheater(snapshot, details),
    onSuccess,
  });

  const remove = useMutation({
    mutationFn: (userMediaId: string) => removeUserMedia(userMediaId),
    onSuccess,
  });

  const removeTheater = useMutation({
    mutationFn: (userMediaId: string) => removeTheaterMembership(userMediaId),
    onSuccess,
  });

  const removeShelf = useMutation({
    mutationFn: (userMediaId: string) => removeShelfMembership(userMediaId),
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

  return {
    addWatchlist,
    addLibrary,
    addLibraryTheater,
    remove,
    removeTheater,
    removeShelf,
    setPriority,
  };
}
