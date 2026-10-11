// Domain & API Type definitions for SkillGap Intelligence

export type RiskLabel =
  | 'critical_shortage'
  | 'shortage'
  | 'balanced'
  | 'oversupply'
  | 'saturation';

export type SourceFlag = 'official' | 'modelled' | 'dummy';

export type UserRole = 'national' | 'state' | 'district' | 'viewer';

export interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  timestamp: string;
  database?: 'connected' | 'disconnected' | 'mock';
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  stateScope?: string | null;
  districtScope?: string | null;
  createdAt: string;
}

export interface DimensionGeo {
  stateCode: string;
  stateNameEn: string;
  stateNameHi: string;
  districtCode: string;
  districtNameEn: string;
  districtNameHi: string;
}

export interface DimensionTrade {
  tradeId: string;
  ncoCode: string;
  nsqfQp: string;
  nsqfLevel: number;
  sectorId: string;
  tradeNameEn: string;
  tradeNameHi: string;
  courseDurationMonths: number;
}

export interface DimensionSector {
  sectorId: string;
  sectorNameEn: string;
  sectorNameHi: string;
}

export interface ForecastPoint {
  month: string;
  demandP10: number;
  demandP50: number;
  demandP90: number;
  supplyP10: number;
  supplyP50: number;
  supplyP90: number;
  gap: number;
  gapRatio: number;
  riskLabel: RiskLabel;
  sourceFlag: SourceFlag;
  lowConfidence: boolean;
  qualityScore: number;
}

export interface ForecastResponse {
  runId: string;
  stateCode: string;
  districtCode: string;
  sectorId: string;
  tradeId: string;
  tradeNameEn: string;
  tradeNameHi: string;
  lastRefreshed: string;
  historical: Array<{
    month: string;
    demand: number;
    supply: number;
    sourceFlag: SourceFlag;
  }>;
  forecast: ForecastPoint[];
}

export interface GapRankItem {
  rank: number;
  stateCode: string;
  stateNameEn: string;
  stateNameHi: string;
  districtCode: string;
  districtNameEn: string;
  districtNameHi: string;
  sectorId: string;
  sectorNameEn: string;
  sectorNameHi: string;
  tradeId: string;
  tradeNameEn: string;
  tradeNameHi: string;
  ncoCode: string;
  demandP50: number;
  supplyP50: number;
  gap: number;
  gapRatio: number;
  riskLabel: RiskLabel;
  severityScore: number;
  sourceFlag: SourceFlag;
  qualityScore: number;
  lowConfidence: boolean;
}

export interface WhatIfRequest {
  districtCode: string;
  tradeId: string;
  seatChangePct?: number;
  seatChangeAbs?: number;
}

export interface WhatIfResponse {
  districtCode: string;
  tradeId: string;
  courseDurationMonths: number;
  baselineGap: number;
  baselineGapRatio: number;
  baselineRiskLabel: RiskLabel;
  simulatedGap: number;
  simulatedGapRatio: number;
  simulatedRiskLabel: RiskLabel;
  gapReductionPct: number;
  series: Array<{
    month: string;
    baselineSupply: number;
    simulatedSupply: number;
    demandP50: number;
    gap: number;
  }>;
}

export interface RecommendationItem {
  districtCode: string;
  tradeId: string;
  tradeNameEn: string;
  tradeNameHi: string;
  action: 'add_seats' | 'cut_seats' | 'reallocate' | 'maintain';
  recommendedSeatChange: number;
  currentCapacity: number;
  rationaleEn: string;
  rationaleHi: string;
  reallocationTarget?: {
    tradeId: string;
    tradeNameEn: string;
    tradeNameHi: string;
    districtCode: string;
  };
}

export interface TradeWhyResponse {
  tradeId: string;
  districtCode: string;
  topDrivers: Array<{
    feature: string;
    labelEn: string;
    labelHi: string;
    contribution: number;
    direction: 'positive' | 'negative';
  }>;
  narrativeEn: string;
  narrativeHi: string;
}
