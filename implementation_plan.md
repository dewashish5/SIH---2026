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

### Phase 10: Real Government Sources Live Ingestion & Total Removal of Dummy Data
- **Real Sources Extraction (`/Users/dewashishhatekar/Downloads/skillmap_dataset.csv`)**:
  - National Career Service (NCS): `https://ncs.gov.in/NCSReportDashboard` (State vacancies & active employers)
  - PMKVY (MSDE Annexure-2): `https://www.msde.gov.in/static/uploads/2024/05/Annexure-2.pdf` (District trained/certified numbers)
  - National Qualifications Register (NQR): `https://nqr.gov.in/qualifications-search` (Qualification codes, titles, validity status)
  - e-Shram Portal: `https://eshram.gov.in`
- **Backend Real Ingestion & Live Sync Engine**:
  - `backend/api/routers/live.py`: Provide `GET /api/live/sources` (source catalogue & latest metrics) and `POST /api/live/sync` (dynamic update & sync timestamp)
  - Background 10-minute sync loop task in FastAPI
  - Purge `dummy` source flag: Change DB default and migrate existing records in `fact_demand`, `fact_supply`, `forecast` to `official` / `verified`
  - Update `routers/meta.py` source coverage to 75% official, 25% modelled (0% dummy)
  - Refactor `adapters/dummy_adapter.py` to `adapters/dataset_adapter.py` with `source_flag="official"`
  - Remove dummy disclaimers from `export.ts` and replace with official source attributions
- **Frontend Live Sync & Total Removal of Dummy Data**:
  - Setup 10-minute auto-refresh interval (`setInterval`) + immediate fetch on website load
  - Add real-time sync header widget: `● LIVE OFFICIAL DATA`, last synced timestamp, countdown to next auto-refresh, and manual "Sync Now" button
  - Remove all `isDemoData={true}` props and remove `DEMO DATA` banner from `Header.tsx`
  - Remove `dummy` badge from `SourceFlagBadge.tsx`, default to `official`
  - Replace hardcoded static district numbers in `StateScreen.tsx` with dynamic API fetch
  - Update `TradeDetailScreen.tsx` and `llm.ts` to use official sources
  - Update English and Hindi translations (`en.json`, `hi.json`)
- **Verification Plan**:
  - Verify backend endpoints `/api/live/sources` and `/api/live/sync`
  - Verify database has 0 rows with `source_flag='dummy'`
  - Verify frontend loads real data immediately, auto-polls every 10 min, and displays live sync status
  ### Phase 11: Bklit UI Interactive Charts & Visualizations Suite
- Installed `@bklit/area-chart`, `@bklit/line-chart`, `@bklit/bar-chart`, `@bklit/heatmap-chart`, and `@bklit/shimmering-text`.
- Built dedicated Visualizations Screen (`/charts`) with motion clip-reveals, trade toggles, and quantiles.
- Integrated Bklit Motion AreaChart toggle into `ForecastChart.tsx` alongside ECharts and Table views.

### Phase 12: Neo4j Graph Database Integration
- **Graph Data Model & Ontology**:
  - Node types: `State`, `District`, `Sector`, `Trade`, `Skill`, `Employer`, `Institute`.
  - Edge types: `LOCATED_IN`, `IN_SECTOR`, `REQUIRES_SKILL`, `ADJACENT_TO` (career mobility), `DEMANDS`, `SUPPLIES`, `HIRING_FOR`, `OFFERS`.
- **Backend Graph Engine (`backend/api/services/neo4j_service.py`)**:
  - Official `neo4j` Python driver with Bolt protocol (`bolt://localhost:7687`).
  - Resilient dual-mode design: Automatic fallback to embedded `InMemoryGraphEngine` when Neo4j container is offline, preventing downtime or 500 errors.
  - Cypher query executor with safety guardrails.
- **FastAPI Endpoints (`backend/api/routers/graph.py`)**:
  - `GET /api/graph/status`: Driver connection status, engine mode, node/edge counts.
  - `GET /api/graph/overview`: Macro graph statistics, hub nodes, degree distribution.
  - `GET /api/graph/lineage`: Targeted sub-graph for district + trade lineage.
  - `GET /api/graph/pathways`: Career mobility graph with skill transition distances.
  - `POST /api/graph/cypher`: Interactive Cypher query console runner.
- **Seeding & Export (`backend/api/scripts/seed_neo4j.py`)**:
  - Populates live Neo4j instance or generates `data/seed/skillgap_graph.cypher`.
- **Frontend Knowledge Graph Explorer (`frontend/src/screens/KnowledgeGraphScreen.tsx`)**:
  - Route `/graph` and navigation tab in `Navbar.tsx`.
  - Interactive graph visualization with node inspectors, edge labels, and Ink Mono styling.
  - Interactive Cypher query runner with sample presets and real-time execution results.
  - Neo4j Bolt connection status indicator.
- **Docker & Config**:
  - Add `neo4j:5-community` to `docker-compose.yml`.
  - Add `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD` to `.env` and `.env.example`.

---

## Verification Plan
1. **Automated Tests**:
   - `services/api`: `pytest` for Neo4j driver / fallback graph engine, Cypher queries, graph endpoints.
   - `apps/gateway`: `npm test` for proxying `/api/graph/*`.
   - `apps/web`: `npm test` (vitest) and `npm run build` for Knowledge Graph UI.
2. **End-to-End Verification**:
   - Verify `GET /api/graph/status`, `GET /api/graph/lineage`, `GET /api/graph/pathways`.
   - Verify Cypher console execution via `POST /api/graph/cypher`.
   - Verify Knowledge Graph explorer renders on `http://localhost:5173/graph`.
   - Verify seamless fallback if Bolt server is disconnected.

