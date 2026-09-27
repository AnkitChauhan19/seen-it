import type { SearchMediaItem } from "@/components/search/search-types";
import type { SearchFilter } from "@/components/search/search-filter-chips";

export function filterSearchItems(
  items: SearchMediaItem[],
  filter: SearchFilter,
): SearchMediaItem[] {
  if (filter === "All") {
    return items;
  }

  if (filter === "Movies") {
    return items.filter((item) => item.mediaKind === "movie");
  }

  if (filter === "TV Shows") {
    return items.filter((item) => item.mediaKind === "tv");
  }

  if (filter === "Anime") {
    return items.filter((item) => item.mediaKind === "anime");
  }

  return items;
}

export function searchFilterCounts(
  items: SearchMediaItem[],
): Record<SearchFilter, number> {
  return {
    All: items.length,
    Movies: items.filter((item) => item.mediaKind === "movie").length,
    "TV Shows": items.filter((item) => item.mediaKind === "tv").length,
    Anime: items.filter((item) => item.mediaKind === "anime").length,
  };
}
