from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import DimGeo, DimSector, DimTrade

router = APIRouter(prefix="/dimensions", tags=["Dimensions"])

@router.get("")
async def get_dimensions(db: AsyncSession = Depends(get_db)):
    geos = (await db.execute(select(DimGeo))).scalars().all()
    sectors = (await db.execute(select(DimSector))).scalars().all()
    trades = (await db.execute(select(DimTrade))).scalars().all()

    # Unique states
    states_dict = {}
    districts_list = []
    for g in geos:
        if g.state_code not in states_dict:
            states_dict[g.state_code] = {
                "stateCode": g.state_code,
                "stateNameEn": g.state_name_en,
                "stateNameHi": g.state_name_hi
            }
        districts_list.append({
            "districtCode": g.district_code,
            "districtNameEn": g.district_name_en,
            "districtNameHi": g.district_name_hi,
            "stateCode": g.state_code
        })

    return {
        "states": list(states_dict.values()),
        "districts": districts_list,
        "sectors": [
            {
                "sectorId": s.sector_id,
                "sectorNameEn": s.sector_name_en,
                "sectorNameHi": s.sector_name_hi
            }
            for s in sectors
        ],
        "trades": [
            {
                "tradeId": t.trade_id,
                "ncoCode": t.nco_code,
                "nsqfQp": t.nsqf_qp,
                "nsqfLevel": t.nsqf_level,
                "sectorId": t.sector_id,
                "tradeNameEn": t.trade_name_en,
                "tradeNameHi": t.trade_name_hi,
                "courseDurationMonths": t.course_duration_months
            }
            for t in trades
        ]
    }
