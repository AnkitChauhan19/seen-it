import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";

import {
  normalizeShelfCategory,
  rowHasTheaterMembership,
} from "@/lib/library-membership";
import { listUserMediaByStatus } from "@/lib/user-media-repository";
import { libraryCategoryLabel, mediaTypeLabel } from "@/lib/user-media-mappers";
import type { TheaterWatchRow, UserMediaRow } from "@/types/user-media";

function theaterRow(row: UserMediaRow): TheaterWatchRow | null {
  const raw = row.theater_watch;
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

function exportFileName(): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `seenit-export-${stamp}.xlsx`;
}

export async function exportUserDataSpreadsheet(): Promise<void> {
  const [watched, watchlist] = await Promise.all([
    listUserMediaByStatus("watched"),
    listUserMediaByStatus("watchlist"),
  ]);

  const librarySheet = watched
    .filter((row) => normalizeShelfCategory(row.library_category) !== null)
    .map((row) => {
      const shelf = normalizeShelfCategory(row.library_category)!;
      return {
        Title: row.media.title,
        "Release Year": row.media.release_year ?? "",
        Type: libraryCategoryLabel(shelf),
      };
    });

  const theatresSheet = watched
    .filter((row) => rowHasTheaterMembership(row))
    .map((row) => {
      const visit = theaterRow(row);
      return {
        Title: row.media.title,
        "Release Year": row.media.release_year ?? "",
        "Theatre Name": visit?.theater_name ?? "",
        Language: visit?.language ?? "",
        Format: visit?.format ?? "",
      };
    });

  const watchlistSheet = watchlist.map((row) => ({
    Title: row.media.title,
    "Release Year": row.media.release_year ?? "",
    Type: mediaTypeLabel(row),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(librarySheet),
    "Library",
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(theatresSheet),
    "Theatres",
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(watchlistSheet),
    "Watchlist",
  );

  const base64 = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
  const directory = FileSystem.documentDirectory;
  if (!directory) {
    throw new Error("File storage is not available on this device.");
  }

  const fileUri = `${directory}${exportFileName()}`;
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Sharing is not available on this device.");
  }

  await Sharing.shareAsync(fileUri, {
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    dialogTitle: "Export SeenIt data",
    UTI: "com.microsoft.excel.xlsx",
  });
}
