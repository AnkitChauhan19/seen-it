from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Request

from app.core.config import Settings, get_settings
from app.services.tmdb_client import TmdbClient
from app.services.tmdb_service import TmdbService


def get_tmdb_client(request: Request) -> TmdbClient:
    client = request.app.state.tmdb_client
    if client is None:
        raise RuntimeError("TMDB client is not initialized")
    return client


def get_tmdb_service(
    client: Annotated[TmdbClient, Depends(get_tmdb_client)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> TmdbService:
    return TmdbService(client, settings)
