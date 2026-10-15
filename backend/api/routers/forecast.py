
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import CurrentUser, get_current_user
from database import get_db
from models import DimGeo, DimTrade, FactDemand, FactSupply, Forecast

router = APIRouter(prefix="/forecast", tags=["Forecast"])

@router.get("")
async def get_forecast(
    state_code: str | None = Query(None),
    district_code: str = Query("091"), # default Jaipur
    trade_id: str = Query("trade_solar_pv"), # default Solar PV Tech
    horizon: int = Query(12),
    db: AsyncSession = Depends(get_db),
    user: CurrentUser = Depends(get_current_user)
):
    # Verify RBAC scope access
    geo = (await db.execute(select(DimGeo).where(DimGeo.district_code == district_code))).scalar_one_or_none()
    if not geo:
        raise HTTPException(status_code=404, detail="District not found")

    if not user.check_access(state_code=geo.state_code, district_code=district_code):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied for this geographical scope")

    trade = (await db.execute(select(DimTrade).where(DimTrade.trade_id == trade_id))).scalar_one_or_none()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    # Fetch forecast rows
    fc_query = select(Forecast).where(
        and_(
            Forecast.district_code == district_code,
            Forecast.trade_id == trade_id
        )
    ).order_by(Forecast.month.asc()).limit(horizon)

    forecast_rows = (await db.execute(fc_query)).scalars().all()

    # Fetch historical rows
    hist_demand = (await db.execute(
        select(FactDemand).where(
            and_(FactDemand.district_code == district_code, FactDemand.trade_id == trade_id)
        ).order_by(FactDemand.month.asc())
    )).scalars().all()

    hist_supply = (await db.execute(
        select(FactSupply).where(
            and_(FactSupply.district_code == district_code, FactSupply.trade_id == trade_id)
        ).order_by(FactSupply.month.asc())
    )).scalars().all()

    supply_map = {s.month: s for s in hist_supply}
    historical_points = []
    for d in hist_demand:
        s = supply_map.get(d.month)
        historical_points.append({
            "month": d.month,
            "demand": d.vacancies_ncs + d.postings_private,
            "supply": s.certified if s else 0,
            "sourceFlag": d.source_flag
        })

    forecast_points = []
    for f in forecast_rows:
        forecast_points.append({
            "month": f.month,
            "demandP10": f.demand_p10,
            "demandP50": f.demand_p50,
            "demandP90": f.demand_p90,
            "supplyP10": f.supply_p10,
            "supplyP50": f.supply_p50,
            "supplyP90": f.supply_p90,
            "gap": round(f.demand_p50 - f.supply_p50, 1),
            "gapRatio": f.gap_ratio,
            "riskLabel": f.risk_label if hasattr(f, 'risk_label') else (
                "critical_shortage" if f.gap_ratio > 0.30 else (
                    "shortage" if f.gap_ratio >= 0.10 else (
                        "balanced" if f.gap_ratio >= -0.10 else (
                            "oversupply" if f.gap_ratio >= -0.30 else "saturation"
                        )
                    )
                )
            ),
            "sourceFlag": f.source_flag,
            "lowConfidence": f.low_confidence,
            "qualityScore": f.quality_score
        })

    return {
        "runId": forecast_rows[0].run_id if forecast_rows else "run_latest",
        "stateCode": geo.state_code,
        "districtCode": geo.district_code,
        "sectorId": trade.sector_id,
        "tradeId": trade.trade_id,
        "tradeNameEn": trade.trade_name_en,
        "tradeNameHi": trade.trade_name_hi,
        "lastRefreshed": "2026-10-01",
        "historical": historical_points,
        "forecast": forecast_points
    }
