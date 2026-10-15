"""
Tests for Neo4j Knowledge Graph endpoints and service.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_graph_status():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/graph/status")
        assert res.status_code == 200
        data = res.json()
        assert "connection_mode" in data
        assert data["total_nodes"] > 0
        assert data["total_edges"] > 0
        assert "Trade" in data["node_labels"]
        assert "Skill" in data["node_labels"]


@pytest.mark.asyncio
async def test_graph_overview():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/graph/overview")
        assert res.status_code == 200
        data = res.json()
        assert "node_counts" in data
        assert "edge_counts" in data
        assert "top_hubs" in data
        assert len(data["top_hubs"]) > 0


@pytest.mark.asyncio
async def test_graph_lineage():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/graph/lineage?trade_code=7421.0301&district_id=091")
        assert res.status_code == 200
        data = res.json()
        assert "nodes" in data
        assert "edges" in data
        assert "focus" in data
        assert data["focus"]["trade"]["properties"]["code"] == "7421.0301"
        assert len(data["nodes"]) >= 2


@pytest.mark.asyncio
async def test_career_pathways():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/graph/pathways?trade_code=7411.0100")
        assert res.status_code == 200
        data = res.json()
        assert "base_trade" in data
        assert "adjacent_pathways" in data
        assert len(data["adjacent_pathways"]) > 0
        p = data["adjacent_pathways"][0]
        assert "relationship" in p
        assert "similarity" in p["relationship"]


@pytest.mark.asyncio
async def test_cypher_execution():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Valid pattern query
        res = await client.post("/graph/cypher", json={"query": "MATCH (t:Trade)-[:REQUIRES_SKILL]->(s:Skill) RETURN t, s"})
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "SUCCESS"
        assert "records" in data

        # Blocked dangerous query
        res_bad = await client.post("/graph/cypher", json={"query": "DROP DATABASE neo4j"})
        assert res_bad.status_code == 403
