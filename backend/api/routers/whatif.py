
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from engine.whatif import simulate_seat_change
from models import DimTrade, Forecast

router = APIRouter(prefix="/whatif", tags=["Simulator"])

class WhatIfPayload(BaseModel):
    district_code: str
    trade_id: str
    seat_change_pct: float | None = None
    seat_change_abs: float | None = None

@router.get("")
async def get_whatif(
    district_code: str = "091",
    trade_id: str = "trade_solar_pv",
    seat_change_pct: float | None = None,
    seat_change_abs: float | None = None,
    delta_seats: float | None = None,
    db: AsyncSession = Depends(get_db)
):
    abs_change = seat_change_abs if seat_change_abs is not None else delta_seats
    payload = WhatIfPayload(
        district_code=district_code,
        trade_id=trade_id,
        seat_change_pct=seat_change_pct,
        seat_change_abs=abs_change
    )
    return await run_whatif(payload, db)

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

