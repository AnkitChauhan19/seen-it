import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  CUSTOM_THEATER_FORMATS_STORAGE_KEY,
  DEFAULT_THEATER_FORMATS,
} from "@/constants/theater";

export function sortFormatOptions(options: string[]): string[] {
  const unique = [...new Set(options.map((o) => o.trim()).filter(Boolean))];
  return unique.sort((a, b) => {
    const aStartsWithDigit = /^\d/.test(a);
    const bStartsWithDigit = /^\d/.test(b);
    if (aStartsWithDigit && !bStartsWithDigit) return -1;
    if (!aStartsWithDigit && bStartsWithDigit) return 1;
    return a.localeCompare(b, undefined, { sensitivity: "base" });
  });
}

export async function loadCustomTheaterFormats(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(CUSTOM_THEATER_FORMATS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export async function saveCustomTheaterFormat(format: string): Promise<string[]> {
  const trimmed = format.trim();
  if (!trimmed) return loadAllTheaterFormats();

  const custom = await loadCustomTheaterFormats();
  const merged = sortFormatOptions([...custom, trimmed]);
  await AsyncStorage.setItem(
    CUSTOM_THEATER_FORMATS_STORAGE_KEY,
    JSON.stringify(merged),
  );
  return loadAllTheaterFormats();
}

export async function loadAllTheaterFormats(): Promise<string[]> {
  const custom = await loadCustomTheaterFormats();
  return sortFormatOptions([...DEFAULT_THEATER_FORMATS, ...custom]);
}

export function filterFormatOptions(options: string[], query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  return options.filter((opt) => opt.toLowerCase().includes(q));
}
