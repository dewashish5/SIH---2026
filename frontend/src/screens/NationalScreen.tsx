import React, { useState } from 'react';
import { Header } from '../components/Header';
import { KpiCard } from '../components/KpiCard';
import { RiskBadge } from '../components/RiskBadge';
import { SourceFlagBadge } from '../components/SourceFlagBadge';
import { Link } from 'react-router-dom';

import { SunburstChart } from '../components/SunburstChart';

export const NationalScreen: React.FC = () => {
  const [selectedSector, setSelectedSector] = useState('all');

  const pilotStates = [
    { code: '08', nameEn: 'Rajasthan', nameHi: 'राजस्थान', districts: 16, topShortage: 'Solar PV Technician (+44%)', status: 'critical_shortage' },
    { code: '27', nameEn: 'Maharashtra', nameHi: 'महाराष्ट्र', districts: 8, topShortage: 'EV Service Technician (+39%)', status: 'critical_shortage' },
    { code: '29', nameEn: 'Karnataka', nameHi: 'कर्नाटक', districts: 5, topShortage: 'AI Data Annotator (+29%)', status: 'shortage' }
  ];

  return (
    <div className="space-y-6">
      <Header
        breadcrumbs={['NATIONAL']}
        titleEn="National Overview"
        titleHi="राष्ट्रीय अवलोकन"
        isDemoData={true}
      />

      {/* National KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard type="neutral" label="Pilot States" count={3} total={3} sublabel="active" />
        <KpiCard type="critical" label="Critical Shortages" count={108} total={522} sublabel="trades" />
        <KpiCard type="balanced" label="Balanced Markets" count={126} total={522} sublabel="trades" />
        <KpiCard type="saturation" label="Saturation Pockets" count={86} total={522} sublabel="trades" />
      </div>

      {/* Pilot Coverage Table */}
      <div className="border border-black bg-white p-5 shadow-[1px_1px_0px_0px_#000000]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-black">
          <h2 className="text-sm font-extrabold uppercase tracking-tight text-black">
            Pilot States Coverage & Severity Drill-Down
          </h2>
          <span className="text-xs font-mono text-slate-500">
            Click state to inspect district matrix
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pilotStates.map((st) => (
            <Link
              key={st.code}
              to="/state"
              className="border border-black p-4 hover:bg-slate-50 transition-transform hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_#000000] block"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-black text-base text-black">{st.nameEn}</h3>
                  <p className="text-xs text-slate-600">{st.nameHi}</p>
                </div>
                <RiskBadge label={st.status} showIcon={false} />
              </div>
              <div className="mt-4 pt-2 border-t border-slate-200 text-xs font-mono space-y-1">
                <p className="text-slate-500">Coverage: <span className="font-bold text-black">{st.districts} Districts</span></p>
                <p className="text-slate-500">Lead Shortage: <span className="font-bold text-red-700">{st.topShortage}</span></p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Sunburst Radial Hierarchy */}
      <SunburstChart />

      {/* National Demand vs Supply Balance Bar */}
      <div className="border border-black bg-white p-5 shadow-[1px_1px_0px_0px_#000000]">
        <h3 className="font-extrabold text-sm uppercase tracking-tight text-black mb-3">
          National Pilot Distribution (522 District × Trade Series)
        </h3>
        <div className="w-full flex h-6 border border-black font-mono text-[11px] font-bold text-center text-white overflow-hidden">
          <div style={{ width: '21%' }} className="bg-[#DC2626] flex items-center justify-center" title="Critical Shortage: 21%">▲▲ 21%</div>
          <div style={{ width: '26%' }} className="bg-[#F97316] text-black flex items-center justify-center" title="Shortage: 26%">▲ 26%</div>
          <div style={{ width: '24%' }} className="bg-[#E2E8F0] text-black flex items-center justify-center" title="Balanced: 24%">= 24%</div>
          <div style={{ width: '13%' }} className="bg-[#60A5FA] text-black flex items-center justify-center" title="Oversupply: 13%">▼ 13%</div>
          <div style={{ width: '16%' }} className="bg-[#1E40AF] flex items-center justify-center" title="Saturation: 16%">▼▼ 16%</div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-slate-600 mt-3 pt-2 border-t border-slate-200">
          <span>Total Monitored Openings: 1.48 Lakh</span>
          <span>Certified Entrant Supply: 1.39 Lakh</span>
          <span className="font-bold text-black">Net Demand-Supply Alignment: 94.2%</span>
        </div>
      </div>

      {/* Footer Badges */}
      <div className="flex items-center justify-between pt-4 border-t border-black">
        <div className="flex items-center gap-2">
          <RiskBadge label="critical_shortage" />
          <RiskBadge label="shortage" />
          <RiskBadge label="balanced" />
          <RiskBadge label="oversupply" />
          <RiskBadge label="saturation" />
        </div>
        <div className="flex items-center gap-2">
          <SourceFlagBadge flag="official" />
          <SourceFlagBadge flag="modelled" />
        </div>
      </div>
    </div>
  );
};
