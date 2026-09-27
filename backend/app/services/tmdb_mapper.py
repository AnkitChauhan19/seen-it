from __future__ import annotations

from typing import Any

from app.schemas.media import MediaKind, MediaSearchItem

ANIMATION_GENRE_ID = 16


def _format_vote_count(count: int) -> str:
    if count >= 1_000_000:
        return f"{count / 1_000_000:.1f}M votes".replace(".0M", "M")
    if count >= 1_000:
        return f"{count / 1_000:.0f}K votes"
    if count > 0:
        return f"{count} votes"
    return ""


def _year_from_date(value: str | None) -> str | None:
    if not value or len(value) < 4:
        return None
    return value[:4]


def is_anime_tv(item: dict[str, Any]) -> bool:
    origin = item.get("origin_country") or []
    if "JP" not in origin:
        return False
    genre_ids = item.get("genre_ids") or []
    return ANIMATION_GENRE_ID in genre_ids or bool(item.get("original_language") == "ja")


def classify_tv_kind(item: dict[str, Any]) -> MediaKind:
    return "anime" if is_anime_tv(item) else "tv"


def media_kind_for_item(item: dict[str, Any], media_type: str) -> MediaKind:
    if media_type == "movie":
        return "movie"
    return classify_tv_kind(item)


def type_label_for_kind(kind: MediaKind) -> str:
    if kind == "movie":
        return "Movie"
    if kind == "anime":
        return "Anime"
    return "TV Show"


def map_movie(item: dict[str, Any]) -> MediaSearchItem | None:
    tmdb_id = item.get("id")
    if not tmdb_id:
        return None

    title = item.get("title") or item.get("name") or ""
    if not title:
        return None

    vote_count = int(item.get("vote_count") or 0)
    return MediaSearchItem(
        id=f"movie-{tmdb_id}",
        tmdb_id=tmdb_id,
        title=title,
        year=_year_from_date(item.get("release_date")),
        type_label="Movie",
        media_kind="movie",
        rating=item.get("vote_average"),
        vote_count=vote_count,
        vote_count_label=_format_vote_count(vote_count),
        synopsis=(item.get("overview") or "").strip(),
        poster_path=item.get("poster_path"),
    )


def map_tv(item: dict[str, Any]) -> MediaSearchItem | None:
    tmdb_id = item.get("id")
    if not tmdb_id:
        return None

    title = item.get("name") or item.get("title") or ""
    if not title:
        return None

    kind = classify_tv_kind(item)
    vote_count = int(item.get("vote_count") or 0)
    return MediaSearchItem(
        id=f"tv-{tmdb_id}",
        tmdb_id=tmdb_id,
        title=title,
        year=_year_from_date(item.get("first_air_date")),
        type_label=type_label_for_kind(kind),
        media_kind=kind,
        rating=item.get("vote_average"),
        vote_count=vote_count,
        vote_count_label=_format_vote_count(vote_count),
        synopsis=(item.get("overview") or "").strip(),
        poster_path=item.get("poster_path"),
    )


def map_multi(item: dict[str, Any]) -> MediaSearchItem | None:
    media_type = item.get("media_type")
    if media_type == "movie":
        return map_movie(item)
    if media_type == "tv":
        return map_tv(item)
    return None


def filter_by_search_filter(
    items: list[MediaSearchItem],
    search_filter: str,
) -> list[MediaSearchItem]:
    if search_filter == "all":
        return items
    if search_filter == "movie":
        return [item for item in items if item.media_kind == "movie"]
    if search_filter == "anime":
        return [item for item in items if item.media_kind == "anime"]
    if search_filter == "tv":
        return [item for item in items if item.media_kind == "tv"]
    return items
