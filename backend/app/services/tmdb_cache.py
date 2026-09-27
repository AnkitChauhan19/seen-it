from __future__ import annotations

import hashlib
import json
import time
from collections import OrderedDict
from typing import Any


class TTLCache:
    """Small in-memory TTL cache for upstream TMDB responses."""

    def __init__(self, max_entries: int = 256) -> None:
        self._max_entries = max_entries
        self._store: OrderedDict[str, tuple[float, Any]] = OrderedDict()

    def _evict_expired(self, now: float) -> None:
        expired_keys = [key for key, (expires_at, _) in self._store.items() if expires_at <= now]
        for key in expired_keys:
            self._store.pop(key, None)

    def get(self, key: str) -> Any | None:
        now = time.monotonic()
        self._evict_expired(now)
        entry = self._store.get(key)
        if not entry:
            return None
        expires_at, value = entry
        if expires_at <= now:
            self._store.pop(key, None)
            return None
        self._store.move_to_end(key)
        return value

    def set(self, key: str, value: Any, ttl_seconds: float) -> None:
        now = time.monotonic()
        self._evict_expired(now)
        if key in self._store:
            self._store.move_to_end(key)
        self._store[key] = (now + ttl_seconds, value)
        while len(self._store) > self._max_entries:
            self._store.popitem(last=False)

    @staticmethod
    def make_key(path: str, params: dict[str, Any]) -> str:
        payload = json.dumps({"path": path, "params": params}, sort_keys=True, default=str)
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()
