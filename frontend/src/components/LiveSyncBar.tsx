import React from 'react';
import { useLiveSync } from '../context/LiveSyncContext';
import { RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react';

export const LiveSyncBar: React.FC = () => {
  const { lastSyncedAt, isSyncing, secondsRemaining, triggerSync } = useLiveSync();

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString('en-IN', { hour12: false });
  };

  return (
    <div className="border border-black bg-slate-50 p-3 mb-6 shadow-[1px_1px_0px_0px_#000000] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
      {/* Left: Live status and verified official sources */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-emerald-100 border border-black px-2.5 py-1 font-bold text-emerald-900">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="tracking-wider">LIVE REAL-TIME DATA</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-700">
          <ShieldCheck className="w-4 h-4 text-blue-700 stroke-[2.5]" />
          <span className="font-bold text-black">Verified Govt Feeds:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <a
            href="https://ncs.gov.in/NCSReportDashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-black hover:bg-slate-100 transition-colors text-black font-semibold"
            title="National Career Service - Ministry of Labour & Employment"
          >
            <span>NCS</span>
            <ExternalLink className="w-3 h-3 text-slate-600" />
          </a>

          <a
            href="https://www.msde.gov.in/static/uploads/2024/05/Annexure-2.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-black hover:bg-slate-100 transition-colors text-black font-semibold"
            title="PMKVY District Trained - MSDE Annexure"
          >
            <span>PMKVY</span>
            <ExternalLink className="w-3 h-3 text-slate-600" />
          </a>

          <a
            href="https://nqr.gov.in/qualifications-search"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-black hover:bg-slate-100 transition-colors text-black font-semibold"
            title="National Qualifications Register - Approved Qualifications"
          >
            <span>NQR</span>
            <ExternalLink className="w-3 h-3 text-slate-600" />
          </a>
        </div>
      </div>

      {/* Right: Sync timestamps, 10-min countdown and manual trigger */}
      <div className="flex items-center gap-3">
        <div className="text-slate-600">
          Last Synced: <span className="font-bold text-black">{formatTime(lastSyncedAt)}</span>
          <span className="mx-2 text-slate-300">|</span>
          Auto-refresh in: <span className="font-bold text-blue-800">{formatCountdown(secondsRemaining)}</span>
        </div>

        <button
          type="button"
          onClick={triggerSync}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white border border-black font-bold uppercase tracking-wider hover:bg-slate-800 active:translate-y-0.5 transition-all disabled:opacity-60 shadow-[1px_1px_0px_0px_#000000]"
          title="Hit backend API to fetch latest real-time records"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-yellow-300' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>
    </div>
  );
};
