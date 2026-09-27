from __future__ import annotations

from typing import Any

from app.core.config import Settings
from app.schemas.media import MediaSearchItem, PaginatedMediaResponse, SearchFacetCounts
from app.services.tmdb_client import TmdbClient
from app.services.tmdb_mapper import (
    filter_by_search_filter,
    map_movie,
    map_multi,
    map_tv,
)


class TmdbService:
    def __init__(self, client: TmdbClient, settings: Settings) -> None:
        self._client = client
        self._settings = settings

    async def search(
        self,
        query: str,
        search_filter: str,
        page: int,
    ) -> PaginatedMediaResponse:
        page = max(1, min(page, self._settings.tmdb_max_page))
        cache_ttl = self._settings.tmdb_search_cache_ttl_seconds

        if search_filter == "movie":
            payload = await self._client.get_json(
                "/search/movie",
                {"query": query, "page": page, "include_adult": "false"},
                cache_ttl=cache_ttl,
            )
            results = [mapped for item in payload.get("results", []) if (mapped := map_movie(item))]
        elif search_filter in {"tv", "anime"}:
            payload = await self._client.get_json(
                "/search/tv",
                {"query": query, "page": page, "include_adult": "false"},
                cache_ttl=cache_ttl,
            )
            mapped = [mapped for item in payload.get("results", []) if (mapped := map_tv(item))]
            results = filter_by_search_filter(mapped, search_filter)
        else:
            payload = await self._client.get_json(
                "/search/multi",
                {"query": query, "page": page, "include_adult": "false"},
                cache_ttl=cache_ttl,
            )
            results = [
                mapped
                for item in payload.get("results", [])
                if (mapped := map_multi(item))
            ]

        counts = None
        if page == 1:
            try:
                multi_for_counts = payload if search_filter == "all" else None
                counts = await self._search_facet_counts(
                    query,
                    cache_ttl,
                    multi_payload=multi_for_counts,
                )
            except Exception:
                counts = None

        return PaginatedMediaResponse(
            page=payload.get("page", page),
            total_pages=min(payload.get("total_pages", 1), self._settings.tmdb_max_page),
            total_results=int(payload.get("total_results", len(results))),
            results=results,
            counts=counts,
        )

    async def _search_facet_counts(
        self,
        query: str,
        cache_ttl: float,
        *,
        multi_payload: dict[str, Any] | None = None,
    ) -> SearchFacetCounts:
        params = {"query": query, "page": 1, "include_adult": "false"}

        if multi_payload is None:
            multi_payload = await self._client.get_json(
                "/search/multi",
                params,
                cache_ttl=cache_ttl,
            )
        movie_payload = await self._client.get_json(
            "/search/movie",
            params,
            cache_ttl=cache_ttl,
        )
        tv_payload = await self._client.get_json(
            "/search/tv",
            params,
            cache_ttl=cache_ttl,
        )

        tv_mapped = [mapped for item in tv_payload.get("results", []) if (mapped := map_tv(item))]
        anime_count = sum(1 for item in tv_mapped if item.media_kind == "anime")

        return SearchFacetCounts(
            all=int(multi_payload.get("total_results", 0)),
            movie=int(movie_payload.get("total_results", 0)),
            tv=int(tv_payload.get("total_results", 0)),
            anime=anime_count,
        )

    async def trending(self, search_filter: str) -> list[MediaSearchItem]:
        cache_ttl = self._settings.tmdb_discover_cache_ttl_seconds
        if search_filter == "movie":
            path = "/trending/movie/week"
        elif search_filter in {"tv", "anime"}:
            path = "/trending/tv/week"
        else:
            path = "/trending/all/week"

        payload = await self._client.get_json(path, {"page": 1}, cache_ttl=cache_ttl)
        results: list[MediaSearchItem] = []
        for item in payload.get("results", []):
            media_type = item.get("media_type")
            if media_type == "movie" or (media_type is None and path.endswith("movie/week")):
                mapped = map_movie(item)
            else:
                mapped = map_tv(item) if media_type in {None, "tv"} else map_multi(item)
            if mapped:
                results.append(mapped)

        return filter_by_search_filter(results, search_filter)[:20]

    async def popular_movies(self) -> list[MediaSearchItem]:
        payload = await self._client.get_json(
            "/movie/popular",
            {"page": 1},
            cache_ttl=self._settings.tmdb_discover_cache_ttl_seconds,
        )
        results = [mapped for item in payload.get("results", []) if (mapped := map_movie(item))]
        return results[:20]
