import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RiskBadge } from '../components/RiskBadge';
import { OverrideModal } from '../components/OverrideModal';
import { api } from '../services/api';
import ReactECharts from 'echarts-for-react';
import { Sliders, CheckCircle2, TrendingUp } from 'lucide-react';

export const WhatIfScreen: React.FC = () => {
  const [districtCode] = useState('091'); // Jaipur
  const [tradeId] = useState('trade_solar_pv'); // Solar PV
  const [seatChangePct, setSeatChangePct] = useState(30);
  const [simulation, setSimulation] = useState<any>(null);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [overrideSuccess, setOverrideSuccess] = useState(false);

  useEffect(() => {
    async function runSim() {
      try {
        const res = await api.runWhatIf({
          district_code: districtCode,
          trade_id: tradeId,
          seat_change_pct: seatChangePct
        });
        setSimulation(res);
      } catch (_err) {
        // Fallback
      }
    }
    runSim();
  }, [seatChangePct, districtCode, tradeId]);

  const seriesData = simulation?.series || [];
  const months = seriesData.map((s: any) => s.month);
  const baselineSupply = seriesData.map((s: any) => s.baselineSupply);
  const simulatedSupply = seriesData.map((s: any) => s.simulatedSupply);
  const demandLine = seriesData.map((s: any) => s.demandP50);

  const option = {
    grid: { top: 30, right: 25, bottom: 35, left: 55 },
    tooltip: { trigger: 'axis', textStyle: { fontFamily: 'monospace' } },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: { fontFamily: 'monospace', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#E2E8F0' } },
      axisLabel: { fontFamily: 'monospace', fontSize: 10 }
    },
    series: [
      {
        name: 'Hiring Demand',
        type: 'line',
        data: demandLine,
        lineStyle: { color: '#2563EB', width: 2 },
        itemStyle: { color: '#2563EB' }
      },
      {
        name: 'Baseline Supply',
        type: 'line',
        data: baselineSupply,
        lineStyle: { color: '#000000', width: 2, type: 'dashed' },
        itemStyle: { color: '#000000' }
      },
      {
        name: 'Simulated Supply (Pipeline Lag)',
        type: 'line',
        data: simulatedSupply,
        lineStyle: { color: '#16A34A', width: 2.5 },
        itemStyle: { color: '#16A34A' }
      }
    ]
  };

  return (
    <div className="space-y-6">
      <Header
        breadcrumbs={['NATIONAL', 'SIMULATOR', 'JAIPUR · SOLAR PV']}
        titleEn="What-If Capacity Simulator"
        titleHi="व्हाट-इफ क्षमता सिमुलेटर"
        isDemoData={true}
      />

      {/* Simulator Inputs Card */}
      <div className="border border-black bg-white p-5 shadow-[1px_1px_0px_0px_#000000]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-black">
          <h2 className="text-sm font-extrabold uppercase tracking-tight text-black flex items-center gap-2">
            <Sliders className="w-4 h-4 text-black" />
            <span>Interactive Sanctioned Seat Modification</span>
          </h2>
          <span className="text-xs font-mono text-slate-500">
            Pipeline lag: {simulation?.courseDurationMonths || 6} Months Course Duration
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3 font-mono text-xs">
            <div className="flex justify-between font-bold">
              <span>Sanctioned Seats Adjustment:</span>
              <span className="text-sm text-blue-700">+{seatChangePct}% ({Math.round(2900 * (seatChangePct / 100))} additional seats)</span>
            </div>
            <input
              type="range"
              min={-50}
              max={100}
              step={5}
              value={seatChangePct}
              onChange={(e) => setSeatChangePct(Number(e.target.value))}
              className="w-full accent-black cursor-pointer h-2 bg-slate-200"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>-50% (Cut)</span>
              <span>0% (Neutral)</span>
              <span>+50% (Expansion)</span>
              <span>+100% (Double Capacity)</span>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col space-y-2">
            <button
              type="button"
              onClick={() => setIsOverrideOpen(true)}
              className="w-full py-2.5 bg-black text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-slate-800 shadow-[2px_2px_0px_0px_#000000]"
            >
              Apply as Planner Override
            </button>
          </div>
        </div>
      </div>

      {overrideSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-600 text-emerald-900 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Simulated scenario successfully applied to official planner target registry.</span>
        </div>
      )}

      {/* Before vs After KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
        <div className="border border-black bg-white p-4">
          <p className="text-xs uppercase text-slate-600 font-bold">Baseline Gap</p>
          <p className="text-xl font-black text-red-700 mt-1">+{simulation?.baselineGap || 2300} jobs</p>
          <div className="mt-2">
            <RiskBadge label={simulation?.baselineRiskLabel || 'critical_shortage'} showIcon={false} />
          </div>
        </div>

        <div className="border border-black bg-white p-4">
          <p className="text-xs uppercase text-slate-600 font-bold">Simulated Gap (Terminal)</p>
          <p className="text-xl font-black text-blue-700 mt-1">+{simulation?.simulatedGap || 1720} jobs</p>
          <div className="mt-2">
            <RiskBadge label={simulation?.simulatedRiskLabel || 'shortage'} showIcon={false} />
          </div>
        </div>

        <div className="border border-black bg-white p-4">
          <p className="text-xs uppercase text-slate-600 font-bold">Net Gap Reduction</p>
          <p className="text-xl font-black text-emerald-700 mt-1">
            {simulation?.gapReductionPct || 25.2}%
          </p>
          <span className="text-[11px] text-slate-500 block mt-2">Deficit alleviated</span>
        </div>

        <div className="border border-black bg-white p-4">
          <p className="text-xs uppercase text-slate-600 font-bold">Effective Pipeline Delay</p>
          <p className="text-xl font-black text-black mt-1">
            {simulation?.courseDurationMonths || 6} Months
          </p>
          <span className="text-[11px] text-slate-500 block mt-2">Zero output until month 6</span>
        </div>
      </div>

      {/* Live Simulation Curve Chart */}
      <div className="border border-black bg-white p-5 shadow-[1px_1px_0px_0px_#000000]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-extrabold text-sm uppercase tracking-tight text-black flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <span>Simulated Trainee Pipeline Curve (Lag Delay Visible)</span>
          </h3>
          <span className="text-xs font-mono text-slate-500">
            Green line ramps only after {simulation?.courseDurationMonths || 6} months course duration
          </span>
        </div>

        <div className="h-[260px] w-full">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
        </div>

        <div className="flex items-center space-x-6 text-xs font-mono text-black mt-3 pt-2 border-t border-slate-200">
          <div className="flex items-center space-x-2">
            <span className="w-4 h-0.5 bg-[#2563EB] inline-block" />
            <span>Demand P50</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-black inline-block" />
            <span>Baseline Supply</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 h-0.5 bg-[#16A34A] inline-block" />
            <span className="font-bold text-emerald-800">Simulated Supply (+{seatChangePct}%)</span>
          </div>
        </div>
      </div>

      <OverrideModal
        isOpen={isOverrideOpen}
        onClose={() => setIsOverrideOpen(false)}
        districtCode={districtCode}
        tradeId={tradeId}
        tradeName="Solar PV Technician"
        currentSeats={2900}
        onSuccess={() => setOverrideSuccess(true)}
      />
    </div>
  );
};
