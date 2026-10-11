from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from database import get_db
from models import Forecast, DimTrade, FactSupply
from engine.recommend import generate_recommendation

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("")
async def get_recommendations(
    district_code: str = Query("091"),
    trade_id: str = Query("trade_solar_pv"),
    db: AsyncSession = Depends(get_db)
):
    trade = (await db.execute(select(DimTrade).where(DimTrade.trade_id == trade_id))).scalar_one_or_none()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    fc = (await db.execute(
        select(Forecast).where(
            and_(
                Forecast.district_code == district_code,
                Forecast.trade_id == trade_id,
                Forecast.month == "2026-10"
            )
        )
    )).scalar_one_or_none()

    if not fc:
        raise HTTPException(status_code=404, detail="Forecast not found")

    gap = fc.demand_p50 - fc.supply_p50
    gap_ratio = fc.gap_ratio

    # Current seat capacity
    latest_supply = (await db.execute(
        select(FactSupply).where(
            and_(
                FactSupply.district_code == district_code,
                FactSupply.trade_id == trade_id
            )
        ).order_by(FactSupply.month.desc())
    )).scalars().first()

    current_capacity = latest_supply.seats if latest_supply else int(fc.supply_p50 * 1.1)

    rec = generate_recommendation(
        trade_name_en=trade.trade_name_en,
        trade_name_hi=trade.trade_name_hi,
        gap=gap,
        gap_ratio=gap_ratio,
        current_capacity=current_capacity
    )
    rec["districtCode"] = district_code
    rec["tradeId"] = trade_id
    rec["tradeNameEn"] = trade.trade_name_en
    rec["tradeNameHi"] = trade.trade_name_hi

    # Reallocation target for oversupplied trades
    if rec["action"] == "reallocate":
        rec["reallocationTarget"] = {
            "tradeId": "trade_solar_pv",
            "tradeNameEn": "Solar PV Technician",
            "tradeNameHi": "सौर पीवी तकनीशियन",
            "districtCode": district_code
        }

    return rec
