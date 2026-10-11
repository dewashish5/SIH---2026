import React from 'react';
import clsx from 'clsx';

interface KpiCardProps {
  label: string;
  count: number;
  total: number;
  type: 'critical' | 'balanced' | 'saturation' | 'neutral';
  sublabel?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  count,
  total,
  type,
  sublabel = 'districts'
}) => {
  return (
    <div className="border border-black bg-white p-4 flex items-center space-x-4 shadow-[1px_1px_0px_0px_#000000]">
      {/* Left indicator bar */}
      {type === 'critical' && (
        <div className="w-2.5 h-10 bg-[#DC2626] flex-shrink-0" />
      )}
      {type === 'balanced' && (
        <div className="w-2.5 h-10 border border-slate-500 bg-slate-100 flex-shrink-0" />
      )}
      {type === 'saturation' && (
        <div className="w-2.5 h-10 bg-[#1E3A8A] flex-shrink-0" />
      )}
      {type === 'neutral' && (
        <div className="w-2.5 h-10 bg-black flex-shrink-0" />
      )}

      {/* Card Info */}
      <div className="flex-1">
        <p className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
          {label}
        </p>
        <div className="flex items-baseline space-x-1.5 mt-0.5">
          <span className="text-2xl font-black font-mono text-black">
            {count}
          </span>
          <span className="text-xs font-mono text-slate-600">
            / {total} {sublabel}
          </span>
        </div>
      </div>
    </div>
  );
};
