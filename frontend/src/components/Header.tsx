import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';

interface HeaderProps {
  breadcrumbs?: string[];
  titleEn: string;
  titleHi: string;
  isDemoData?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  breadcrumbs = ['NATIONAL', 'RAJASTHAN'],
  titleEn,
  titleHi,
  isDemoData = true
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs font-mono tracking-widest text-slate-500 uppercase mb-2">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 stroke-[2.5]" />}
            <span className={idx === breadcrumbs.length - 1 ? 'font-bold text-black' : ''}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </nav>

      {/* Main Title & Demo Badge Row */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-black tracking-tight flex items-baseline space-x-3">
          <span>{titleEn}</span>
          <span className="text-2xl font-normal text-slate-700">· {titleHi}</span>
        </h1>

        {isDemoData && (
          <div className="flex items-center space-x-2">
            <span className="bg-[#FACC15] text-black font-extrabold px-3 py-1 text-xs tracking-wider border border-black shadow-[1px_1px_0px_0px_#000000]">
              {t('demoData')}
            </span>
          </div>
        )}
      </div>

      {/* Solid black underline divider matching Ink Mono mockup */}
      <hr className="border-t border-black mt-3" />
    </div>
  );
};
