import React from 'react';
import clsx from 'clsx';

export interface DistrictCell {
  code: string;
  name: string;
  label: 'critical_shortage' | 'shortage' | 'balanced' | 'oversupply' | 'saturation';
  demand?: number;
  supply?: number;
}

interface DistrictGridProps {
  title?: string;
  districts: DistrictCell[];
  selectedCode?: string;
  onSelectDistrict?: (code: string) => void;
}

export const DistrictGrid: React.FC<DistrictGridProps> = ({
  title = 'Solar PV Technician · next 6 months',
  districts,
  selectedCode,
  onSelectDistrict
}) => {
  const getCellStyles = (label: string, isSelected: boolean) => {
    let bg = '';
    let text = '';
    let icon = '';

    switch (label) {
      case 'critical_shortage':
        bg = 'bg-[#DC2626]';
        text = 'text-white';
        icon = '▲▲';
        break;
      case 'shortage':
        bg = 'bg-[#F97316]';
        text = 'text-black';
        icon = '▲';
        break;
      case 'balanced':
        bg = 'bg-[#E2E8F0]';
        text = 'text-black';
        icon = '=';
        break;
      case 'oversupply':
        bg = 'bg-[#60A5FA]';
        text = 'text-black';
        icon = '▼';
        break;
      case 'saturation':
        bg = 'bg-[#1E3A8A]';
        text = 'text-white';
        icon = '▼▼';
        break;
      default:
        bg = 'bg-slate-200';
        text = 'text-black';
        icon = '-';
    }

    return {
      className: clsx(
        bg,
        text,
        'p-3 flex flex-col justify-between transition-transform cursor-pointer border border-transparent select-none',
        isSelected && 'ring-2 ring-black font-extrabold shadow-md scale-[1.02]'
      ),
      icon
    };
  };

  return (
    <div className="border border-black bg-white p-4 shadow-[1px_1px_0px_0px_#000000]">
      <h3 className="font-bold text-sm tracking-tight text-black mb-3">
        {title}
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {districts.map((d) => {
          const { className, icon } = getCellStyles(d.label, selectedCode === d.code);
          return (
            <button
              key={d.code}
              type="button"
              onClick={() => onSelectDistrict?.(d.code)}
              className={className}
              aria-label={`${d.name} ${d.label}`}
            >
              <span className="font-bold text-xs tracking-wide text-left">
                {d.name}
              </span>
              <span className="text-xs font-mono font-black mt-2 text-left">
                {icon}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
