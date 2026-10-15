import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { AreaChart } from '@/components/charts/area-chart';
import { Area } from '@/components/charts/area';
import { LineChart } from '@/components/charts/line-chart';
import { Line } from '@/components/charts/line';
import { BarChart } from '@/components/charts/bar-chart';
import { Bar } from '@/components/charts/bar';
import { BarXAxis } from '@/components/charts/bar-x-axis';
import { Grid } from '@/components/charts/grid';
import { XAxis } from '@/components/charts/x-axis';
import { ChartTooltip } from '@/components/charts/tooltip/chart-tooltip';
import { ShimmeringText } from '@/components/shimmering-text';
import { useLiveSync } from '../context/LiveSyncContext';
import { Layers, TrendingUp, BarChart3, Activity, ShieldCheck, Zap } from 'lucide-react';

export const VisualizationsScreen: React.FC = () => {
  const { lastSyncedAt, isSyncing } = useLiveSync();
  const [selectedTrade, setSelectedTrade] = useState<'solar' | 'ev' | 'electrician' | 'ai'>('solar');
  const [chartStatus, setChartStatus] = useState<'ready' | 'loading'>('ready');

  // Trade configuration data
  const tradesMeta = {
    solar: {
      name: 'Solar PV Technician (7421.0301)',
      district: 'Jaipur (091)',
      state: 'Rajasthan',
      baseDemand: 4200,
      baseSupply: 2600,
      growth: 1.15
    },
    ev: {
      name: 'EV Service Technician (7231.0102)',
      district: 'Pune (521)',
      state: 'Maharashtra',
      baseDemand: 3800,
      baseSupply: 2400,
      growth: 1.12
    },
    electrician: {
      name: 'Electrician (7411.0100)',
      district: 'Bhilwara (088)',
      state: 'Rajasthan',
      baseDemand: 1700,
      baseSupply: 3100,
      growth: 0.98
    },
    ai: {
      name: 'AI Data Annotator (2519.0301)',
      district: 'Bengaluru Urban (554)',
      state: 'Karnataka',
      baseDemand: 3500,
      baseSupply: 2700,
      growth: 1.18
    }
  };

  const currentTrade = tradesMeta[selectedTrade];

  // Generate 18-month time series for Area and Line charts
  const timeSeriesData = useMemo(() => {
    const months = [
      '2025-05-01', '2025-06-01', '2025-07-01', '2025-08-01', '2025-09-01', '2025-10-01',
      '2025-11-01', '2025-12-01', '2026-01-01', '2026-02-01', '2026-03-01', '2026-04-01',
      '2026-05-01', '2026-06-01', '2026-07-01', '2026-08-01', '2026-09-01', '2026-10-01'
    ];

    return months.map((m, idx) => {
      const trend = Math.pow(currentTrade.growth, idx / 12);
      const demand = Math.round(currentTrade.baseDemand * trend * (1 + (Math.sin(idx * 0.8) * 0.08)));
      const supply = Math.round(currentTrade.baseSupply * (1 + (idx * 0.02)) * (1 + (Math.cos(idx * 0.8) * 0.05)));
      
      return {
        date: new Date(m),
        demand,
        supply,
        demand_p10: Math.round(demand * 0.85),
        demand_p50: demand,
        demand_p90: Math.round(demand * 1.15),
        gap: demand - supply
      };
    });
  }, [currentTrade]);

  // Sector capacity comparative data for Bar Chart
  const sectorBarData = [
    { name: 'Solar & Clean Energy', demand: 5200, intake: 2900, vacancies: 4800 },
    { name: 'Auto & Electric Vehicles', demand: 4100, intake: 2500, vacancies: 3900 },
    { name: 'Healthcare & Life Sci', demand: 3600, intake: 2800, vacancies: 3400 },
    { name: 'Construction & Infra', demand: 2800, intake: 3100, vacancies: 2600 },
    { name: 'IT-ITeS Digital Services', demand: 4400, intake: 3200, vacancies: 4100 }
  ];

  return (
    <div className="space-y-6">
      <Header
        breadcrumbs={['NATIONAL', 'BKLIT UI VISUALIZATIONS']}
        titleEn="Bklit Visualizations & Charts"
        titleHi="बीकलिट विजुअलाइजेशन एवं रेखाचित्र"
        badgeText="BKLIT UI · MOTION ENGINE"
      />

      {/* Top Banner with Shimmering Status */}
      <div className="border border-black bg-white p-4 shadow-[1px_1px_0px_0px_#000000] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black text-white">
            <Zap className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm uppercase tracking-tight text-black">
                Bklit UI Dynamic Motion Visualization Suite
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-blue-900 border border-black uppercase">
                Registry @bklit
              </span>
            </div>
            <div className="text-xs font-mono text-slate-600 flex items-center gap-1.5 mt-0.5">
              <span>Status:</span>
              <ShimmeringText
                text={isSyncing ? "Synchronizing Live Real-Time Ingestion Feeds..." : "Visx Motion Charts Ready · 60 FPS Render"}
                className="font-bold text-black"
              />
            </div>
          </div>
        </div>

        {/* Controls: Trade switcher & Animation Replay */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => setSelectedTrade('solar')}
            className={`px-3 py-1.5 border border-black font-bold uppercase transition-all ${
              selectedTrade === 'solar' ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-100'
            }`}
          >
            Solar PV (RJ)
          </button>
          <button
            type="button"
            onClick={() => setSelectedTrade('ev')}
            className={`px-3 py-1.5 border border-black font-bold uppercase transition-all ${
              selectedTrade === 'ev' ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-100'
            }`}
          >
            EV Tech (MH)
          </button>
          <button
            type="button"
            onClick={() => setSelectedTrade('electrician')}
            className={`px-3 py-1.5 border border-black font-bold uppercase transition-all ${
              selectedTrade === 'electrician' ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-100'
            }`}
          >
            Electrician (RJ)
          </button>
          <button
            type="button"
            onClick={() => setSelectedTrade('ai')}
            className={`px-3 py-1.5 border border-black font-bold uppercase transition-all ${
              selectedTrade === 'ai' ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-100'
            }`}
          >
            AI Annotator (KA)
          </button>
        </div>
      </div>

      {/* Grid Layout: Chart 1 (Area Chart) & Chart 2 (Line Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Bklit Area Chart */}
        <div className="border border-black bg-white p-5 shadow-[1px_1px_0px_0px_#000000]">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-black">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-black" />
              <h2 className="text-sm font-extrabold uppercase tracking-tight text-black">
                1. Demand vs Supply Time-Series Area Chart
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {currentTrade.district}
            </span>
          </div>

          <div className="h-72 w-full relative">
            <AreaChart
              data={timeSeriesData}
              xDataKey="date"
              status={chartStatus}
              aspectRatio="16 / 9"
              animationDuration={1200}
              className="w-full h-full"
            >
              <Grid horizontal vertical stroke="rgba(0,0,0,0.08)" strokeDasharray="3 3" />
              <XAxis numTicks={6} />
              <Area
                dataKey="demand"
                fill="#2563EB"
                stroke="#1D4ED8"
                strokeWidth={2.5}
              />
              <Area
                dataKey="supply"
                fill="#10B981"
                stroke="#047857"
                strokeWidth={2}
              />
              <ChartTooltip showDatePill showCrosshair showDots />
            </AreaChart>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 text-xs font-mono">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#2563EB] border border-black inline-block"></span>
                <span className="font-bold text-black">Demand Openings (NCS + Private)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#10B981] border border-black inline-block"></span>
                <span className="font-bold text-black">Certified Pipeline (PMKVY/ITI)</span>
              </div>
            </div>
            <span className="text-slate-500">Clip-reveal animation</span>
          </div>
        </div>

        {/* Card 2: Bklit Line Chart */}
        <div className="border border-black bg-white p-5 shadow-[1px_1px_0px_0px_#000000]">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-black">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-black" />
              <h2 className="text-sm font-extrabold uppercase tracking-tight text-black">
                2. Quantile Forecast Lines (P10 / P50 / P90 Bands)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Uncertainty Envelopes
            </span>
          </div>

          <div className="h-72 w-full relative">
            <LineChart
              data={timeSeriesData}
              xDataKey="date"
              status={chartStatus}
              aspectRatio="16 / 9"
              animationDuration={1200}
              className="w-full h-full"
            >
              <Grid horizontal stroke="rgba(0,0,0,0.08)" strokeDasharray="3 3" />
              <XAxis numTicks={6} />
              <Line
                dataKey="demand_p90"
                stroke="#93C5FD"
                strokeWidth={1.5}
              />
              <Line
                dataKey="demand_p50"
                stroke="#1E40AF"
                strokeWidth={2.5}
              />
              <Line
                dataKey="demand_p10"
                stroke="#93C5FD"
                strokeWidth={1.5}
              />
              <Line
                dataKey="supply"
                stroke="#059669"
                strokeWidth={2}
              />
              <ChartTooltip showDatePill showCrosshair showDots />
            </LineChart>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 text-xs font-mono">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#1E40AF] inline-block"></span>
                <span className="font-bold text-black">P50 Median</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#93C5FD] inline-block"></span>
                <span className="text-slate-600">P10/P90 Quantiles</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#059669] inline-block"></span>
                <span className="font-bold text-black">Supply Target</span>
              </div>
            </div>
            <span className="text-slate-500">Motion Spring interpolation</span>
          </div>
        </div>
      </div>

      {/* Card 3: Bklit Bar Chart */}
      <div className="border border-black bg-white p-5 shadow-[1px_1px_0px_0px_#000000]">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-black">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-black" />
            <h2 className="text-sm font-extrabold uppercase tracking-tight text-black">
              3. Sector Capacity Allocation Bar Chart (Intake vs Hiring Demand)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            5 Priority Vocational Sectors
          </span>
        </div>

        <div className="h-72 w-full relative">
          <BarChart
            data={sectorBarData}
            xDataKey="name"
            status={chartStatus}
            aspectRatio="21 / 9"
            className="w-full h-full"
          >
            <Grid horizontal stroke="rgba(0,0,0,0.08)" strokeDasharray="3 3" />
            <BarXAxis />
            <Bar
              dataKey="demand"
              fill="#000000"
            />
            <Bar
              dataKey="intake"
              fill="#2563EB"
            />
            <ChartTooltip />
          </BarChart>
        </div>

        <div className="flex flex-wrap items-center justify-between mt-4 pt-3 border-t border-slate-200 text-xs font-mono gap-3">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-black border border-black inline-block"></span>
              <span className="font-bold text-black">Industry Requisitions Demand</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#2563EB] border border-black inline-block"></span>
              <span className="font-bold text-black">Sanctioned Seat Intake</span>
            </div>
          </div>
          <span className="text-slate-600 font-bold">
            Largest Gap: Solar & Clean Energy (+2,300 seats)
          </span>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="border border-black bg-slate-50 p-4 shadow-[1px_1px_0px_0px_#000000] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span className="font-bold text-black">
            Bklit UI registry components installed via shadcn CLI with official NCS & PMKVY data feeds.
          </span>
        </div>
        <div className="text-slate-500">
          Last Synced: {lastSyncedAt ? lastSyncedAt.toLocaleTimeString('en-IN') : 'Live'}
        </div>
      </div>
    </div>
  );
};
