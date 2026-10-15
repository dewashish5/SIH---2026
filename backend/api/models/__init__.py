from datetime import UTC, datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)

from database import Base

# ================= LMIS SCHEMA =================

class DimGeo(Base):
    __tablename__ = "dim_geo"
    district_code = Column(String(20), primary_key=True)
    state_code = Column(String(10), nullable=False, index=True)
    state_name_en = Column(String(100), nullable=False)
    state_name_hi = Column(String(100), nullable=False)
    district_name_en = Column(String(100), nullable=False)
    district_name_hi = Column(String(100), nullable=False)
    geometry_json = Column(JSON, nullable=True)

class DimSector(Base):
    __tablename__ = "dim_sector"
    sector_id = Column(String(50), primary_key=True)
    sector_name_en = Column(String(100), nullable=False)
    sector_name_hi = Column(String(100), nullable=False)

class DimTrade(Base):
    __tablename__ = "dim_trade"
    trade_id = Column(String(50), primary_key=True)
    nco_code = Column(String(20), nullable=False, index=True)
    nsqf_qp = Column(String(50), nullable=False)
    nsqf_level = Column(Integer, nullable=False)
    sector_id = Column(String(50), ForeignKey("dim_sector.sector_id"), nullable=False, index=True)
    trade_name_en = Column(String(150), nullable=False)
    trade_name_hi = Column(String(150), nullable=False)
    course_duration_months = Column(Integer, default=6)

class FactDemand(Base):
    __tablename__ = "fact_demand"
    month = Column(String(7), primary_key=True) # YYYY-MM
    district_code = Column(String(20), ForeignKey("dim_geo.district_code"), primary_key=True)
    trade_id = Column(String(50), ForeignKey("dim_trade.trade_id"), primary_key=True)
    vacancies_ncs = Column(Integer, default=0)
    postings_private = Column(Integer, default=0)
    growth_idx = Column(Float, default=1.0)
    source_flag = Column(String(20), default="official") # official | modelled

class FactSupply(Base):
    __tablename__ = "fact_supply"
    month = Column(String(7), primary_key=True)
    district_code = Column(String(20), ForeignKey("dim_geo.district_code"), primary_key=True)
    trade_id = Column(String(50), ForeignKey("dim_trade.trade_id"), primary_key=True)
    seats = Column(Integer, default=0)
    enrolled = Column(Integer, default=0)
    certified = Column(Integer, default=0)
    placed = Column(Integer, default=0)
    completion_rate = Column(Float, default=0.85)
    placement_rate = Column(Float, default=0.70)
    source_flag = Column(String(20), default="official")

class FactMacro(Base):
    __tablename__ = "fact_macro"
    month = Column(String(7), primary_key=True)
    state_code = Column(String(10), primary_key=True)
    lfpr = Column(Float, default=45.0)
    wpr = Column(Float, default=42.0)
    ur = Column(Float, default=5.2)
    source_flag = Column(String(20), default="modelled")

class IdxDemand(Base):
    __tablename__ = "idx_demand"
    month = Column(String(7), primary_key=True)
    district_code = Column(String(20), primary_key=True)
    trade_id = Column(String(50), primary_key=True)
    demand_index = Column(Float, nullable=False)
    quality_score = Column(Float, default=85.0)
    signal_breakdown = Column(JSON, nullable=False)

class ForecastRun(Base):
    __tablename__ = "forecast_run"
    run_id = Column(String(50), primary_key=True)
    started_at = Column(DateTime, default=lambda: datetime.now(UTC))
    finished_at = Column(DateTime, nullable=True)
    status = Column(String(20), default="completed")
    model_version = Column(String(20), default="v1.0.0")

class Forecast(Base):
    __tablename__ = "forecast"
    run_id = Column(String(50), ForeignKey("forecast_run.run_id"), primary_key=True)
    district_code = Column(String(20), primary_key=True)
    trade_id = Column(String(50), primary_key=True)
    month = Column(String(7), primary_key=True)
    demand_p10 = Column(Float, nullable=False)
    demand_p50 = Column(Float, nullable=False)
    demand_p90 = Column(Float, nullable=False)
    supply_p10 = Column(Float, nullable=False)
    supply_p50 = Column(Float, nullable=False)
    supply_p90 = Column(Float, nullable=False)
    gap_ratio = Column(Float, nullable=False)
    source_flag = Column(String(20), default="official")
    low_confidence = Column(Boolean, default=False)
    quality_score = Column(Float, default=85.0)

class RiskAlert(Base):
    __tablename__ = "risk_alert"
    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(String(50), index=True)
    district_code = Column(String(20), index=True)
    trade_id = Column(String(50), index=True)
    label = Column(String(30), nullable=False) # critical_shortage, shortage, balanced, oversupply, saturation
    probability = Column(Float, default=0.85)
    top_drivers = Column(JSON, nullable=False) # [{feature, label_en, label_hi, contribution, direction}]
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

class Backtest(Base):
    __tablename__ = "backtest"
    id = Column(Integer, primary_key=True, autoincrement=True)
    model_name = Column(String(50), nullable=False)
    scope = Column(String(20), nullable=False) # state | sector | trade
    scope_id = Column(String(50), nullable=False)
    mape = Column(Float, nullable=False)
    smape = Column(Float, nullable=False)
    wape = Column(Float, nullable=False)
    baseline_mape = Column(Float, nullable=False)
    window_start = Column(String(7), nullable=False)
    window_end = Column(String(7), nullable=False)

class ModelCard(Base):
    __tablename__ = "model_card"
    model_name = Column(String(50), primary_key=True)
    version = Column(String(20), primary_key=True)
    metadata_json = Column(JSON, nullable=False)

class DataLineage(Base):
    __tablename__ = "data_lineage"
    column_name = Column(String(50), primary_key=True)
    source_name = Column(String(100), nullable=False)
    source_url = Column(String(200), nullable=True)
    granularity = Column(String(50), nullable=False)
    last_updated = Column(String(20), nullable=False)
    notes = Column(Text, nullable=True)

# ================= APP SCHEMA =================

class User(Base):
    __tablename__ = "users"
    id = Column(String(50), primary_key=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(200), nullable=False)
    role = Column(String(20), default="viewer") # national | state | district | viewer
    state_scope = Column(String(10), nullable=True)
    district_scope = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

class AuditLog(Base):
    __tablename__ = "audit_log"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=False, index=True)
    action = Column(String(50), nullable=False)
    target_type = Column(String(50), nullable=False)
    target_id = Column(String(100), nullable=False)
    old_val = Column(Text, nullable=True)
    new_val = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

class PlannerOverride(Base):
    __tablename__ = "planner_overrides"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=False)
    district_code = Column(String(20), nullable=False)
    trade_id = Column(String(50), nullable=False)
    month = Column(String(7), nullable=False)
    override_type = Column(String(30), default="target_seats")
    original_val = Column(Float, nullable=False)
    override_val = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

class AlertSubscription(Base):
    __tablename__ = "alert_subscriptions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=False)
    email = Column(String(100), nullable=False)
    channel = Column(String(20), default="email") # email | whatsapp | in_app
    state_scope = Column(String(10), nullable=True)
    district_scope = Column(String(20), nullable=True)
    severity_filter = Column(String(30), default="all")
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
