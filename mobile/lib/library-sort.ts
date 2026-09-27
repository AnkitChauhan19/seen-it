import type { LibraryListItem } from "@/lib/user-media-mappers";

export type LibrarySortOption =
  | "recent"
  | "title_asc"
  | "title_desc"
  | "year_desc"
  | "year_asc";

export const LIBRARY_SORT_LABELS: Record<LibrarySortOption, string> = {
  recent: "Recently added",
  title_asc: "Title (A–Z)",
  title_desc: "Title (Z–A)",
  year_desc: "Year (newest)",
  year_asc: "Year (oldest)",
};

function parseYear(year: string): number {
  const n = Number.parseInt(year, 10);
  return Number.isFinite(n) ? n : 0;
}

export function sortLibraryItems(
  items: LibraryListItem[],
  sort: LibrarySortOption,
): LibraryListItem[] {
  const copy = [...items];

  copy.sort((a, b) => {
    if (sort === "title_asc") {
      return a.title.localeCompare(b.title);
    }
    if (sort === "title_desc") {
      return b.title.localeCompare(a.title);
    }
    if (sort === "year_asc") {
      return parseYear(a.year) - parseYear(b.year);
    }
    if (sort === "year_desc") {
      return parseYear(b.year) - parseYear(a.year);
    }
    if (sort === "recent") {
      return b.updatedAt.localeCompare(a.updatedAt);
    }
    return 0;
  });

  return copy;
}

export function filterItemsBySearchQuery<T extends { title: string }>(
  items: T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => item.title.toLowerCase().includes(q));
}
