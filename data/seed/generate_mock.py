#!/usr/bin/env python3
"""
SkillGap Intelligence - Deterministic Mock Data Generator
Smart India Hackathon 2026 (PS 26246 - MSDE)
Produces complete LMIS & App tables per Part B2 specifications.
"""

import json
import math
import os
import random
import sys
from datetime import datetime, timezone
from pathlib import Path

# Insert backend/api into sys.path to import models & database
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
API_DIR = ROOT_DIR / "backend" / "api"
sys.path.insert(0, str(API_DIR))

from database import sync_engine, Base, SyncSessionLocal
from models import (
    DimGeo, DimSector, DimTrade, FactDemand, FactSupply, FactMacro,
    IdxDemand, ForecastRun, Forecast, RiskAlert, Backtest, ModelCard,
    DataLineage, User, AuditLog, PlannerOverride, AlertSubscription
)
import bcrypt

def generate_mock_data():
    print("Initializing SQLite/Postgres database tables...")
    Base.metadata.create_all(bind=sync_engine)
    session = SyncSessionLocal()

    # Clear existing data
    for table in reversed(Base.metadata.sorted_tables):
        session.execute(table.delete())
    session.commit()

    random.seed(42)

    # 1. Load GeoJSON
    geojson_path = ROOT_DIR / "data" / "geo" / "districts.geojson"
    with open(geojson_path, "r", encoding="utf-8") as f:
        geo_data = json.load(f)

    districts = []
    for feat in geo_data["features"]:
        props = feat["properties"]
        geo_record = DimGeo(
            district_code=props["district_code"],
            state_code=props["state_code"],
            state_name_en=props["state_name_en"],
            state_name_hi=props["state_name_hi"],
            district_name_en=props["district_name_en"],
            district_name_hi=props["district_name_hi"],
            geometry_json=feat["geometry"]
        )
        districts.append(geo_record)
        session.add(geo_record)
    session.commit()
    print(f"Loaded {len(districts)} districts across 3 pilot states.")

    # 2. Sectors (5)
    sectors_data = [
        ("sec_electrical_solar", "Electrical & Solar Energy", "विद्युत एवं सौर ऊर्जा"),
        ("sec_healthcare", "Healthcare & Life Sciences", "स्वास्थ्य सेवा एवं जीवन विज्ञान"),
        ("sec_construction", "Construction & Infrastructure", "निर्माण एवं अवसंरचना"),
        ("sec_auto_ev", "Automotive & Electric Vehicles", "ऑटोमोटिव एवं ईवी"),
        ("sec_it_ites", "IT-ITeS & Digital Services", "आईटी-आईटीईएस एवं डिजिटल सेवाएं"),
    ]
    for s_id, s_en, s_hi in sectors_data:
        session.add(DimSector(sector_id=s_id, sector_name_en=s_en, sector_name_hi=s_hi))
    session.commit()

    # 3. Trades (18)
    trades_data = [
        ("trade_solar_pv", "7421.0301", "SGJ/Q0101", 4, "sec_electrical_solar", "Solar PV Technician", "सौर पीवी तकनीशियन", 6),
        ("trade_electrician", "7411.0100", "ELE/Q0101", 4, "sec_electrical_solar", "Electrician", "इलेक्ट्रीशियन", 24),
        ("trade_wireman", "7411.0200", "ELE/Q0201", 3, "sec_electrical_solar", "Wireman", "वायरमैन", 12),
        ("trade_rooftop_solar", "7421.0302", "SGJ/Q0102", 4, "sec_electrical_solar", "Rooftop Solar Grid Installer", "रूफटॉप सोलर ग्रिड इंस्टॉलर", 6),
        ("trade_ev_service", "7231.0102", "ASC/Q1411", 4, "sec_auto_ev", "EV Service Technician", "ईवी सेवा तकनीशियन", 6),
        ("trade_auto_mechanic", "7231.0101", "ASC/Q1401", 4, "sec_auto_ev", "Motor Vehicle Mechanic", "मोटर वाहन मैकेनिक", 24),
        ("trade_ev_battery", "8211.0501", "ASC/Q3605", 3, "sec_auto_ev", "EV Battery Assembly Operator", "ईवी बैटरी असेंबली ऑपरेटर", 6),
        ("trade_gda", "5321.0100", "HSS/Q5101", 3, "sec_healthcare", "General Duty Assistant", "जनरल ड्यूटी असिस्टेंट", 6),
        ("trade_emergency_med", "3258.0100", "HSS/Q2301", 4, "sec_healthcare", "Emergency Medical Technician", "आपातकालीन चिकित्सा तकनीशियन", 12),
        ("trade_phlebotomist", "3212.0200", "HSS/Q0301", 4, "sec_healthcare", "Medical Lab Phlebotomist", "मेडिकल लैब फ्लेबोटोमिस्ट", 6),
        ("trade_mason", "7112.0100", "CON/Q0102", 3, "sec_construction", "Mason (General)", "राजमिस्त्री (सामान्य)", 6),
        ("trade_plumber", "7126.0101", "PSC/Q0104", 3, "sec_construction", "General Plumber", "प्लम्बर", 6),
        ("trade_welder", "7212.0101", "CON/Q0204", 3, "sec_construction", "Welder (Structural & Pipe)", "वेल्डर (संरचनात्मक एवं पाइप)", 12),
        ("trade_bar_bender", "7114.0100", "CON/Q0301", 3, "sec_construction", "Bar Bender & Steel Fixer", "बार बेंडर एवं स्टील फिक्सर", 6),
        ("trade_data_entry", "4132.0401", "SSC/Q2212", 3, "sec_it_ites", "Domestic Data Entry Operator", "डेटा प्रविष्टि ऑपरेटर", 6),
        ("trade_cloud_support", "2511.0201", "SSC/Q0508", 5, "sec_it_ites", "Cloud Infrastructure Associate", "क्लाउड इन्फ्रास्ट्रक्चर एसोसिएट", 9),
        ("trade_ai_data_annotator", "2519.0301", "SSC/Q8101", 4, "sec_it_ites", "AI Data Annotator", "एआई डेटा एनोटेटर", 6),
        ("trade_cybersec_assistant", "2529.0101", "SSC/Q0901", 5, "sec_it_ites", "Cyber Security Junior Analyst", "साइबर सुरक्षा जूनियर विश्लेषक", 9),
    ]
    for tid, nco, qp, lvl, sec, en, hi, dur in trades_data:
        session.add(DimTrade(
            trade_id=tid, nco_code=nco, nsqf_qp=qp, nsqf_level=lvl,
            sector_id=sec, trade_name_en=en, trade_name_hi=hi,
            course_duration_months=dur
        ))
    session.commit()
    print(f"Loaded {len(trades_data)} trades across 5 sectors.")

    # 4. Months Timeline
    history_months = [f"{y}-{m:02d}" for y in range(2022, 2026) for m in range(1, 13)]
    history_months += [f"2026-{m:02d}" for m in range(1, 10)] # up to 2026-09
    forecast_months = [f"2026-{m:02d}" for m in range(10, 13)] + [f"2027-{m:02d}" for m in range(1, 10)]

    run_id = "run_202610_01"
    session.add(ForecastRun(
        run_id=run_id,
        started_at=datetime(2026, 10, 1, 6, 0, tzinfo=timezone.utc),
        finished_at=datetime(2026, 10, 1, 7, 15, tzinfo=timezone.utc),
        status="completed",
        model_version="LightGBM_Ensemble_v2.4"
    ))

    # 5. Populate Facts, Indexes and Forecasts
    # Distinct demo cases:
    # - Jaipur (091) + trade_solar_pv: Critical Shortage (Demand ≈ 5200, Supply ≈ 2900, Gap ≈ +2300, Gap Ratio ≈ +44%)
    # - Jaipur (091) + trade_electrician: Saturation / Oversupply (Demand ≈ 1800, Supply ≈ 3200, Gap ≈ -1400, Gap Ratio ≈ -77%)

    risk_label_counts = {
        "critical_shortage": 0,
        "shortage": 0,
        "balanced": 0,
        "oversupply": 0,
        "saturation": 0
    }

    # Signal weights: NCS 35%, Portals 25%, Industry 15%, PLFS 15%, e-Shram 10%
    for dist in districts:
        dcode = dist.district_code
        for trade_tuple in trades_data:
            tid = trade_tuple[0]
            sec_id = trade_tuple[4]

            # Base parameters
            is_jaipur_solar = (dcode == "091" and tid == "trade_solar_pv")
            is_jaipur_electrician = (dcode == "091" and tid == "trade_electrician")
            
            # Growth & seasonality factors
            solar_growth = 1.35 if "solar" in tid or "ev" in tid else 1.05
            base_demand = 3000 if "solar" in tid or "cloud" in tid or "ai" in tid else 1500
            if is_jaipur_solar:
                base_demand = 5200
            elif is_jaipur_electrician:
                base_demand = 1800

            # 5a. Historical data points (sample subset to keep seed fast)
            # We seed the last 12 history months for chart rendering
            recent_history = history_months[-12:]
            for idx, h_month in enumerate(recent_history):
                trend = 1.0 + (idx * 0.02 * (solar_growth - 1.0))
                month_demand = int(base_demand * trend * (0.9 + random.random() * 0.2))
                if is_jaipur_solar:
                    month_supply = int(2900 * (0.95 + random.random() * 0.1))
                elif is_jaipur_electrician:
                    month_supply = int(3200 * (0.95 + random.random() * 0.1))
                else:
                    month_supply = int(month_demand * (0.7 + random.random() * 0.6))

                session.add(FactDemand(
                    month=h_month,
                    district_code=dcode,
                    trade_id=tid,
                    vacancies_ncs=int(month_demand * 0.4),
                    postings_private=int(month_demand * 0.6),
                    growth_idx=round(solar_growth, 2),
                    source_flag="dummy"
                ))
                session.add(FactSupply(
                    month=h_month,
                    district_code=dcode,
                    trade_id=tid,
                    seats=int(month_supply * 1.2),
                    enrolled=int(month_supply * 1.1),
                    certified=month_supply,
                    placed=int(month_supply * 0.75),
                    completion_rate=0.88,
                    placement_rate=0.74,
                    source_flag="dummy"
                ))

            # 5b. Future Forecasts (12 months)
            low_conf = random.random() < 0.10
            quality = round(65.0 + random.random() * 30.0, 1)

            # Determine baseline annual target for gap ratio
            if is_jaipur_solar:
                fc_demand_p50 = 5200.0
                fc_supply_p50 = 2900.0
            elif is_jaipur_electrician:
                fc_demand_p50 = 1800.0
                fc_supply_p50 = 3200.0
            else:
                # Distribute across 5 categories deterministically based on hash
                h_val = (hash(f"{dcode}_{tid}") % 100)
                if h_val < 20:
                    fc_demand_p50 = 4000.0
                    fc_supply_p50 = 2400.0 # Critical Shortage (> +30%)
                elif h_val < 45:
                    fc_demand_p50 = 3200.0
                    fc_supply_p50 = 2600.0 # Shortage (+10% to +30%)
                elif h_val < 70:
                    fc_demand_p50 = 2800.0
                    fc_supply_p50 = 2750.0 # Balanced (-10% to +10%)
                elif h_val < 85:
                    fc_demand_p50 = 2200.0
                    fc_supply_p50 = 2600.0 # Oversupply (-10% to -30%)
                else:
                    fc_demand_p50 = 1500.0
                    fc_supply_p50 = 2600.0 # Saturation (< -30%)

            gap = fc_demand_p50 - fc_supply_p50
            gap_ratio = gap / fc_demand_p50

            if gap_ratio > 0.30:
                label = "critical_shortage"
            elif gap_ratio >= 0.10:
                label = "shortage"
            elif gap_ratio >= -0.10:
                label = "balanced"
            elif gap_ratio >= -0.30:
                label = "oversupply"
            else:
                label = "saturation"

            risk_label_counts[label] += 1

            for f_month in forecast_months:
                session.add(Forecast(
                    run_id=run_id,
                    district_code=dcode,
                    trade_id=tid,
                    month=f_month,
                    demand_p10=round(fc_demand_p50 * 0.85, 1),
                    demand_p50=round(fc_demand_p50, 1),
                    demand_p90=round(fc_demand_p50 * 1.18, 1),
                    supply_p10=round(fc_supply_p50 * 0.90, 1),
                    supply_p50=round(fc_supply_p50, 1),
                    supply_p90=round(fc_supply_p50 * 1.10, 1),
                    gap_ratio=round(gap_ratio, 4),
                    source_flag="dummy",
                    low_confidence=low_conf,
                    quality_score=quality
                ))

            # Demand index & signal breakdown
            ncs_norm = min(100.0, max(10.0, fc_demand_p50 / 60.0))
            portal_norm = min(100.0, max(15.0, fc_demand_p50 / 55.0))
            ind_norm = 75.0 if "solar" in tid or "ev" in tid else 50.0
            plfs_norm = 60.0
            eshram_norm = 55.0
            demand_idx = round(0.35*ncs_norm + 0.25*portal_norm + 0.15*ind_norm + 0.15*plfs_norm + 0.10*eshram_norm, 1)

            session.add(IdxDemand(
                month=forecast_months[0],
                district_code=dcode,
                trade_id=tid,
                demand_index=demand_idx,
                quality_score=quality,
                signal_breakdown={
                    "ncs": round(ncs_norm, 1),
                    "portals": round(portal_norm, 1),
                    "industry": round(ind_norm, 1),
                    "plfs": round(plfs_norm, 1),
                    "eshram": round(eshram_norm, 1)
                }
            ))

            # 6. Risk Alerts (for shortage / saturation cases)
            if label in ["critical_shortage", "shortage", "saturation"]:
                top_drivers = [
                    {
                        "feature": "ncs_vacancy_momentum",
                        "label_en": "NCS Vacancy Momentum (YoY)",
                        "label_hi": "एनसीएस रिक्ति गतिशीलता (वर्ष-दर-वर्ष)",
                        "contribution": 0.38 if label != "saturation" else -0.35,
                        "direction": "positive" if label != "saturation" else "negative"
                    },
                    {
                        "feature": "industry_capex_announcement",
                        "label_en": "Industrial Green/EV Capex in District",
                        "label_hi": "जिले में औद्योगिक हरित/ईवी पूंजीगत व्यय",
                        "contribution": 0.26,
                        "direction": "positive"
                    },
                    {
                        "feature": "training_seat_pipeline",
                        "label_en": "Local Training Seat Intake Capacity",
                        "label_hi": "स्थानीय प्रशिक्षण सीट सेवन क्षमता",
                        "contribution": -0.19 if label != "saturation" else 0.42,
                        "direction": "negative" if label != "saturation" else "positive"
                    },
                    {
                        "feature": "completion_dropout_rate",
                        "label_en": "Batch Attrition & Certification Lag",
                        "label_hi": "बैच छोड़ने की दर एवं प्रमाणन अंतराल",
                        "contribution": -0.12,
                        "direction": "negative"
                    },
                    {
                        "feature": "eshram_unskilled_shift",
                        "label_en": "Unskilled Worker Shift to Renewable Trades",
                        "label_hi": "अकुशल श्रमिकों का नवीकरणीय व्यवसायों में स्थानांतरण",
                        "contribution": 0.08,
                        "direction": "positive"
                    }
                ]
                session.add(RiskAlert(
                    run_id=run_id,
                    district_code=dcode,
                    trade_id=tid,
                    label=label,
                    probability=round(0.82 + random.random() * 0.15, 2),
                    top_drivers=top_drivers
                ))

    session.commit()
    print("Populated Forecasts, Demand Index, and Risk Alerts.")
    print("Risk label distribution across trades/districts:", risk_label_counts)

    # 7. Model Card & Data Lineage
    session.add(ModelCard(
        model_name="LightGBM_Ensemble",
        version="v2.4",
        metadata_json={
            "description": "Quantile Gradient Boosted Regression with SHAP feature explanations",
            "training_window": "2022-01 to 2026-09",
            "quantiles": ["P10", "P50", "P90"],
            "features": ["ncs_vacancies", "private_postings", "industry_growth", "plfs_macro", "eshram_supply"],
            "limitations": "Modelled district estimates below all-India PLFS. Not real-time; monthly batch cadence."
        }
    ))

    lineage_records = [
        ("vacancies_ncs", "National Career Service (NCS)", "https://www.ncs.gov.in", "State/Report", "2025-12", "PIB release aggregated benchmark"),
        ("postings_private", "Major Job Aggregators", "https://labour.gov.in", "District/Estimated", "2026-09", "Normalised online postings index"),
        ("seats, enrolled, certified", "Skill India Digital Hub / ASEEM / PMKVY", "https://www.skillindiadigital.gov.in", "District", "2026-08", "Training seat flow & completion metrics"),
        ("lfpr, wpr, ur", "Periodic Labour Force Survey (PLFS)", "https://www.mospi.gov.in", "State (Modelled)", "2026-06", "Modelled allocation below All-India monthly release"),
        ("e_shram_signals", "e-Shram Portal", "https://eshram.gov.in", "Aggregate/District", "2026-07", "Worker unorganised registry flow"),
    ]
    for col, src, url, gran, upd, note in lineage_records:
        session.add(DataLineage(
            column_name=col, source_name=src, source_url=url,
            granularity=gran, last_updated=upd, notes=note
        ))

    # 8. Backtest Metrics (Model vs Baseline)
    backtest_data = [
        ("LightGBM_Ensemble", "sector", "sec_electrical_solar", 12.4, 11.8, 10.9, 24.5, "2025-10", "2026-09"),
        ("LightGBM_Ensemble", "sector", "sec_auto_ev", 14.1, 13.5, 12.2, 28.2, "2025-10", "2026-09"),
        ("LightGBM_Ensemble", "sector", "sec_healthcare", 9.8, 9.2, 8.7, 19.4, "2025-10", "2026-09"),
        ("LightGBM_Ensemble", "sector", "sec_construction", 11.2, 10.8, 10.1, 21.6, "2025-10", "2026-09"),
        ("LightGBM_Ensemble", "sector", "sec_it_ites", 8.4, 8.0, 7.5, 17.8, "2025-10", "2026-09"),
    ]
    for mname, scope, sid, mape, smape, wape, base_mape, w_start, w_end in backtest_data:
        session.add(Backtest(
            model_name=mname, scope=scope, scope_id=sid,
            mape=mape, smape=smape, wape=wape, baseline_mape=base_mape,
            window_start=w_start, window_end=w_end
        ))

    # 9. App Users (Seeded RBAC)
    pwd_hash = bcrypt.hashpw(b"Admin@12345", bcrypt.gensalt()).decode("utf-8")
    users = [
        ("usr_national_01", "national@skillgap.gov.in", pwd_hash, "national", None, None),
        ("usr_state_rj", "rajasthan@skillgap.gov.in", pwd_hash, "state", "08", None),
        ("usr_state_mh", "maharashtra@skillgap.gov.in", pwd_hash, "state", "27", None),
        ("usr_dist_jaipur", "jaipur@skillgap.gov.in", pwd_hash, "district", "08", "091"),
        ("usr_viewer_01", "viewer@skillgap.gov.in", pwd_hash, "viewer", None, None),
    ]
    for uid, email, phash, role, st, dt in users:
        session.add(User(
            id=uid, email=email, password_hash=phash,
            role=role, state_scope=st, district_scope=dt
        ))

    # 10. Planner Overrides & Audit Log (initial sample)
    session.add(PlannerOverride(
        user_id="usr_dist_jaipur",
        district_code="091",
        trade_id="trade_solar_pv",
        month="2026-10",
        override_type="target_seats",
        original_val=2900.0,
        override_val=3800.0,
        reason="Sanctioned new PM-Surya Ghar solar rooftop training batch at Jaipur Govt ITI"
    ))
    session.add(AuditLog(
        user_id="usr_dist_jaipur",
        action="CREATE_OVERRIDE",
        target_type="PLANNER_OVERRIDE",
        target_id="091/trade_solar_pv/2026-10",
        old_val="2900",
        new_val="3800",
        reason="Sanctioned new PM-Surya Ghar solar rooftop training batch at Jaipur Govt ITI"
    ))

    session.commit()
    session.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    generate_mock_data()
