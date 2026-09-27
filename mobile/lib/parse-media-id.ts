export type ParsedMediaId = {
  tmdbId: number;
  tmdbMediaType: "movie" | "tv";
  compositeId: string;
};

export function parseCompositeMediaId(id: string): ParsedMediaId | null {
  const match = /^(movie|tv)-(\d+)$/.exec(id.trim());
  if (!match) {
    return null;
  }
  return {
    tmdbMediaType: match[1] as "movie" | "tv",
    tmdbId: Number.parseInt(match[2], 10),
    compositeId: `${match[1]}-${match[2]}`,
  };
}

export function toCompositeMediaId(
  tmdbMediaType: "movie" | "tv",
  tmdbId: number,
): string {
  return `${tmdbMediaType}-${tmdbId}`;
}
