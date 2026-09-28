import { parseCompositeMediaId } from "@/lib/parse-media-id";
import {
  LIBRARY_ADD_OPTIONS,
  LIBRARY_CATEGORY_LABELS,
  type LibraryCategory,
  type MediaSnapshot,
  type UserMediaRow,
} from "@/types/user-media";

export type ShelfLibraryCategory = Exclude<LibraryCategory, "theaters">;

export function normalizeShelfCategory(
  category: LibraryCategory | null | undefined,
): ShelfLibraryCategory | null {
  if (!category || category === "theaters") return null;
  return category;
}

export function rowHasTheaterMembership(row: UserMediaRow): boolean {
  const raw = row.theater_watch;
  if (!raw) return false;
  return Array.isArray(raw) ? raw.length > 0 : true;
}

export function isTheaterEligibleSnapshot(snapshot: MediaSnapshot): boolean {
  if (snapshot.mediaKind === "anime" || snapshot.mediaKind === "tv") {
    return false;
  }
  const parsed = parseCompositeMediaId(snapshot.compositeId);
  return parsed?.tmdbMediaType === "movie";
}

export function isTheaterEligibleRow(row: UserMediaRow): boolean {
  return row.media.tmdb_media_type === "movie" && !row.media.is_anime;
}

export function libraryMembershipLabels(row: UserMediaRow): string[] {
  const labels: string[] = [];
  const shelf = normalizeShelfCategory(row.library_category);
  if (shelf) labels.push(LIBRARY_CATEGORY_LABELS[shelf]);
  if (rowHasTheaterMembership(row)) {
    labels.push(LIBRARY_CATEGORY_LABELS.theaters);
  }
  return labels;
}

export function hasAnyLibraryMembership(row: UserMediaRow): boolean {
  return (
    row.status === "watched" &&
    (normalizeShelfCategory(row.library_category) !== null ||
      rowHasTheaterMembership(row))
  );
}

export function availableLibraryAddOptions(
  row: UserMediaRow | null | undefined,
  snapshot: MediaSnapshot | null,
): { category: LibraryCategory; label: string }[] {
  const shelf = row ? normalizeShelfCategory(row.library_category) : null;
  const inTheaters = row ? rowHasTheaterMembership(row) : false;
  const theaterOk = snapshot ? isTheaterEligibleSnapshot(snapshot) : false;

  return LIBRARY_ADD_OPTIONS.filter((opt) => {
    if (opt.category === "theaters") {
      return theaterOk && !inTheaters;
    }
    if (shelf === opt.category) return false;
    return true;
  });
}
