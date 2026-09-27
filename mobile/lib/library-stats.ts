import type { LibraryListItem } from "@/lib/user-media-mappers";

export type LibraryFilterStats = {
  watchedCount: number;
  theatersCount: number;
  avgRating: number | null;
};

export function computeLibraryFilterStats(
  items: LibraryListItem[],
): LibraryFilterStats {
  const ratings = items
    .map((item) => item.personalRating)
    .filter((r): r is number => typeof r === "number");

  return {
    watchedCount: items.length,
    theatersCount: items.filter((item) => item.libraryCategory === "theaters")
      .length,
    avgRating:
      ratings.length > 0
        ? ratings.reduce((sum, n) => sum + n, 0) / ratings.length
        : null,
  };
}
