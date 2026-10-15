import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_live_sources_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/live/sources")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ONLINE_ACTIVE"
        assert "ncs" in data["sources"]
        assert "pmkvy" in data["sources"]
        assert "nqr" in data["sources"]
        assert data["syncIntervalMinutes"] == 10
        assert data["districtsCount"] > 0

@pytest.mark.asyncio
async def test_live_sync_trigger():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/api/live/sync")
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert "syncedAt" in data
        assert data["syncCount"] >= 1

@pytest.mark.asyncio
async def test_live_status():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/live/status")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ONLINE_ACTIVE"
        assert data["syncIntervalSeconds"] == 600
        assert data["sourcesHealth"]["ncs"]["status"] == "HEALTHY"
