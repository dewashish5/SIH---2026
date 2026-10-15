"""
SkillGap Neo4j Knowledge Graph Router
Exposes graph status, lineage sub-graphs, career pathways, and Cypher query execution.
"""
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from services.neo4j_service import neo4j_service

router = APIRouter(prefix="/graph", tags=["Knowledge Graph"])


class CypherRequest(BaseModel):
    query: str
    params: dict[str, Any] | None = None


@router.get("/status")
def get_graph_status():
    """Returns live connection status and high-level topology summary."""
    return neo4j_service.get_status()


@router.get("/overview")
def get_graph_overview():
    """Provides macro graph statistics, hub nodes, degree distribution, and clusters."""
    return neo4j_service.get_overview()


@router.get("/lineage")
def get_graph_lineage(
    trade_code: str | None = Query(None, description="NCO / NQR Trade code (e.g. 7421.0301)"),
    district_id: str | None = Query(None, description="District ID (e.g. 091)")
):
    """Returns targeted sub-graph containing Trade, District, Skills, Employers, and Training Institutes."""
    return neo4j_service.get_lineage(trade_code=trade_code, district_id=district_id)


@router.get("/pathways")
def get_career_pathways(
    trade_code: str | None = Query(None, description="Base Trade code to evaluate mobility (e.g. 7411.0100)")
):
    """Calculates skill adjacency and career mobility transition pathways."""
    return neo4j_service.get_career_pathways(trade_code=trade_code)


@router.post("/cypher")
def execute_cypher_query(req: CypherRequest):
    """Executes a Cypher query on the graph database with safety guardrails."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    forbidden_keywords = ["drop database", "delete *", "alter database"]
    for f in forbidden_keywords:
        if f in req.query.lower():
            raise HTTPException(status_code=403, detail="Destructive database operations prohibited")

    return neo4j_service.run_cypher(req.query, req.params)
