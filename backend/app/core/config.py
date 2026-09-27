from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "SeenIt"
    app_env: str = "development"
    debug: bool = True

    cors_origins: str = "http://localhost:8081,http://localhost:19006"

    supabase_url: str = ""
    supabase_publishable_key: str = ""
    supabase_secret_key: str = ""

    tmdb_api_key: str = ""
    tmdb_base_url: str = "https://api.themoviedb.org/3"
    tmdb_timeout_seconds: float = 20.0
    tmdb_max_requests_per_second: float = 8.0
    tmdb_max_page: int = 5
    tmdb_cache_max_entries: int = 512
    tmdb_discover_cache_ttl_seconds: int = 600
    tmdb_search_cache_ttl_seconds: int = 120
    tmdb_prefer_ipv4: bool = True
    tmdb_max_retries: int = 3

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
