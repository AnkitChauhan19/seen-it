import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import type { SearchFilter } from "@/components/search/search-filter-chips";
import {
  fetchMediaSearch,
  fetchPopularMovies,
  fetchTrendingMedia,
  mapFacetCounts,
  mapMediaDto,
  MIN_SEARCH_QUERY_LENGTH,
  searchFilterToApi,
} from "@/lib/media-api";

export function useTrendingMedia(filter: SearchFilter) {
  const apiFilter = searchFilterToApi(filter);
  return useQuery({
    queryKey: ["media", "trending", apiFilter],
    queryFn: () => fetchTrendingMedia(apiFilter),
    staleTime: 5 * 60_000,
  });
}

export function usePopularMovies() {
  return useQuery({
    queryKey: ["media", "popular-movies"],
    queryFn: fetchPopularMovies,
    staleTime: 5 * 60_000,
  });
}

export function useMediaSearch(debouncedQuery: string, filter: SearchFilter) {
  const trimmed = debouncedQuery.trim();
  const apiFilter = searchFilterToApi(filter);
  const enabled = trimmed.length >= MIN_SEARCH_QUERY_LENGTH;

  return useInfiniteQuery({
    queryKey: ["media", "search", trimmed, apiFilter],
    enabled,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchMediaSearch({ q: trimmed, filter: apiFilter, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page >= lastPage.total_pages) {
        return undefined;
      }
      return lastPage.page + 1;
    },
    staleTime: 60_000,
  });
}

export function flattenSearchPages(
  data: ReturnType<typeof useMediaSearch>["data"],
) {
  if (!data) return [];
  return data.pages.flatMap((page) => page.results.map(mapMediaDto));
}

export function searchCountsFromPages(
  data: ReturnType<typeof useMediaSearch>["data"],
): Record<SearchFilter, number> | undefined {
  const firstPage = data?.pages[0];
  return mapFacetCounts(firstPage?.counts);
}
