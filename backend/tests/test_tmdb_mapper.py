from app.services.tmdb_mapper import is_anime_tv, map_movie, map_tv


def test_map_movie_basic() -> None:
    item = map_movie(
        {
            "id": 157336,
            "title": "Interstellar",
            "release_date": "2014-11-07",
            "vote_average": 8.6,
            "vote_count": 2300000,
            "overview": "A team of explorers travel through a wormhole.",
            "poster_path": "/poster.jpg",
        }
    )
    assert item is not None
    assert item.id == "movie-157336"
    assert item.year == "2014"
    assert item.media_kind == "movie"


def test_map_tv_anime_classification() -> None:
    anime = {
        "id": 37854,
        "name": "One Piece",
        "first_air_date": "1999-10-20",
        "origin_country": ["JP"],
        "genre_ids": [16, 35],
        "vote_average": 8.7,
        "vote_count": 520000,
        "overview": "Pirates.",
        "poster_path": "/one-piece.jpg",
    }
    mapped = map_tv(anime)
    assert mapped is not None
    assert mapped.media_kind == "anime"
    assert is_anime_tv(anime) is True


def test_map_tv_non_anime() -> None:
    show = {
        "id": 1396,
        "name": "Breaking Bad",
        "first_air_date": "2008-01-20",
        "origin_country": ["US"],
        "genre_ids": [18, 80],
        "vote_average": 9.5,
        "vote_count": 1800000,
        "overview": "Chemistry teacher.",
        "poster_path": "/bb.jpg",
    }
    mapped = map_tv(show)
    assert mapped is not None
    assert mapped.media_kind == "tv"
