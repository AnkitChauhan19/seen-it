from typing import Literal

from pydantic import BaseModel, Field

MediaKind = Literal["movie", "tv", "anime"]
SearchFilter = Literal["all", "movie", "tv", "anime"]


class MediaSearchItem(BaseModel):
    id: str = Field(description="Stable id: {type}-{tmdb_id}")
    tmdb_id: int
    title: str
    year: str | None = None
    type_label: str
    media_kind: MediaKind
    rating: float | None = None
    vote_count: int = 0
    vote_count_label: str = ""
    synopsis: str = ""
    poster_path: str | None = None


class SearchFacetCounts(BaseModel):
    all: int = 0
    movie: int = 0
    tv: int = 0
    anime: int = 0


class PaginatedMediaResponse(BaseModel):
    page: int
    total_pages: int
    total_results: int
    results: list[MediaSearchItem]
    counts: SearchFacetCounts | None = None


class MediaListResponse(BaseModel):
    results: list[MediaSearchItem]
