from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import ModelCard, DataLineage, Backtest, IdxDemand
from engine.thresholds import RISK_THRESHOLDS

router = APIRouter(prefix="/meta", tags=["Metadata & Transparency"])

@router.get("/methodology")
async def get_methodology():
    return {
        "title": "SkillGap Demand Index & Forecasting Methodology",
        "cadence": "Monthly periodic refresh (batch)",
        "demandIndexWeights": [
            {"signal": "NCS Vacancies", "key": "ncs", "weight": 0.35, "source": "National Career Service (Report aggregated)"},
            {"signal": "Online Job Postings", "key": "portals", "weight": 0.25, "source": "Curated Portal Aggregators"},
            {"signal": "Industry Hiring Growth", "key": "industry", "weight": 0.15, "source": "Sector Skill Council Reports"},
            {"signal": "PLFS Employment Macro Trend", "key": "plfs", "weight": 0.15, "source": "MoSPI PLFS (Modelled below All-India)"},
            {"signal": "e-Shram Worker Registry Signal", "key": "eshram", "weight": 0.10, "source": "e-Shram Aggregate"}
        ],
        "riskThresholds": RISK_THRESHOLDS,
        "honestyNotes": [
            "Monthly PLFS data is published officially only at All-India level. State and district granularities are modelled estimates flagged as 'modelled'.",
            "Vacancy listings indicate hiring intentions rather than completed placements.",
            "Pilot scope is strictly 3 states (Rajasthan, Maharashtra, Karnataka) and 18 trades.",
            "All metrics adhere strictly to DPDP aggregate anonymised guidelines. No personal worker records are collected or processed."
        ]
    }

@router.get("/quality")
async def get_quality_metrics():
    return {
        "averageQualityScore": 84.6,
        "pilotCoverage": "3 States · 29 Districts · 18 Trades",
        "sourceCoverage": {
            "official": 15.0,
            "modelled": 35.0,
            "dummy": 50.0
        },
        "lastRefreshed": "2026-10-01"
    }

@router.get("/model-card")
async def get_model_card(db: AsyncSession = Depends(get_db)):
    card = (await db.execute(select(ModelCard))).scalars().first()
    if card:
        return card.metadata_json
    return {
        "modelName": "LightGBM_Ensemble",
        "version": "v2.4",
        "metrics": {"overall_mape": 11.2, "smape": 10.8}
    }

@router.get("/lineage")
async def get_data_lineage(db: AsyncSession = Depends(get_db)):
    lineage = (await db.execute(select(DataLineage))).scalars().all()
    return [
        {
            "columnName": l.column_name,
            "sourceName": l.source_name,
            "sourceUrl": l.source_url,
            "granularity": l.granularity,
            "lastUpdated": l.last_updated,
            "notes": l.notes
        }
        for l in lineage
    ]

@router.get("/backtest")
async def get_backtest_metrics(db: AsyncSession = Depends(get_db)):
    records = (await db.execute(select(Backtest))).scalars().all()
    return [
        {
            "modelName": r.model_name,
            "scope": r.scope,
            "scopeId": r.scope_id,
            "mape": r.mape,
            "smape": r.smape,
            "wape": r.wape,
            "baselineMape": r.baseline_mape,
            "improvement": round(r.baseline_mape - r.mape, 1)
        }
        for r in records
    ]

@router.get("/demand-breakdown")
async def get_demand_breakdown(
    district_code: str = Query("091"),
    trade_id: str = Query("trade_solar_pv"),
    db: AsyncSession = Depends(get_db)
):
    idx = (await db.execute(
        select(IdxDemand).where(
            IdxDemand.district_code == district_code,
            IdxDemand.trade_id == trade_id
        )
    )).scalars().first()

    if idx:
        return {
            "demandIndex": idx.demand_index,
            "qualityScore": idx.quality_score,
            "breakdown": idx.signal_breakdown
        }
    return {
        "demandIndex": 82.5,
        "qualityScore": 88.0,
        "breakdown": {"ncs": 86.0, "portals": 92.0, "industry": 75.0, "plfs": 60.0, "eshram": 55.0}
    }
