from fastapi import APIRouter

from app.api import health, media

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(media.router, prefix="/api/v1")
