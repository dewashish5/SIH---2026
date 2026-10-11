import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { api } from '../services/api';
import { BookOpen, ShieldCheck, Scale, Database } from 'lucide-react';

export const MethodologyScreen: React.FC = () => {
  const [methodology, setMethodology] = useState<any>(null);
  const [lineage, setLineage] = useState<any[]>([]);
  const [backtest, setBacktest] = useState<any[]>([]);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [m, l, b] = await Promise.all([
          api.getMethodology(),
          api.getLineage(),
          api.getBacktest()
        ]);
        setMethodology(m);
        setLineage(l);
        setBacktest(b);
      } catch (_err) {
        // Fallback
      }
    }
    loadMeta();
  }, []);

  return (
    <div className="space-y-6">
      <Header
        breadcrumbs={['NATIONAL', 'METHODOLOGY & AUDIT']}
        titleEn="Methodology & Transparency"
        titleHi="पद्धति एवं पारदर्शिता"
        isDemoData={true}
      />

      {/* Demand Index Formula Section */}
      <div className="border border-black bg-white p-5 shadow-[1px_1px_0px_0px_#000000]">
        <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-black">
          <Scale className="w-5 h-5 text-black" />
          <h2 className="text-base font-extrabold uppercase tracking-tight text-black">
            1. Composite Demand Index Formula & Calibrated Weights
          </h2>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed mb-4 font-mono">
          Demand Index = 0.35 × NCS_Norm + 0.25 × Portal_Norm + 0.15 × Industry_Norm + 0.15 × PLFS_Norm + 0.10 × eShram_Norm
        </p>

        <div className="overflow-x-auto text-xs font-mono">
          <table className="w-full text-left border border-black">
            <thead className="bg-slate-100 border-b border-black">
              <tr>
                <th className="p-2.5">Signal Source</th>
                <th className="p-2.5">Weight</th>
                <th className="p-2.5">Normalization & Range</th>
                <th className="p-2.5">Official Ingestion Mechanism</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              <tr>
                <td className="p-2.5 font-bold">NCS Vacancy Momentum</td>
                <td className="p-2.5 font-bold text-blue-700">35%</td>
                <td className="p-2.5">Min-Max Normalized (0-100)</td>
                <td className="p-2.5 text-slate-600">National Career Service report ingestion</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">Online Job Postings Index</td>
                <td className="p-2.5 font-bold text-blue-700">25%</td>
                <td className="p-2.5">Log-transformed & Scaled</td>
                <td className="p-2.5 text-slate-600">Approved aggregator data feeds</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">Industry Sector Capex Growth</td>
                <td className="p-2.5 font-bold text-blue-700">15%</td>
                <td className="p-2.5">YoY Percentage Trend</td>
                <td className="p-2.5 text-slate-600">Sector Skill Council industry surveys</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">PLFS Macro Employment Trend</td>
                <td className="p-2.5 font-bold text-blue-700">15%</td>
                <td className="p-2.5">State/District Modelled Estimate</td>
                <td className="p-2.5 text-slate-600">MoSPI quarterly bulletin allocation</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">e-Shram Worker Registry Signal</td>
                <td className="p-2.5 font-bold text-blue-700">10%</td>
                <td className="p-2.5">Aggregate Supply Influx (0-100)</td>
                <td className="p-2.5 text-slate-600">Aggregate anonymized registry count</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Backtest Validation Metrics */}
      <div className="border border-black bg-white p-5 shadow-[1px_1px_0px_0px_#000000]">
        <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-black">
          <BookOpen className="w-5 h-5 text-black" />
          <h2 className="text-base font-extrabold uppercase tracking-tight text-black">
            2. Empirical Backtest Accuracy (Model vs Baseline MAPE)
          </h2>
        </div>

        <div className="overflow-x-auto text-xs font-mono">
          <table className="w-full text-left border border-black">
            <thead className="bg-slate-100 border-b border-black">
              <tr>
                <th className="p-2.5">Sector Scope</th>
                <th className="p-2.5">Model MAPE</th>
                <th className="p-2.5">sMAPE</th>
                <th className="p-2.5">Naive Baseline MAPE</th>
                <th className="p-2.5 text-right font-bold">Accuracy Improvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {backtest.map((b) => (
                <tr key={b.scopeId}>
                  <td className="p-2.5 font-bold text-black">{b.scopeId.replace('sec_', '').replace('_', ' ').toUpperCase()}</td>
                  <td className="p-2.5 font-bold text-blue-700">{b.mape}%</td>
                  <td className="p-2.5">{b.smape}%</td>
                  <td className="p-2.5 text-slate-500">{b.baselineMape}%</td>
                  <td className="p-2.5 text-right font-bold text-emerald-700">+{b.improvement}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Lineage & Trust Rules */}
      <div className="border border-black bg-white p-5 shadow-[1px_1px_0px_0px_#000000]">
        <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-black">
          <Database className="w-5 h-5 text-black" />
          <h2 className="text-base font-extrabold uppercase tracking-tight text-black">
            3. Data Lineage & Source Provenance
          </h2>
        </div>

        <div className="overflow-x-auto text-xs font-mono">
          <table className="w-full text-left border border-black">
            <thead className="bg-slate-100 border-b border-black">
              <tr>
                <th className="p-2.5">Feature / Column</th>
                <th className="p-2.5">Authoritative Source</th>
                <th className="p-2.5">Granularity</th>
                <th className="p-2.5">Freshness</th>
                <th className="p-2.5">Audit Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {lineage.map((l) => (
                <tr key={l.columnName}>
                  <td className="p-2.5 font-bold text-black">{l.columnName}</td>
                  <td className="p-2.5 text-blue-700 underline">{l.sourceName}</td>
                  <td className="p-2.5">{l.granularity}</td>
                  <td className="p-2.5 font-bold">{l.lastUpdated}</td>
                  <td className="p-2.5 text-slate-600">{l.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Honesty Rules & DPDP Statement */}
      <div className="border border-black bg-white p-5 shadow-[1px_1px_0px_0px_#000000]">
        <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-black">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <h2 className="text-base font-extrabold uppercase tracking-tight text-black">
            4. Government Honesty Guidelines & DPDP Privacy Framework
          </h2>
        </div>

        <div className="space-y-2 text-xs font-mono text-slate-800">
          <p>• <span className="font-bold">PLFS Monthly Scope:</span> Monthly PLFS bulletins exist only at all-India level. Sub-national estimates are explicitly labelled as <span className="font-bold">modelled</span>.</p>
          <p>• <span className="font-bold">Aggregated Metrics Only:</span> No personal identifiers, phone numbers, or worker-level records are stored, complying with Digital Personal Data Protection (DPDP) Act 2023.</p>
          <p>• <span className="font-bold">Periodic Cadence:</span> The system updates strictly on a monthly batch pipeline. Real-time claims are avoided as policy target-setting occurs in quarterly/annual planning cycles.</p>
        </div>
      </div>
    </div>
  );
};
