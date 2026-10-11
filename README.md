# SkillGap Intelligence (PS 26246)

> **AI-Enabled Labour Market Intelligence and Skill Demand-Supply Forecasting Engine**  
> Ministry of Skill Development and Entrepreneurship (MSDE) | Smart India Hackathon 2026

## Overview
SkillGap Intelligence is a planner-facing decision-support dashboard for MSDE, NCVET, State Skill Missions, and Sector Skill Councils.
It answers: *"Where should we add, cut or reallocate training seats, 6-12 months from now?"*

## Architecture (Two Clean Root Folders)
- **Frontend (`frontend/`)**: React 18, TypeScript, Vite, Tailwind CSS, Apache ECharts, MapLibre GL, i18next (English + Hindi), Sunburst radial hierarchy, Ink Mono neo-brutalist theme.
- **Backend (`backend/`)**:
  - `backend/gateway/`: Node 20, Express BFF, TypeScript, Zod, JWT RBAC, Excel/CSV export streaming, Alert dispatch.
  - `backend/api/`: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic, Forecasting & Rule Engine.
- **Data & Seed (`data/`)**: GeoJSON district geometries, deterministic seed generator (`data/seed/generate_mock.py`).

## Quickstart

### 1. Requirements
- Node.js >= 20
- Python >= 3.11 with `uv` (recommended)
- Docker (optional)

### 2. Fast Local Development
```bash
# Install dependencies
npm install

# Start FastAPI Engine
npm run dev:api

# In another terminal: Start Gateway BFF
npm run dev:gateway

# In a third terminal: Start Web Client
npm run dev:frontend
```

### 3. Reset Database Seed
```bash
./backend/api/.venv/bin/python data/seed/generate_mock.py
```
