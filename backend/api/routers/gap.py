
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from engine.gap import compute_gap
from models import DimGeo, DimSector, DimTrade, Forecast

router = APIRouter(prefix="/gap", tags=["Gap Analysis"])

@router.get("/rank")
async def get_ranked_gaps(
    level: str = Query("district"), # state | district | trade
    order: str = Query("shortage"), # shortage | oversupply
    sector_id: str | None = Query(None),
    state_code: str | None = Query(None),
    limit: int = Query(10),
    db: AsyncSession = Depends(get_db)
):
    geos = {g.district_code: g for g in (await db.execute(select(DimGeo))).scalars().all()}
    trades = {t.trade_id: t for t in (await db.execute(select(DimTrade))).scalars().all()}
    sectors = {s.sector_id: s for s in (await db.execute(select(DimSector))).scalars().all()}

    # Select latest forecast month (first month of forecast horizon)
    # Group by district and trade
    fc_rows = (await db.execute(
        select(Forecast).where(Forecast.month == "2026-10")
    )).scalars().all()

    items = []
    for fc in fc_rows:
        geo = geos.get(fc.district_code)
        trade = trades.get(fc.trade_id)
        if not geo or not trade:
            continue

        if state_code and geo.state_code != state_code:
            continue
        if sector_id and trade.sector_id != sector_id:
            continue

        sec = sectors.get(trade.sector_id)
        gap, gap_ratio, risk_label, severity = compute_gap(fc.demand_p50, fc.supply_p50)

        # Filter by requested order
        if order == "shortage" and gap_ratio <= 0.0:
            continue
        if order == "oversupply" and gap_ratio >= 0.0:
            continue

        items.append({
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
            "ncoCode": trade.nco_code,
            "demandP50": fc.demand_p50,
            "supplyP50": fc.supply_p50,
            "gap": gap,
            "gapRatio": gap_ratio,
            "riskLabel": risk_label,
            "severityScore": severity,
            "sourceFlag": fc.source_flag,
            "qualityScore": fc.quality_score,
            "lowConfidence": fc.low_confidence
        })

    # Sort items
    items.sort(key=lambda x: x["severityScore"], reverse=True)

    ranked_list = []
    for idx, item in enumerate(items[:limit]):
        item["rank"] = idx + 1
        ranked_list.append(item)

    return ranked_list
