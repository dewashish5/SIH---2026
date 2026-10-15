
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import DimGeo, DimSector, DimTrade, RiskAlert

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("")
async def get_alerts(
    severity: str | None = Query(None), # critical_shortage, shortage, saturation, etc.
    state_code: str | None = Query(None),
    district_code: str | None = Query(None),
    limit: int = Query(20),
    db: AsyncSession = Depends(get_db)
):
    geos = {g.district_code: g for g in (await db.execute(select(DimGeo))).scalars().all()}
    trades = {t.trade_id: t for t in (await db.execute(select(DimTrade))).scalars().all()}
    sectors = {s.sector_id: s for s in (await db.execute(select(DimSector))).scalars().all()}

    query = select(RiskAlert).order_by(RiskAlert.probability.desc())
    if severity:
        query = query.where(RiskAlert.label == severity)
    if district_code:
        query = query.where(RiskAlert.district_code == district_code)

    alerts = (await db.execute(query)).scalars().all()

    results = []
    for a in alerts:
        geo = geos.get(a.district_code)
        trade = trades.get(a.trade_id)
        if not geo or not trade:
            continue
        if state_code and geo.state_code != state_code:
            continue

        sec = sectors.get(trade.sector_id)
        results.append({
            "id": a.id,
            "runId": a.run_id,
            "stateCode": geo.state_code,
            "stateNameEn": geo.state_name_en,
            "stateNameHi": geo.state_name_hi,
            "districtCode": geo.district_code,
            "districtNameEn": geo.district_name_en,
            "districtNameHi": geo.district_name_hi,
            "sectorId": trade.sector_id,
            "sectorNameEn": sec.sector_name_en if sec else "",
            "sectorNameHi": sec.sector_name_hi if sec else "",
            "tradeId": trade.trade_id,
            "tradeNameEn": trade.trade_name_en,
            "tradeNameHi": trade.trade_name_hi,
            "label": a.label,
            "probability": a.probability,
            "topDrivers": a.top_drivers,
            "createdAt": a.created_at.isoformat() if a.created_at else None
        })

    return results[:limit]
