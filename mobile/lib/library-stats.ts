import type { LibraryListItem } from "@/lib/user-media-mappers";

export type LibraryFilterStats = {
  watchedCount: number;
  theatersCount: number;
};

export function computeLibraryFilterStats(
  items: LibraryListItem[],
): LibraryFilterStats {
  return {
    watchedCount: items.length,
    theatersCount: items.filter((item) => item.inTheaters).length,
  };
}
