import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';

interface ForecastChartProps {
  title?: string;
  historical?: Array<{ month: string; demand: number; supply: number }>;
  forecast?: Array<{
    month: string;
    demandP10: number;
    demandP50: number;
    demandP90: number;
    supplyP10: number;
    supplyP50: number;
    supplyP90: number;
    gap: number;
  }>;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  title = 'Jaipur · Solar PV Technician',
  historical = [],
  forecast = []
}) => {
  const [viewTable, setViewTable] = useState(false);

  // Combine months
  const allMonths = [
    ...historical.map((h) => h.month),
    ...forecast.map((f) => f.month)
  ];

  // Demand series
  const demandData = [
    ...historical.map((h) => h.demand),
    ...forecast.map((f) => f.demandP50)
  ];

  // Supply series
  const supplyData = [
    ...historical.map((h) => h.supply),
    ...forecast.map((f) => f.supplyP50)
  ];

  // Ribbon data (P10 to P90)
  const bandBase = [
    ...historical.map(() => null),
    ...forecast.map((f) => f.demandP10)
  ];
  const bandDiff = [
    ...historical.map(() => null),
    ...forecast.map((f) => f.demandP90 - f.demandP10)
  ];

  const splitIndex = historical.length;

  const option = {
    grid: {
      top: 35,
      right: 25,
      bottom: 40,
      left: 55
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#000000',
      borderColor: '#000000',
      textStyle: { color: '#FFFFFF', fontFamily: 'monospace' }
    },
    xAxis: {
      type: 'category',
      data: allMonths,
      axisLine: { lineStyle: { color: '#000000' } },
      axisTick: { alignWithLabel: true },
      axisLabel: {
        fontFamily: 'monospace',
        fontSize: 10,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: true, lineStyle: { color: '#000000' } },
      splitLine: { lineStyle: { color: '#E2E8F0', type: 'dashed' } },
      axisLabel: { fontFamily: 'monospace', fontSize: 10 }
    },
    series: [
      // P10 lower base (invisible)
      {
        name: 'P10 Base',
        type: 'line',
        data: bandBase,
        lineStyle: { opacity: 0 },
        stack: 'confidence-band',
        symbol: 'none'
      },
      // P90 diff (shaded area)
      {
        name: 'P10–P90 Band',
        type: 'line',
        data: bandDiff,
        lineStyle: { opacity: 0 },
        areaStyle: { color: 'rgba(37, 99, 235, 0.2)' },
        stack: 'confidence-band',
        symbol: 'none'
      },
      // Demand line
      {
        name: 'Demand',
        type: 'line',
        data: demandData,
        lineStyle: { color: '#2563EB', width: 2.5 },
        itemStyle: { color: '#2563EB' },
        showSymbol: false,
        markLine: splitIndex > 0 ? {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#000000', type: 'dashed', width: 1.5 },
          data: [{ xAxis: allMonths[splitIndex] || allMonths[allMonths.length - 1], label: { formatter: 'Forecast', position: 'insideEndTop', color: '#000' } }]
        } : undefined
      },
      // Supply line
      {
        name: 'Supply',
        type: 'line',
        data: supplyData,
        lineStyle: { color: '#000000', width: 2, type: 'dashed' },
        itemStyle: { color: '#000000' },
        showSymbol: false
      }
    ]
  };

  return (
    <div className="border border-black bg-white p-4 shadow-[1px_1px_0px_0px_#000000] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm tracking-tight text-black">
          {title}
        </h3>
        <button
          type="button"
          onClick={() => setViewTable(!viewTable)}
          className="text-xs font-mono font-semibold text-slate-700 underline hover:text-black"
        >
          {viewTable ? 'View Chart' : 'View as table'}
        </button>
      </div>

      {viewTable ? (
        <div className="overflow-x-auto max-h-[220px] text-xs font-mono border border-slate-300">
          <table className="w-full text-left">
            <thead className="bg-slate-100 border-b border-slate-300">
              <tr>
                <th className="p-2">Month</th>
                <th className="p-2">Demand P50</th>
                <th className="p-2">Supply P50</th>
                <th className="p-2">Gap</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((f) => (
                <tr key={f.month} className="border-b border-slate-200">
                  <td className="p-2">{f.month}</td>
                  <td className="p-2">{f.demandP50}</td>
                  <td className="p-2">{f.supplyP50}</td>
                  <td className="p-2 font-bold text-blue-700">+{f.gap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-[220px] w-full">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
        </div>
      )}

      {/* Legend matching reference image */}
      <div className="flex items-center space-x-6 text-xs font-mono text-black mt-2 pt-2 border-t border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="w-4 h-0.5 bg-[#2563EB] inline-block" />
          <span className="font-medium">Demand</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-black inline-block" />
          <span className="font-medium">Supply</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 bg-[#2563EB]/20 border border-[#2563EB]/40 inline-block" />
          <span className="font-medium">P10–P90</span>
        </div>
        <span className="text-slate-400 font-mono text-[11px] ml-auto">
          Gap: +2,300 (Shortage)
        </span>
      </div>
    </div>
  );
};
