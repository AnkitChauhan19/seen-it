import type { WatchlistItem } from "@/components/watchlist/watchlist-item-card";
import type { WatchlistFilter } from "@/components/watchlist/watchlist-filter-chips";

export function filterWatchlistItems(
  items: WatchlistItem[],
  filter: WatchlistFilter,
): WatchlistItem[] {
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
