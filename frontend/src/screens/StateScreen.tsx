import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { KpiCard } from '../components/KpiCard';
import { DistrictGrid, DistrictCell } from '../components/DistrictGrid';
import { ForecastChart } from '../components/ForecastChart';
import { RiskBadge } from '../components/RiskBadge';
import { SourceFlagBadge } from '../components/SourceFlagBadge';
import { api } from '../services/api';

export const StateScreen: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('091'); // Jaipur
  const [forecastData, setForecastData] = useState<any>(null);

  // Default Rajasthan districts
  const defaultDistricts: DistrictCell[] = [
    { code: '091', name: 'Jaipur', label: 'critical_shortage', demand: 5200, supply: 2900 },
    { code: '093', name: 'Jodhpur', label: 'shortage', demand: 3200, supply: 2600 },
    { code: '095', name: 'Kota', label: 'balanced', demand: 2800, supply: 2750 },
    { code: '104', name: 'Udaipur', label: 'oversupply', demand: 2200, supply: 2600 },
    { code: '085', name: 'Ajmer', label: 'balanced', demand: 2700, supply: 2650 },
    { code: '087', name: 'Bikaner', label: 'shortage', demand: 3100, supply: 2500 },
    { code: '086', name: 'Alwar', label: 'critical_shortage', demand: 4200, supply: 2500 },
    { code: '101', name: 'Sikar', label: 'balanced', demand: 2600, supply: 2550 },
    { code: '088', name: 'Bhilwara', label: 'saturation', demand: 1600, supply: 2800 },
    { code: '097', name: 'Nagaur', label: 'oversupply', demand: 2100, supply: 2500 },
    { code: '098', name: 'Pali', label: 'balanced', demand: 2500, supply: 2450 },
    { code: '089', name: 'Barmer', label: 'shortage', demand: 3300, supply: 2600 },
    { code: '090', name: 'Churu', label: 'saturation', demand: 1500, supply: 2700 },
    { code: '103', name: 'Tonk', label: 'oversupply', demand: 2000, supply: 2400 },
    { code: '102', name: 'Sirohi', label: 'balanced', demand: 2400, supply: 2350 },
    { code: '092', name: 'Jhalawar', label: 'shortage', demand: 3000, supply: 2400 }
  ];

  const [rajasthanDistricts, setRajasthanDistricts] = useState<DistrictCell[]>(defaultDistricts);

  useEffect(() => {
    async function loadRealDistrictData() {
      try {
        const geoRes = await api.getGeoData('trade_solar_pv', '08');
        if (geoRes?.features?.length) {
          const cells: DistrictCell[] = geoRes.features.map((feat: any) => ({
            code: feat.properties.district_code,
            name: feat.properties.district_name_en,
            label: feat.properties.riskLabel || 'balanced',
            demand: Math.round(feat.properties.demand || 0),
            supply: Math.round(feat.properties.supply || 0)
          }));
          if (cells.length > 0) {
            setRajasthanDistricts(cells);
          }
        }
      } catch (_err) {
        // Retain fallback
      }
    }
    loadRealDistrictData();
  }, []);

  useEffect(() => {
    async function loadForecast() {
      try {
        const data = await api.getForecast(selectedDistrict, 'trade_solar_pv');
        setForecastData(data);
      } catch (_err) {
        // Fallback
      }
    }
    loadForecast();
  }, [selectedDistrict]);

  const activeDistrictName = rajasthanDistricts.find((d) => d.code === selectedDistrict)?.name || 'Jaipur';

  return (
    <div className="space-y-6">
      {/* Header section */}
      <Header
        breadcrumbs={['NATIONAL', 'RAJASTHAN']}
        titleEn="Rajasthan"
        titleHi="राजस्थान"
      />

      {/* Top 3 KPI Cards matching mockup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          type="critical"
          label="Critical shortage"
          count={2}
          total={16}
          sublabel="districts"
        />
        <KpiCard
          type="balanced"
          label="Balanced"
          count={5}
          total={16}
          sublabel="districts"
        />
        <KpiCard
          type="saturation"
          label="Saturation"
          count={2}
          total={16}
          sublabel="districts"
        />
      </div>

      {/* Main Grid & Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Matrix: 6 cols */}
        <div className="lg:col-span-6">
          <DistrictGrid
            title="Solar PV Technician · next 6 months"
            districts={rajasthanDistricts}
            selectedCode={selectedDistrict}
            onSelectDistrict={(code) => setSelectedDistrict(code)}
          />
        </div>

        {/* Right Chart: 6 cols */}
        <div className="lg:col-span-6">
          <ForecastChart
            title={`${activeDistrictName} · Solar PV Technician`}
            historical={forecastData?.historical || [
              { month: '2025-10', demand: 4200, supply: 2800 },
              { month: '2025-12', demand: 4500, supply: 2850 },
              { month: '2026-02', demand: 4800, supply: 2900 },
              { month: '2026-04', demand: 4950, supply: 2900 },
              { month: '2026-06', demand: 5100, supply: 2920 },
              { month: '2026-08', demand: 5200, supply: 2900 }
            ]}
            forecast={forecastData?.forecast || [
              { month: '2026-10', demandP10: 4420, demandP50: 5200, demandP90: 6136, supplyP10: 2610, supplyP50: 2900, supplyP90: 3190, gap: 2300 },
              { month: '2026-11', demandP10: 4480, demandP50: 5280, demandP90: 6220, supplyP10: 2610, supplyP50: 2900, supplyP90: 3190, gap: 2380 },
              { month: '2026-12', demandP10: 4550, demandP50: 5350, demandP90: 6310, supplyP10: 2610, supplyP50: 2900, supplyP90: 3190, gap: 2450 },
              { month: '2027-01', demandP10: 4620, demandP50: 5420, demandP90: 6400, supplyP10: 2610, supplyP50: 2900, supplyP90: 3190, gap: 2520 },
              { month: '2027-02', demandP10: 4700, demandP50: 5500, demandP90: 6500, supplyP10: 2610, supplyP50: 2900, supplyP90: 3190, gap: 2600 }
            ]}
          />
        </div>
      </div>

      {/* Bottom Risk & Trust Badges Legend matching reference image */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-black">
        {/* 5 Risk Levels */}
        <div className="flex flex-wrap items-center gap-2">
          <RiskBadge label="critical_shortage" />
          <RiskBadge label="shortage" />
          <RiskBadge label="balanced" />
          <RiskBadge label="oversupply" />
          <RiskBadge label="saturation" />
        </div>

        {/* Source Flag Badges */}
        <div className="flex items-center gap-2">
          <SourceFlagBadge flag="official" />
          <SourceFlagBadge flag="modelled" />
        </div>
      </div>
    </div>
  );
};
