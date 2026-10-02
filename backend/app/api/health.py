from fastapi import APIRouter

from app.schemas.health import HealthResponse

router = APIRouter()


@router.api_route("/health", methods=["GET", "HEAD"], response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(status="ok")
