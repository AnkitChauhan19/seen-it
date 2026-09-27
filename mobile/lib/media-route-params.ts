import type { SearchMediaItem } from "@/components/search/search-types";
import type { MediaSnapshot } from "@/types/user-media";

export type MediaDetailParams = {
  id: string;
  title?: string;
  year?: string;
  typeLabel?: string;
  posterPath?: string;
  synopsis?: string;
  rating?: string;
  mediaKind?: string;
};

export function searchItemToRouteParams(
  item: SearchMediaItem,
): MediaDetailParams {
  return {
    id: item.id,
    title: item.title,
    year: item.year,
    typeLabel: item.typeLabel,
    posterPath: item.posterPath,
    synopsis: item.synopsis,
    rating: String(item.rating),
    mediaKind: item.mediaKind,
  };
}

function oneParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function paramsToMediaSnapshot(
  params: Record<string, string | string[] | undefined>,
): MediaSnapshot | null {
  const id = oneParam(params.id);
  const title = oneParam(params.title);
  if (!id || !title) return null;
  const rating = oneParam(params.rating);
  return {
    compositeId: id,
    title,
    releaseYear: oneParam(params.year),
    posterPath: oneParam(params.posterPath),
    overview: oneParam(params.synopsis),
    voteAverage: rating ? Number.parseFloat(rating) : undefined,
    mediaKind: oneParam(params.mediaKind) as MediaSnapshot["mediaKind"],
  };
}
