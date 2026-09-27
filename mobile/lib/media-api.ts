import { apiFetch } from "@/lib/api";
import type { SearchMediaItem } from "@/components/search/search-types";
import type { SearchFilter } from "@/components/search/search-filter-chips";

export const MIN_SEARCH_QUERY_LENGTH = 2;

export type ApiSearchFilter = "all" | "movie" | "tv" | "anime";

export type MediaSearchItemDto = {
  id: string;
  tmdb_id: number;
  title: string;
  year: string | null;
  type_label: string;
  media_kind: "movie" | "tv" | "anime";
  rating: number | null;
  vote_count: number;
  vote_count_label: string;
  synopsis: string;
  poster_path: string | null;
};

export type SearchFacetCountsDto = {
  all: number;
  movie: number;
  tv: number;
  anime: number;
};

export type PaginatedMediaResponseDto = {
  page: number;
  total_pages: number;
  total_results: number;
  results: MediaSearchItemDto[];
  counts: SearchFacetCountsDto | null;
};

export type MediaListResponseDto = {
  results: MediaSearchItemDto[];
};

export function searchFilterToApi(filter: SearchFilter): ApiSearchFilter {
  if (filter === "Movies") return "movie";
  if (filter === "TV Shows") return "tv";
  if (filter === "Anime") return "anime";
  return "all";
}

export function mapMediaDto(dto: MediaSearchItemDto): SearchMediaItem {
  return {
    id: dto.id,
    title: dto.title,
    year: dto.year ?? "—",
    typeLabel: dto.type_label,
    mediaKind: dto.media_kind,
    rating: dto.rating ?? 0,
    voteCountLabel: dto.vote_count_label,
    synopsis: dto.synopsis,
    posterPath: dto.poster_path ?? "",
  };
}

export function mapFacetCounts(
  counts: SearchFacetCountsDto | null | undefined,
): Record<SearchFilter, number> | undefined {
  if (!counts) return undefined;
  return {
    All: counts.all,
    Movies: counts.movie,
    "TV Shows": counts.tv,
    Anime: counts.anime,
  };
}

export async function fetchMediaSearch(params: {
  q: string;
  filter: ApiSearchFilter;
  page: number;
}): Promise<PaginatedMediaResponseDto> {
  const search = new URLSearchParams({
    q: params.q,
    filter: params.filter,
    page: String(params.page),
  });
  return apiFetch<PaginatedMediaResponseDto>(`/api/v1/media/search?${search}`);
}

export async function fetchTrendingMedia(
  filter: ApiSearchFilter,
): Promise<SearchMediaItem[]> {
  const search = new URLSearchParams({ filter });
  const data = await apiFetch<MediaListResponseDto>(
    `/api/v1/media/trending?${search}`,
  );
  return data.results.map(mapMediaDto);
}

export async function fetchPopularMovies(): Promise<SearchMediaItem[]> {
  const data = await apiFetch<MediaListResponseDto>("/api/v1/media/popular-movies");
  return data.results.map(mapMediaDto);
}
