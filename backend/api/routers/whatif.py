from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from database import get_db
from models import Forecast, DimTrade
from engine.whatif import simulate_seat_change

router = APIRouter(prefix="/whatif", tags=["Simulator"])

class WhatIfPayload(BaseModel):
    district_code: str
    trade_id: str
    seat_change_pct: Optional[float] = None
    seat_change_abs: Optional[float] = None

@router.post("")
async def run_whatif(payload: WhatIfPayload, db: AsyncSession = Depends(get_db)):
    trade = (await db.execute(select(DimTrade).where(DimTrade.trade_id == payload.trade_id))).scalar_one_or_none()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    fc_rows = (await db.execute(
        select(Forecast).where(
            and_(
                Forecast.district_code == payload.district_code,
                Forecast.trade_id == payload.trade_id
            )
        ).order_by(Forecast.month.asc())
    )).scalars().all()

    if not fc_rows:
        raise HTTPException(status_code=404, detail="No forecast data found for this district and trade")

    demand_p50 = fc_rows[0].demand_p50
    baseline_supply = fc_rows[0].supply_p50
    months = [f.month for f in fc_rows]

    result = simulate_seat_change(
        demand_p50=demand_p50,
        baseline_supply=baseline_supply,
        course_duration_months=trade.course_duration_months,
        months=months,
        seat_change_pct=payload.seat_change_pct,
        seat_change_abs=payload.seat_change_abs
    )
    result["districtCode"] = payload.district_code
    result["tradeId"] = payload.trade_id
    return result
