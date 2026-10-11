# Implementation Plan: SkillGap Intelligence (PS 26246)

AI-Enabled Labour Market Intelligence and Skill Demand-Supply Forecasting Engine (MSDE / SIH 2026).

---

## User Review Required

> [!IMPORTANT]
> - Phase-by-phase execution per Prompt Pack A11. We begin with **Phase 0** scaffold, followed by confirmation and Phase 1.
> - Monorepo architecture: `apps/web` (React 18 + Vite + TS), `apps/gateway` (Express BFF + TS), `services/api` (FastAPI + Python), `packages/types` (Shared types generated from OpenAPI), `data/` and `docs/`.
> - SQLite/PostgreSQL fallback: To allow instant local execution with `DATA_SOURCE=mock` or SQLite without Docker daemon mandatory running, FastAPI + SQLAlchemy is configured with SQLite/PostGIS-compatible fallback or PostgreSQL, with full Docker Compose provided for full Postgres/PostGIS stack.

---

## Phase Breakdown

### Phase 0: Monorepo Scaffold & Conventions
- **Directories**:
  - `apps/web`: Vite + React 18 + TypeScript + Tailwind CSS + Lucide icons
  - `apps/gateway`: Express + TypeScript + Zod + JWT + CORS + Helmet + Pino
  - `services/api`: FastAPI + Pydantic v2 + SQLAlchemy 2 + pytest + ruff
  - `packages/types`: Shared TypeScript definitions generated from FastAPI OpenAPI
  - `data/`: geo, mappings, seed
  - `docs/`: documentation
- **Health Endpoints**:
  - FastAPI: `GET /healthz` returning status, version, timestamp
  - Express Gateway: `GET /healthz` and proxy `GET /api/*` → FastAPI
- **Web App**:
  - Calls Gateway `GET /healthz` & `GET /api/healthz`, renders operational banner
- **Tooling**:
  - Root `package.json` with npm workspaces (`web`, `gateway`, `types`)
  - Root `docker-compose.yml` with `api`, `gateway`, `web`, `postgres`
  - `.env.example` documenting all configuration keys
  - GitHub Actions CI workflow for lint and unit tests

### Phase 1: Data Contract, DB Schema & Mock Data Seed
- **Alembic / SQLAlchemy Schemas**:
  - `lmis` schema: `dim_geo`, `dim_sector`, `dim_trade`, `fact_demand`, `fact_supply`, `fact_macro`, `idx_demand`, `forecast_run`, `forecast`, `risk_alert`, `backtest`, `model_card`, `data_lineage`
  - `app` schema: `users`, `audit_log`, `planner_overrides`, `alert_subscriptions`
- **Data Seed Generator (`data/seed/generate_mock.py`)**:
  - Deterministic random seed (42)
  - States: Rajasthan (08), Maharashtra (27), Karnataka (29) with real LGD codes and district GeoJSON
  - Sectors: Electrical/Solar, Healthcare, Construction, Automotive/EV, IT-ITeS
  - 18 Trades with NCO-2015 codes, NSQF levels, EN/HI names
  - Monthly history (2022-01 to 2026-09), forecasts (2026-10 to 2027-09) with P10/P50/P90, gap ratios, and 5 risk classifications
  - Benchmark narrative cases: Jaipur Solar PV Technician (critical shortage), pilot district Electrician (oversupply/saturation)
  - `DATA_SOURCE=mock|postgres` config toggle + `DummyDatasetAdapter` for SIH CSV ingestion
  - `docs/data_dictionary.md` and `docs/api_contract.md`

### Phase 2: FastAPI Data Endpoints & Rule Engine
- **Engine**:
  - `engine/thresholds.py`: Configurable risk ratio bands
  - `engine/gap.py`: Flow-based gap calculation, gap ratio, normalized severity score
  - `engine/recommend.py`: Seat adjustment formula with completion/placement factors, trade reallocation logic
  - `engine/whatif.py`: Supply recalculation with pipeline delay lag (`course_duration_months`)
- **API Routers (`/api/v1`)**:
  - `/forecast`, `/gap/rank`, `/alerts`, `/whatif`, `/recommendations`, `/trade/{id}/why`, `/geo/{level}`, `/meta/*`, `/dimensions`
  - JWT auth validation with role-based scope filtering (national, state, district)
  - Comprehensive pytest suite

### Phase 3: Express Gateway (BFF)
- Auth endpoints: `/auth/login`, `/auth/refresh`, `/auth/me` with seeded role accounts
- Reverse proxy to FastAPI with in-memory caching for metadata/geo/dimensions
- CSV & XLSX streaming export for target-setting sheets with methodology disclaimers
- Planner overrides CRUD & audit log
- Alert subscriptions & notifier system (EmailNotifier + WhatsAppNotifier stub)
- Supertest integration tests

### Phase 4: Frontend Foundation (Design System, i18n, A11y, Shell)
- Custom design tokens: Calm policy analytics aesthetic, light & high-contrast themes, WCAG 2.1 AA compliant
- Fonts: Inter & Noto Sans Devanagari
- i18n: Complete EN and HI translations; MR and KN scaffolding
- Shell: Collapsible left navigation (8 screens), breadcrumb header, theme toggle, low-bandwidth mode toggle, refresh chip
- Core components: `RiskBadge`, `SourceFlagBadge`, `QualityScore`, `LowConfidenceBadge`, `KpiCard`, `DataTable`, `ForecastChart`, `WhyPanel`, `Breadcrumb`, `FilterBar`, `Skeleton`, `EmptyState`
- Component preview gallery at `/dev/components`

### Phase 5: Screens 1-4 Drill-Down
- **National Overview**: KPI summary, MapLibre choropleth map with sector/horizon filter, top shortage/oversupply lists, table fallback
- **State View**: District map & rank table, quality metrics, sector tabs
- **District View**: Trade table with risk badges, demand/supply sparklines, low-confidence chips
- **Trade Detail**: Dual demand/supply forecast chart with P10-P90 confidence ribbons, Why? panel with SHAP drivers, Demand Index signal breakdown, recommendation card, what-if entry, override modal

### Phase 6: Screens 5-8 (Ranking, What-If, Alerts, Methodology)
- **Ranking Board**: Severity-ranked shortage & oversupply tabs, multi-dimension filters, direct CSV/XLSX download
- **What-If Simulator**: Interactive seat adjustment inputs, animated pipeline delay curve, before/after KPI diffs, override commit
- **Early-Warning Alerts**: Live threshold alerts, severity filters, notification subscription modal
- **Methodology & Transparency**: Formula breakdown, signal weights, data source lineage, model cards, limitation statements, printable layout

### Phase 7: Grounded Q&A Assistant
- Context-grounded assistant calling backend endpoints (`get_forecast`, `get_rank`, `get_alerts`, `run_whatif`)
- Strict citation rendering (district, trade, run ID, source flag)

### Phase 8: Hardening, Performance & Deploy
- Bundle splitting, lazy loading, gzip compression, DB index tuning
- Full Dockerization & health monitoring
- Final `docs/methodology.md`, `docs/model_card.md`, and complete README

### Phase 9: Finale Polish & Rehearsal
- Demo reset automation (`npm run demo:reset`)
- 5-minute SIH presentation walkthrough script and pitch points
- Full audit against Part D Definition of Done

---

## Verification Plan
1. **Automated Tests**:
   - `services/api`: `pytest` for engine logic, threshold edges, scope guards, adapter validation
   - `apps/gateway`: `npm test` (supertest) for auth, proxying, CSV/XLSX generation, audit logging
   - `apps/web`: `npm test` (vitest) for badges, i18n, filter state
2. **End-to-End Verification**:
   - Start services locally or via Docker
   - Verify drill-down: National → Rajasthan → Jaipur → Solar PV Technician
   - Verify What-If simulator lag response and override audit trail
   - Verify CSV/XLSX export downloads and opens with correct headers and disclaimer
   - Verify English & Hindi switching across all screens
