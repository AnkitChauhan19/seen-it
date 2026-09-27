import asyncio

from app.core.config import settings
from app.services.tmdb_client import TmdbClient


async def main() -> None:
    client = TmdbClient(settings)
    await client.start()
    trending = await client.get_json("/trending/movie/week", {"page": 1}, cache_ttl=0)
    print("trending", len(trending.get("results", [])))
    search = await client.get_json(
        "/search/multi",
        {"query": "breaking bad", "page": 1, "include_adult": "false"},
        cache_ttl=0,
    )
    print("search", len(search.get("results", [])))
    await client.close()


if __name__ == "__main__":
    asyncio.run(main())
