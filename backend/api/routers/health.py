from fastapi import APIRouter
from datetime import datetime, timezone
from config import settings

router = APIRouter(tags=["Health"])

@router.get("/healthz")
async def health_check():
    return {
        "status": "ok",
        "service": "skillgap-api",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "dataSource": settings.DATA_SOURCE,
        "database": "mock" if settings.DATA_SOURCE == "mock" else "connected"
    }
