import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

export type RiskLevel = 'critical_shortage' | 'shortage' | 'balanced' | 'oversupply' | 'saturation' | string;

interface RiskBadgeProps {
  label: RiskLevel;
  className?: string;
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ label, className, showIcon = true }) => {
  const { t } = useTranslation();

  switch (label) {
    case 'critical_shortage':
      return (
        <span
          className={clsx(
            'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-[#DC2626] text-white border border-black uppercase tracking-wider',
            className
          )}
        >
          {showIcon && <span>▲▲</span>}
          <span>{t('criticalShortage')}</span>
        </span>
      );
    case 'shortage':
      return (
        <span
          className={clsx(
            'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-[#F97316] text-black border border-black uppercase tracking-wider',
            className
          )}
        >
          {showIcon && <span>▲</span>}
          <span>{t('shortage')}</span>
        </span>
      );
    case 'balanced':
      return (
        <span
          className={clsx(
            'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-[#E2E8F0] text-black border border-black uppercase tracking-wider',
            className
          )}
        >
          {showIcon && <span>=</span>}
          <span>{t('balanced')}</span>
        </span>
      );
    case 'oversupply':
      return (
        <span
          className={clsx(
            'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-[#60A5FA] text-black border border-black uppercase tracking-wider',
            className
          )}
        >
          {showIcon && <span>▼</span>}
          <span>{t('oversupply')}</span>
        </span>
      );
    case 'saturation':
      return (
        <span
          className={clsx(
            'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-[#1E40AF] text-white border border-black uppercase tracking-wider',
            className
          )}
        >
          {showIcon && <span>▼▼</span>}
          <span>{t('saturation')}</span>
        </span>
      );
    default:
      return (
        <span
          className={clsx(
            'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-700 border border-slate-400',
            className
          )}
        >
          <span>{label}</span>
        </span>
      );
  }
};
