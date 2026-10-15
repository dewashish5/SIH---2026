import uuid
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from config import settings
from routers.health import router as health_router
from routers.live import router as live_router, start_sync_scheduler, stop_sync_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_sync_scheduler()
    yield
    stop_sync_scheduler()

app = FastAPI(
    title="SkillGap Intelligence API",
    description="Labour Market Intelligence and Skill Demand-Supply Forecasting Engine (MSDE / SIH 2026)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_request_id_middleware(request: Request, call_next):
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    response = await call_next(request)
    response.headers["x-request-id"] = request_id
    return response

# Standard error handler for consistent envelope
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": str(exc),
                "details": None
            }
        }
    )

# Routers
from routers.dimensions import router as dimensions_router
from routers.forecast import router as forecast_router
from routers.gap import router as gap_router
from routers.alerts import router as alerts_router
from routers.whatif import router as whatif_router
from routers.recommendations import router as recommendations_router
from routers.trade import router as trade_router
from routers.geo import router as geo_router
from routers.meta import router as meta_router
from routers.graph import router as graph_router

app.include_router(health_router)
for r in [
    dimensions_router, forecast_router, gap_router, alerts_router,
    whatif_router, recommendations_router, trade_router, geo_router, meta_router,
    live_router, graph_router
]:
    app.include_router(r)
    app.include_router(r, prefix="/api")
    app.include_router(r, prefix="/v1")
    app.include_router(r, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
