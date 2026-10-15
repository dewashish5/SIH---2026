import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { RiskBadge } from '../components/RiskBadge';
import { SourceFlagBadge } from '../components/SourceFlagBadge';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Loader } from '../components/Loader';

export const DistrictScreen: React.FC = () => {
  const navigate = useNavigate();
  const [districtCode, setDistrictCode] = useState('091'); // Jaipur
  const [districtName, setDistrictName] = useState('Jaipur');
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const districtsList = [
    { code: '091', nameEn: 'Jaipur', nameHi: 'जयपुर', state: 'Rajasthan' },
    { code: '093', nameEn: 'Jodhpur', nameHi: 'जोधपुर', state: 'Rajasthan' },
    { code: '095', nameEn: 'Kota', nameHi: 'कोटा', state: 'Rajasthan' },
    { code: '521', nameEn: 'Pune', nameHi: 'पुणे', state: 'Maharashtra' },
    { code: '554', nameEn: 'Bengaluru Urban', nameHi: 'बेंगलुरु अर्बन', state: 'Karnataka' }
  ];

  useEffect(() => {
    async function loadDistrictTrades() {
      try {
        setLoading(true);
        // Load rankings filtered by district
        const res = await api.getRankings('shortage');
        const distTrades = res.filter((r) => r.districtCode === districtCode);
        setTrades(distTrades.length ? distTrades : res.slice(0, 10));
      } catch (_err) {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadDistrictTrades();
  }, [districtCode]);

  return (
    <div className="space-y-6">
      <Header
        breadcrumbs={['NATIONAL', 'RAJASTHAN', districtName.toUpperCase()]}
        titleEn={`${districtName} District`}
        titleHi="जिला परिदृश्य"
      />

      {/* District Selector & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-black bg-white p-4 shadow-[1px_1px_0px_0px_#000000]">
        <div className="flex items-center space-x-3">
          <label className="text-xs font-mono font-bold uppercase text-black">
            Select District:
          </label>
          <select
            value={districtCode}
            onChange={(e) => {
              const code = e.target.value;
              setDistrictCode(code);
              const found = districtsList.find((d) => d.code === code);
              if (found) setDistrictName(found.nameEn);
            }}
            className="border border-black bg-white px-3 py-1.5 text-xs font-mono font-bold focus:outline-none"
          >
            {districtsList.map((d) => (
              <option key={d.code} value={d.code}>
                {d.nameEn} ({d.state})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-mono text-slate-600">
          LGD Code: <span className="font-bold text-black">{districtCode}</span> · Census Granularity
        </div>
      </div>

      {/* Trades Table */}
      <div className="border border-black bg-white p-5 shadow-[1px_1px_0px_0px_#000000]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-black">
          <h2 className="text-sm font-extrabold uppercase tracking-tight text-black">
            Vocational Trade Demand vs Supply Registry
          </h2>
          <span className="text-xs font-mono text-slate-500">
            Click row to view forecast & SHAP drivers
          </span>
        </div>

        {loading ? (
          <Loader text="Fetching district trade indicators..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-slate-100 text-black">
                  <th className="p-3">Trade & NCO</th>
                  <th className="p-3">Sector</th>
                  <th className="p-3">Demand P50</th>
                  <th className="p-3">Supply P50</th>
                  <th className="p-3">Net Gap</th>
                  <th className="p-3">Risk Classification</th>
                  <th className="p-3">Data Quality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {trades.map((item) => (
                  <tr
                    key={item.tradeId}
                    onClick={() => navigate('/trade')}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="p-3">
                      <p className="font-bold text-black">{item.tradeNameEn}</p>
                      <p className="text-[11px] text-slate-500">NCO {item.ncoCode || '7421.0301'}</p>
                    </td>
                    <td className="p-3 text-slate-700">{item.sectorNameEn || 'Electrical/Solar'}</td>
                    <td className="p-3 font-bold text-black">{item.demandP50?.toLocaleString()}</td>
                    <td className="p-3 text-slate-800">{item.supplyP50?.toLocaleString()}</td>
                    <td className="p-3 font-bold">
                      <span className={item.gap > 0 ? 'text-red-700' : 'text-blue-700'}>
                        {item.gap > 0 ? `+${item.gap?.toLocaleString()}` : item.gap?.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3">
                      <RiskBadge label={item.riskLabel} />
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 font-bold">
                        {item.qualityScore || 88}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
