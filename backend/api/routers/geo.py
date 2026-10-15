import json
from pathlib import Path

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from engine.thresholds import classify_gap_ratio
from models import Forecast

router = APIRouter(prefix="/geo", tags=["GeoJSON & Choropleth"])

GEOJSON_PATH = Path(__file__).resolve().parent.parent.parent.parent / "data" / "geo" / "districts.geojson"

with open(GEOJSON_PATH, encoding="utf-8") as f:
    _GEOJSON_DATA = json.load(f)

@router.get("/{level}")
async def get_geo_data(
    level: str, # national | state | district
    state_code: str | None = Query(None),
    sector_id: str | None = Query(None),
    trade_id: str | None = Query("trade_solar_pv"),
    db: AsyncSession = Depends(get_db)
):
    geo_data = json.loads(json.dumps(_GEOJSON_DATA))


    # Fetch latest forecasts for this trade
    fc_rows = (await db.execute(
        select(Forecast).where(
            Forecast.month == "2026-10",
            Forecast.trade_id == trade_id
        )
    )).scalars().all()

    fc_map = {f.district_code: f for f in fc_rows}

    # Annotate features
    filtered_features = []
    for feat in geo_data["features"]:
        props = feat["properties"]
        dcode = props["district_code"]
        stcode = props["state_code"]

        if state_code and stcode != state_code:
            continue

        fc = fc_map.get(dcode)
        if fc:
            gap = fc.demand_p50 - fc.supply_p50
            ratio = fc.gap_ratio
            label = classify_gap_ratio(ratio)
            props["demand"] = fc.demand_p50
            props["supply"] = fc.supply_p50
            props["gap"] = gap
            props["gapRatio"] = ratio
            props["riskLabel"] = label
            props["qualityScore"] = fc.quality_score
            props["sourceFlag"] = fc.source_flag
        else:
            props["riskLabel"] = "no_data"

        filtered_features.append(feat)

    return {
        "type": "FeatureCollection",
        "features": filtered_features
    }
