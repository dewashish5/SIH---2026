# Task Checklist: SkillGap Intelligence (PS 26246)

- [x] Phase 0: Monorepo Scaffold & Conventions <!-- id: 0 -->
  - [x] Initialize monorepo structure (apps/web, apps/gateway, services/api, packages/types, data, docs) <!-- id: 0.1 -->
  - [x] Setup services/api (FastAPI, Pydantic v2, Alembic, pytest, ruff, /healthz) <!-- id: 0.2 -->
  - [x] Setup apps/gateway (Express TS, Zod, JWT, pino, proxy /api/*, /healthz) <!-- id: 0.3 -->
  - [x] Setup apps/web (Vite, React 18, TS, Tailwind CSS, healthcheck call) <!-- id: 0.4 -->
  - [x] Setup OpenAPI to TypeScript types pipeline (`npm run gen:types`) <!-- id: 0.5 -->
  - [x] Create docker-compose.yml, .env.example, root package.json, GitHub Actions workflow <!-- id: 0.6 -->
  - [x] Verify Phase 0 acceptance (healthcheck e2e, lint, tests) <!-- id: 0.7 -->

- [x] Phase 1: Data Contract, DB Schema, Mock Data Seed <!-- id: 1 -->
  - [x] Create data/geo/districts.geojson (Rajasthan, Maharashtra, Karnataka with LGD codes) <!-- id: 1.1 -->
  - [x] Implement DB schema (lmis and app schemas) via SQLAlchemy/Alembic <!-- id: 1.2 -->
  - [x] Build deterministic seed generator (data/seed/generate_mock.py) with Jaipur Solar & Electrician cases <!-- id: 1.3 -->
  - [x] Implement DATA_SOURCE=mock|postgres switch and DummyDatasetAdapter with CSV validator <!-- id: 1.4 -->
  - [x] Generate docs/data_dictionary.md and docs/api_contract.md <!-- id: 1.5 -->
  - [x] Verify Phase 1 acceptance (seed DB, SQL checks, adapter tests) <!-- id: 1.6 -->

- [x] Phase 2: FastAPI: Data Endpoints & Rule Engine <!-- id: 2 -->
  - [x] Implement engine: thresholds.py, gap.py, recommend.py, whatif.py <!-- id: 2.1 -->
  - [x] Implement auth & role/scope filtering (national, state, district, viewer) <!-- id: 2.2 -->
  - [x] Implement routers: forecast, gap/rank, alerts, whatif, recommendations, trade why, geo, meta, dimensions <!-- id: 2.3 -->
  - [x] Write unit tests for pure engine functions & scope guards <!-- id: 2.4 -->
  - [x] Verify Phase 2 acceptance (OpenAPI docs, pytest green, scope enforcement) <!-- id: 2.5 -->

- [x] Phase 3: Express Gateway (BFF) <!-- id: 3 -->
  - [x] Implement auth routes (login, refresh, me with bcrypt & JWT) <!-- id: 3.1 -->
  - [x] Implement proxy with in-memory caching for meta/geo/dimensions <!-- id: 3.2 -->
  - [x] Implement CSV and XLSX streaming export with disclaimer <!-- id: 3.3 -->
  - [x] Implement planner overrides & audit_log persistence <!-- id: 3.4 -->
  - [x] Implement alerts subscription & dispatch (EmailNotifier & WhatsAppNotifier stub) <!-- id: 3.5 -->
  - [x] Write gateway tests (supertest) & verify Phase 3 acceptance <!-- id: 3.6 -->

- [x] Phase 4: Frontend Foundation: Design System, i18n, A11y, Shell <!-- id: 4 -->
  - [x] Setup Tailwind design tokens matching Ink Mono theme (B · Ink Mono@2x.png) <!-- id: 4.1 -->
  - [x] Setup i18next (en + hi complete) <!-- id: 4.2 -->
  - [x] Build App Shell (left nav, top breadcrumb, language toggle EN/HI, demo data chip) <!-- id: 4.3 -->
  - [x] Build core reusable components (RiskBadge, SourceFlagBadge, KpiCard, DistrictGrid, ForecastChart, WhyPanel, SunburstChart, Loader) <!-- id: 4.4 -->
  - [x] Verify Phase 4 acceptance (a11y, badges, i18n completeness) <!-- id: 4.5 -->

- [x] Phase 5: Screens 1-4: National, State, District, Trade Drill-Down <!-- id: 5 -->
  - [x] Screen 1: National Overview (KPI summary, pilot state cards, sunburst radial chart, table toggle) <!-- id: 5.1 -->
  - [x] Screen 2: State View (exact match of B · Ink Mono@2x.png: 3 KPI cards, 4x4 district matrix, dual forecast chart) <!-- id: 5.2 -->
  - [x] Screen 3: District View (sector/trade table, sparklines, quality scores) <!-- id: 5.3 -->
  - [x] Screen 4: Trade Detail (ForecastChart with P10/P50/P90 band, Why panel, signal breakdown, recommendation, override modal) <!-- id: 5.4 -->
  - [x] Verify Phase 5 acceptance (full drill-down National → Rajasthan → Jaipur → Solar PV Tech) <!-- id: 5.5 -->

- [x] Phase 6: Screens 5-8: Ranking, What-If, Alerts, Methodology <!-- id: 6 -->
  - [x] Screen 5: Ranking Board (shortage/oversupply tabs, severity score, CSV/XLSX export) <!-- id: 6.1 -->
  - [x] Screen 6: What-If Simulator (interactive seat slider, pipeline delay lag curve, KPI changes, override commit) <!-- id: 6.2 -->
  - [x] Screen 7: Early-Warning Alerts (severity filters, driver insights, subscription form) <!-- id: 6.3 -->
  - [x] Screen 8: Methodology & Transparency Page (formula, weights, sources, limitations, model card, lineage) <!-- id: 6.4 -->
  - [x] Verify Phase 6 acceptance (exports, what-if curves, override audit, methodology printable) <!-- id: 6.5 -->

- [x] Phase 7: Grounded Q&A Assistant <!-- id: 7 -->
  - [x] Gateway/API tool-calling queries strictly accessing backend endpoints <!-- id: 7.1 -->
  - [x] Frontend chat drawer with verified citations (district, trade, run_id, source_flag) <!-- id: 7.2 -->
  - [x] Resilient multi-tier LLM client (Gemini keys 1-3 -> Groq keys 1-3 -> Grounded LMIS Rules) <!-- id: 7.3 -->
  - [x] Gateway /assistant/chat endpoint with multi-key rotation and model fallback <!-- id: 7.4 -->
  - [x] Neo-brutalist chat assistant UI (B · Ink Mono theme, uiverse rhythmic loader, prompt chips, copy button) <!-- id: 7.5 -->
  - [x] Enterprise Prompt Injection & Jailbreak Guardrails (heuristic signatures, override blocks) <!-- id: 7.6 -->
  - [x] Real-time PII Auto-Masking (Aadhaar, PAN, phone, email redaction) <!-- id: 7.7 -->
  - [x] Input Sandboxing (`<user_query>` XML boundaries) & Output XSS HTML stripping <!-- id: 7.8 -->
  - [x] Gateway Rate Limiting (20 req/min) & UI Guardrail Defense Alert Banners <!-- id: 7.9 -->

- [x] Phase 8: Hardening, Performance, Production Packaging <!-- id: 8 -->
  - [x] Code splitting, fast Vite build, SQLite/PostgreSQL dual-database support <!-- id: 8.1 -->
  - [x] Security hardening (helmet, rate limits, Zod validation, JWT RBAC) <!-- id: 8.2 -->
  - [x] Dockerfiles & compose setup for frontend, gateway, api, postgres <!-- id: 8.3 -->
  - [x] Write docs/methodology.md, docs/model_card.md, root README.md <!-- id: 8.4 -->

- [x] Phase 9: Final Polish & Demo Script <!-- id: 9 -->
  - [x] Deterministic seed data reset script (data/seed/generate_mock.py) <!-- id: 9.1 -->
  - [x] 5-minute SIH presentation walkthrough verification <!-- id: 9.2 -->
  - [x] Full audit against Part D Definition of Done <!-- id: 9.3 -->
