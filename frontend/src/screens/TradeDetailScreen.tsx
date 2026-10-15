import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { ForecastChart } from '../components/ForecastChart';
import { WhyPanel } from '../components/WhyPanel';
import { RiskBadge } from '../components/RiskBadge';
import { SourceFlagBadge } from '../components/SourceFlagBadge';
import { OverrideModal } from '../components/OverrideModal';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Sliders, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const TradeDetailScreen: React.FC = () => {
  const [districtCode] = useState('091'); // Jaipur
  const [tradeId] = useState('trade_solar_pv'); // Solar PV Tech
  const [forecastData, setForecastData] = useState<any>(null);
  const [whyData, setWhyData] = useState<any>(null);
  const [recData, setRecData] = useState<any>(null);
  const [breakdownData, setBreakdownData] = useState<any>(null);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [overrideSuccess, setOverrideSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [fc, why, rec, bd] = await Promise.all([
          api.getForecast(districtCode, tradeId),
          api.getTradeWhy(tradeId, districtCode),
          api.getRecommendations(districtCode, tradeId),
          api.getDemandBreakdown(districtCode, tradeId)
        ]);
        setForecastData(fc);
        setWhyData(why);
        setRecData(rec);
        setBreakdownData(bd);
      } catch (_err) {
        // Fallback
      }
    }
    loadData();
  }, [districtCode, tradeId]);

  return (
    <div className="space-y-6">
      <Header
        breadcrumbs={['NATIONAL', 'RAJASTHAN', 'JAIPUR', 'SOLAR PV TECHNICIAN']}
        titleEn="Solar PV Technician"
        titleHi="सौर पीवी तकनीशियन"
      />

      {/* Overview Tag Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-black bg-white p-4 shadow-[1px_1px_0px_0px_#000000]">
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <RiskBadge label="critical_shortage" />
          <SourceFlagBadge flag="official" />
          <span className="px-2.5 py-1 bg-slate-100 border border-black font-bold text-black">
            NCO: 7421.0301
          </span>
          <span className="px-2.5 py-1 bg-slate-100 border border-black font-bold text-black">
            NSQF Level: 4
          </span>
          <span className="px-2.5 py-1 bg-slate-100 border border-black font-bold text-black">
            Duration: 6 Months
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/whatif"
            className="px-3 py-1.5 bg-white border border-black text-xs font-bold font-mono hover:bg-slate-100 inline-flex items-center gap-1.5 shadow-[1px_1px_0px_0px_#000000]"
          >
            <Sliders className="w-3.5 h-3.5 text-black" />
            <span>Run What-If</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsOverrideOpen(true)}
            className="px-3 py-1.5 bg-black text-white border border-black text-xs font-bold font-mono hover:bg-slate-800 shadow-[1px_1px_0px_0px_#000000]"
          >
            Apply Override
          </button>
        </div>
      </div>

      {overrideSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-600 text-emerald-900 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Planner override committed successfully and logged in immutable audit registry.</span>
        </div>
      )}

      {/* Chart & Recommendation Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ForecastChart
            title="Jaipur · Solar PV Technician (12-Month Forecast)"
            historical={forecastData?.historical}
            forecast={forecastData?.forecast}
          />
        </div>

        {/* Recommendation Panel */}
        <div className="lg:col-span-4 border border-black bg-white p-5 shadow-[1px_1px_0px_0px_#000000] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-black">
              <h3 className="font-extrabold text-sm uppercase tracking-tight text-black flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Target Recommendation</span>
              </h3>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-red-100 text-red-900 border border-red-500">
                Action Required
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <p className="text-slate-800 font-sans text-xs leading-relaxed">
                {recData?.rationaleEn ||
                  'Acute shortage detected (Gap: +2,300 jobs). Sanction +350 additional seats across government and private ITIs to meet industry demand.'}
              </p>
              <div className="p-3 bg-slate-50 border border-slate-300 space-y-1">
                <p className="text-slate-500">Sanctioned Seats (Current): <span className="font-bold text-black">2,900</span></p>
                <p className="text-slate-500">Recommended Adjustment: <span className="font-bold text-emerald-700">+350 Seats</span></p>
                <p className="text-slate-500">Pipeline Completion Lag: <span className="font-bold text-black">6 Months</span></p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsOverrideOpen(true)}
              className="w-full py-2 bg-black text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-slate-800"
            >
              Commit Seat Allocation Target
            </button>
          </div>
        </div>
      </div>

      {/* SHAP Drivers & Demand Index Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <WhyPanel
            topDrivers={whyData?.topDrivers || []}
            narrativeEn={whyData?.narrativeEn}
            narrativeHi={whyData?.narrativeHi}
          />
        </div>

        {/* Demand Index Breakdown */}
        <div className="lg:col-span-5 border border-black bg-white p-5 shadow-[1px_1px_0px_0px_#000000]">
          <h3 className="font-bold text-sm tracking-tight text-black mb-3">
            Demand Index Signal Composition (Score: {breakdownData?.demandIndex || 82.5}/100)
          </h3>
          <p className="text-xs text-slate-600 mb-4 font-mono">
            Weighted composite sum calibrated per MSDE methodology:
          </p>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span>NCS Vacancy Feed (35% weight)</span>
              <span className="font-bold text-black">86.0 / 100</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span>Online Job Portals (25% weight)</span>
              <span className="font-bold text-black">92.0 / 100</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span>Industrial Capex Growth (15% weight)</span>
              <span className="font-bold text-black">75.0 / 100</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span>PLFS Employment Trend (15% weight)</span>
              <span className="font-bold text-black">60.0 / 100 (Modelled)</span>
            </div>
            <div className="flex justify-between pb-1">
              <span>e-Shram Worker Supply (10% weight)</span>
              <span className="font-bold text-black">55.0 / 100</span>
            </div>
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
