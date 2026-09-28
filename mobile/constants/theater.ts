export const THEATER_LANGUAGES = ["English", "Hindi"] as const;

export type TheaterLanguage = (typeof THEATER_LANGUAGES)[number];

export const DEFAULT_THEATER_FORMATS = [
  "2D",
  "3D",
  "4DX",
  "IMAX 2D",
  "IMAX 3D",
  "P[XL] 2D",
  "P[XL] 3D",
  "ScreenX",
] as const;

export const CUSTOM_THEATER_FORMATS_STORAGE_KEY = "seenit:custom-theater-formats";
