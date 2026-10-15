import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RiskBadge } from '../components/RiskBadge';
import { api } from '../services/api';
import { Download, ArrowDownUp } from 'lucide-react';
import { Loader } from '../components/Loader';

export const RankingScreen: React.FC = () => {
  const [tab, setTab] = useState<'shortage' | 'oversupply'>('shortage');
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getRankings(tab);
        setRankings(data);
      } catch (_err) {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [tab]);

  return (
    <div className="space-y-6">
      <Header
        breadcrumbs={['NATIONAL', 'RANKING BOARD']}
        titleEn="National Gap Ranking Board"
        titleHi="राष्ट्रीय अंतर रैंकिंग बोर्ड"
      />

      {/* Controls & Export Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-black bg-white p-4 shadow-[1px_1px_0px_0px_#000000]">
        {/* Shortage vs Oversupply Tabs */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setTab('shortage')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase border border-black transition-colors ${
              tab === 'shortage'
                ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000000]'
                : 'bg-white text-black hover:bg-slate-100'
            }`}
          >
            ▲ Critical Shortage (Priority Add)
          </button>
          <button
            type="button"
            onClick={() => setTab('oversupply')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase border border-black transition-colors ${
              tab === 'oversupply'
                ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000000]'
                : 'bg-white text-black hover:bg-slate-100'
            }`}
          >
            ▼ Oversupply / Saturation (Reallocate)
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2">
          <a
            href="/gateway/export/targets.csv"
            download
            className="px-3 py-2 bg-white border border-black text-xs font-bold font-mono hover:bg-slate-100 inline-flex items-center gap-1.5 shadow-[1px_1px_0px_0px_#000000]"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>Export CSV</span>
          </a>
          <a
            href="/gateway/export/targets.xlsx"
            download
            className="px-3 py-2 bg-black text-white border border-black text-xs font-bold font-mono hover:bg-slate-800 inline-flex items-center gap-1.5 shadow-[1px_1px_0px_0px_#000000]"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Export Excel (XLSX)</span>
          </a>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="border border-black bg-white p-5 shadow-[1px_1px_0px_0px_#000000]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-black">
          <h2 className="text-sm font-extrabold uppercase tracking-tight text-black flex items-center gap-2">
            <ArrowDownUp className="w-4 h-4 text-black" />
            <span>
              Top 10 Ranked Markets by Severity Score (Volume × Imbalance Factor)
            </span>
          </h2>
        </div>

        {loading ? (
          <Loader text="Sorting and ranking severity scores..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-slate-100 text-black">
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3">State & District</th>
                  <th className="p-3">Sector</th>
                  <th className="p-3">Trade</th>
                  <th className="p-3">Demand P50</th>
                  <th className="p-3">Supply P50</th>
                  <th className="p-3">Gap Ratio</th>
                  <th className="p-3">Classification</th>
                  <th className="p-3 text-right">Severity Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rankings.map((item) => (
                  <tr key={`${item.districtCode}_${item.tradeId}`} className="hover:bg-slate-50">
                    <td className="p-3 text-center font-bold text-black">{item.rank}</td>
                    <td className="p-3">
                      <span className="font-bold text-black">{item.districtNameEn}</span>
                      <span className="text-slate-500 block text-[11px]">{item.stateNameEn}</span>
                    </td>
                    <td className="p-3 text-slate-700">{item.sectorNameEn}</td>
                    <td className="p-3 font-bold text-black">{item.tradeNameEn}</td>
                    <td className="p-3 font-mono">{item.demandP50?.toLocaleString()}</td>
                    <td className="p-3 font-mono">{item.supplyP50?.toLocaleString()}</td>
                    <td className="p-3 font-bold">
                      <span className={item.gapRatio > 0 ? 'text-red-700' : 'text-blue-700'}>
                        {item.gapRatio > 0 ? `+${(item.gapRatio * 100).toFixed(1)}%` : `${(item.gapRatio * 100).toFixed(1)}%`}
                      </span>
                    </td>
                    <td className="p-3">
                      <RiskBadge label={item.riskLabel} />
                    </td>
                    <td className="p-3 text-right font-black text-black">
                      {item.severityScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
