from __future__ import annotations

import asyncio
import logging
import socket
import time
from typing import Any

import httpx

from app.core.config import Settings, settings
from app.services.tmdb_cache import TTLCache

logger = logging.getLogger(__name__)

_original_getaddrinfo = socket.getaddrinfo
_ipv4_patch_applied = False


def _apply_ipv4_preference_if_needed(enabled: bool) -> None:
    global _ipv4_patch_applied
    if not enabled or _ipv4_patch_applied:
        return

    def prefer_ipv4_getaddrinfo(
        host: str,
        port: str | int | None,
        family: int = 0,
        type: int = 0,
        proto: int = 0,
        flags: int = 0,
    ):
        results = _original_getaddrinfo(host, port, family, type, proto, flags)
        v4 = [entry for entry in results if entry[0] == socket.AF_INET]
        return v4 if v4 else results

    socket.getaddrinfo = prefer_ipv4_getaddrinfo  # type: ignore[assignment]
    _ipv4_patch_applied = True


_apply_ipv4_preference_if_needed(settings.tmdb_prefer_ipv4)


class TmdbError(Exception):
    def __init__(self, message: str, status_code: int = 502) -> None:
        super().__init__(message)
        self.status_code = status_code


class TmdbClient:
    """TMDB HTTP client (sync httpx in a thread pool — reliable on Windows)."""

    def __init__(self, app_settings: Settings) -> None:
        self._settings = app_settings
        self._cache = TTLCache(max_entries=app_settings.tmdb_cache_max_entries)
        self._client: httpx.Client | None = None
        self._lock = asyncio.Lock()
        self._min_interval = 1.0 / max(app_settings.tmdb_max_requests_per_second, 1)
        self._last_request_at = 0.0

    def _build_client(self) -> httpx.Client:
        return httpx.Client(
            base_url=self._settings.tmdb_base_url.rstrip("/"),
            timeout=httpx.Timeout(self._settings.tmdb_timeout_seconds),
            limits=httpx.Limits(
                max_connections=5,
                max_keepalive_connections=0,
            ),
            headers={
                "Accept": "application/json",
                "Connection": "close",
            },
        )

    async def start(self) -> None:
        if self._client is not None:
            return
        _apply_ipv4_preference_if_needed(self._settings.tmdb_prefer_ipv4)
        self._client = self._build_client()

    async def close(self) -> None:
        if self._client is not None:
            await asyncio.to_thread(self._client.close)
            self._client = None

    def _reset_client(self) -> None:
        if self._client is not None:
            try:
                self._client.close()
            except Exception:
                pass
            self._client = None

    async def _throttle(self) -> None:
        async with self._lock:
            now = asyncio.get_event_loop().time()
            wait_for = self._min_interval - (now - self._last_request_at)
            if wait_for > 0:
                await asyncio.sleep(wait_for)
            self._last_request_at = asyncio.get_event_loop().time()

    def _request_sync_with_retry(self, path: str, query: dict[str, Any]) -> httpx.Response:
        attempts = max(1, self._settings.tmdb_max_retries)
        last_error: Exception | None = None

        for attempt in range(attempts):
            if self._client is None:
                self._client = self._build_client()

            try:
                return self._client.get(path, params=query)
            except (httpx.RequestError, OSError) as exc:
                last_error = exc
                logger.warning(
                    "TMDB attempt %s/%s failed for %s: %s",
                    attempt + 1,
                    attempts,
                    path,
                    exc,
                )
                self._reset_client()
                if attempt + 1 < attempts:
                    time.sleep(0.2 * (attempt + 1))

        assert last_error is not None
        raise last_error

    async def get_json(
        self,
        path: str,
        params: dict[str, Any] | None = None,
        *,
        cache_ttl: float | None = None,
    ) -> dict[str, Any]:
        if not self._settings.tmdb_api_key:
            raise TmdbError("TMDB API key is not configured", status_code=503)

        if self._client is None:
            await self.start()

        query = dict(params or {})
        cache_key = TTLCache.make_key(path, query)
        if cache_ttl and cache_ttl > 0:
            cached = self._cache.get(cache_key)
            if cached is not None:
                return cached

        await self._throttle()

        query["api_key"] = self._settings.tmdb_api_key
        try:
            response = await asyncio.to_thread(
                self._request_sync_with_retry,
                path,
                query,
            )
        except httpx.TimeoutException:
            raise TmdbError(
                "Could not reach TMDB (connection timed out). Check your internet or try again.",
                status_code=503,
            ) from None
        except (httpx.RequestError, OSError) as exc:
            logger.warning("TMDB request error for %s: %s", path, exc)
            raise TmdbError(
                "Could not reach TMDB. Check your network connection.",
                status_code=503,
            ) from exc

        if response.status_code == 401:
            raise TmdbError("Invalid TMDB API key on the server", status_code=503)
        if response.status_code == 429:
            raise TmdbError("TMDB rate limit exceeded. Try again shortly.", status_code=429)
        if response.status_code >= 500:
            raise TmdbError("TMDB is temporarily unavailable", status_code=502)
        if response.status_code != 200:
            logger.warning("TMDB error %s for %s", response.status_code, path)
            raise TmdbError("TMDB request failed", status_code=502)

        data = response.json()
        if cache_ttl and cache_ttl > 0:
            self._cache.set(cache_key, data, cache_ttl)
        return data
