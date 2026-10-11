import React from 'react';
import ReactECharts from 'echarts-for-react';

interface SunburstChartProps {
  onSelectNode?: (name: string) => void;
}

export const SunburstChart: React.FC<SunburstChartProps> = ({ onSelectNode }) => {
  const data = [
    {
      name: 'Solar & Electrical',
      itemStyle: { color: '#000000' },
      children: [
        {
          name: 'Solar PV Tech',
          value: 5200,
          itemStyle: { color: '#DC2626' } // Critical Shortage
        },
        {
          name: 'Electrician',
          value: 3200,
          itemStyle: { color: '#1E40AF' } // Saturation
        },
        {
          name: 'Rooftop Solar',
          value: 2400,
          itemStyle: { color: '#F97316' } // Shortage
        },
        {
          name: 'Wireman',
          value: 2100,
          itemStyle: { color: '#E2E8F0' } // Balanced
        }
      ]
    },
    {
      name: 'Auto & EV',
      itemStyle: { color: '#1F2937' },
      children: [
        {
          name: 'EV Technician',
          value: 4100,
          itemStyle: { color: '#DC2626' } // Critical Shortage
        },
        {
          name: 'Auto Mechanic',
          value: 2900,
          itemStyle: { color: '#60A5FA' } // Oversupply
        },
        {
          name: 'Battery Assembly',
          value: 2300,
          itemStyle: { color: '#F97316' } // Shortage
        }
      ]
    },
    {
      name: 'IT & Digital',
      itemStyle: { color: '#374151' },
      children: [
        {
          name: 'AI Annotator',
          value: 3800,
          itemStyle: { color: '#F97316' } // Shortage
        },
        {
          name: 'Cloud Associate',
          value: 3100,
          itemStyle: { color: '#DC2626' } // Critical Shortage
        },
        {
          name: 'Data Entry',
          value: 2600,
          itemStyle: { color: '#E2E8F0' } // Balanced
        }
      ]
    },
    {
      name: 'Healthcare',
      itemStyle: { color: '#4B5563' },
      children: [
        {
          name: 'Emergency Medical',
          value: 3400,
          itemStyle: { color: '#DC2626' } // Critical Shortage
        },
        {
          name: 'General Duty Asst',
          value: 2800,
          itemStyle: { color: '#E2E8F0' } // Balanced
        },
        {
          name: 'Phlebotomist',
          value: 2200,
          itemStyle: { color: '#60A5FA' } // Oversupply
        }
      ]
    },
    {
      name: 'Construction',
      itemStyle: { color: '#6B7280' },
      children: [
        {
          name: 'Mason General',
          value: 2900,
          itemStyle: { color: '#E2E8F0' } // Balanced
        },
        {
          name: 'Plumber',
          value: 2700,
          itemStyle: { color: '#F97316' } // Shortage
        },
        {
          name: 'Welder',
          value: 2200,
          itemStyle: { color: '#1E40AF' } // Saturation
        }
      ]
    }
  ];

  const option = {
    tooltip: {
      trigger: 'item',
      textStyle: { fontFamily: 'monospace' },
      backgroundColor: '#000000',
      borderColor: '#000000',
      formatter: (params: any) => {
        return `<b>${params.name}</b><br/>Demand Volume: ${params.value ? params.value.toLocaleString() : 'Category'}`;
      }
    },
    series: {
      type: 'sunburst',
      data: data,
      radius: [0, '92%'],
      label: {
        rotate: 'radial',
        color: '#FFFFFF',
        fontFamily: 'monospace',
        fontSize: 10,
        fontWeight: 'bold'
      },
      itemStyle: {
        borderRadius: 0,
        borderWidth: 1.5,
        borderColor: '#000000'
      },
      levels: [
        {},
        {
          r0: '0%',
          r: '35%',
          itemStyle: { borderWidth: 2 },
          label: { rotate: 0 }
        },
        {
          r0: '35%',
          r: '72%',
          label: { align: 'right' }
        },
        {
          r0: '72%',
          r: '90%',
          label: { position: 'outside', padding: 3, silent: false, color: '#000000' },
          itemStyle: { borderWidth: 1 }
        }
      ]
    }
  };

  return (
    <div className="border border-black bg-white p-5 shadow-[1px_1px_0px_0px_#000000]">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-black">
        <h3 className="font-extrabold text-sm uppercase tracking-tight text-black">
          Sector & Trade Radial Sunburst Hierarchy
        </h3>
        <span className="text-[11px] font-mono text-slate-500">
          Inner Ring: Sectors · Outer Ring: Trades by Gap Severity
        </span>
      </div>

      <div className="h-[320px] w-full">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          onEvents={{
            click: (e: any) => onSelectNode?.(e.name)
          }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs font-mono pt-3 border-t border-slate-200 text-slate-700">
        <span>Click node to isolate trade category</span>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#DC2626] inline-block" /> Shortage</span>
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#E2E8F0] border border-black inline-block" /> Balanced</span>
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#1E40AF] inline-block" /> Saturation</span>
        </div>
      </div>
    </div>
  );
};
