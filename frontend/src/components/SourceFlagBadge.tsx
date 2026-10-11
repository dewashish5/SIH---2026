import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface SourceFlagBadgeProps {
  flag: 'official' | 'modelled' | 'dummy' | string;
  className?: string;
}

export const SourceFlagBadge: React.FC<SourceFlagBadgeProps> = ({ flag, className }) => {
  const { t } = useTranslation();

  switch (flag) {
    case 'official':
      return (
        <span
          title="Official Government Data (NCS / MoSPI / DGT)"
          className={clsx(
            'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-[#2563EB] text-white border border-black uppercase tracking-wider',
            className
          )}
        >
          <span>✓</span>
          <span>{t('official')}</span>
        </span>
      );
    case 'modelled':
      return (
        <span
          title="Modelled Econometric Estimate"
          className={clsx(
            'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-white text-black border border-dashed border-black uppercase tracking-wider',
            className
          )}
        >
          <span>{t('modelled')}</span>
        </span>
      );
    case 'dummy':
    default:
      return (
        <span
          title="SIH 2026 Evaluation Benchmark / Dummy Data"
          className={clsx(
            'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-900 border border-black uppercase tracking-wider',
            className
          )}
        >
          <span>{t('dummy')}</span>
        </span>
      );
  }
};
