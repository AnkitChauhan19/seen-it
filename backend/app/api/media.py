from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.core.limiter import limiter
from app.deps import get_tmdb_service
from app.schemas.media import MediaListResponse, PaginatedMediaResponse
from app.services.tmdb_client import TmdbError
from app.services.tmdb_service import TmdbService

router = APIRouter(prefix="/media", tags=["media"])

SearchFilterParam = Literal["all", "movie", "tv", "anime"]


@router.get("/search", response_model=PaginatedMediaResponse)
@limiter.limit("45/minute")
async def search_media(
    request: Request,
    tmdb: Annotated[TmdbService, Depends(get_tmdb_service)],
    q: Annotated[str, Query(min_length=2, max_length=80, description="Search query")],
    filter: SearchFilterParam = "all",
    page: Annotated[int, Query(ge=1, le=10)] = 1,
) -> PaginatedMediaResponse:
    try:
        return await tmdb.search(query=q.strip(), search_filter=filter, page=page)
    except TmdbError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc


@router.get("/trending", response_model=MediaListResponse)
@limiter.limit("60/minute")
async def trending_media(
    request: Request,
    tmdb: Annotated[TmdbService, Depends(get_tmdb_service)],
    filter: SearchFilterParam = "all",
) -> MediaListResponse:
    try:
        results = await tmdb.trending(search_filter=filter)
        return MediaListResponse(results=results)
    except TmdbError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc


@router.get("/popular-movies", response_model=MediaListResponse)
@limiter.limit("60/minute")
async def popular_movies(
    request: Request,
    tmdb: Annotated[TmdbService, Depends(get_tmdb_service)],
) -> MediaListResponse:
    try:
        results = await tmdb.popular_movies()
        return MediaListResponse(results=results)
    except TmdbError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
