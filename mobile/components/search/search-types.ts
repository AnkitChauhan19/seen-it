export type SearchMediaKind = "movie" | "tv" | "anime";

export type SearchMediaItem = {
  id: string;
  title: string;
  year: string;
  typeLabel: string;
  mediaKind: SearchMediaKind;
  rating: number;
  voteCountLabel: string;
  synopsis: string;
  posterPath: string;
};
