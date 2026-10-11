import React from 'react';
import { useTranslation } from 'react-i18next';

interface Driver {
  feature: string;
  label_en?: string;
  label_hi?: string;
  contribution: number;
  direction: 'positive' | 'negative';
}

interface WhyPanelProps {
  topDrivers: Driver[];
  narrativeEn?: string;
  narrativeHi?: string;
}

export const WhyPanel: React.FC<WhyPanelProps> = ({
  topDrivers = [],
  narrativeEn,
  narrativeHi
}) => {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  return (
    <div className="border border-black bg-white p-5 shadow-[1px_1px_0px_0px_#000000]">
      <h3 className="font-bold text-sm tracking-tight text-black mb-3">
        {isHi ? 'पूर्वानुमान चालक (SHAP व्याख्या)' : 'Forecast Drivers (SHAP Explanations)'}
      </h3>

      <p className="text-xs text-slate-700 mb-4 bg-slate-50 p-3 border border-slate-300 font-medium">
        {isHi
          ? narrativeHi || 'औद्योगिक भर्ती मांग एवं स्थानीय आईटीआई प्रमाणन अंतराल इस व्यवसाय के मुख्य प्रभावक हैं।'
          : narrativeEn || 'Accelerated industrial hiring demand and local ITI certification throughput are primary determinants for this trade.'}
      </p>

      <div className="space-y-2.5">
        {topDrivers.map((d) => {
          const label = isHi ? d.label_hi || d.feature : d.label_en || d.feature;
          const absVal = Math.min(100, Math.round(Math.abs(d.contribution) * 100));
          const isPos = d.direction === 'positive' || d.contribution > 0;

          return (
            <div key={d.feature} className="text-xs font-mono">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-800">{label}</span>
                <span className={isPos ? 'text-blue-700 font-bold' : 'text-red-700 font-bold'}>
                  {isPos ? '+' : '-'}{absVal}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 border border-slate-300">
                <div
                  className={`h-full ${isPos ? 'bg-[#2563EB]' : 'bg-[#DC2626]'}`}
                  style={{ width: `${absVal}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
