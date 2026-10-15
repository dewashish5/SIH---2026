/**
 * API Service Client for SkillGap Intelligence
 */

const getBaseUrl = () => {
  if (typeof window !== 'undefined' && typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return 'http://localhost:4000';
  }
  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') {
    return '';
  }
  return 'http://localhost:4000';
};


export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  let token: string | null = null;
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      token = localStorage.getItem('token');
    }
  } catch (_e) {
    // Ignore in non-browser env
  }
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>)
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const targetUrl = url.startsWith('http') ? url : `${getBaseUrl()}${url}`;
  const res = await fetch(targetUrl, {
    ...options,
    headers
  });


  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `API error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  // Dimensions
  getDimensions: () => fetchJson<any>('/api/dimensions'),

  // Forecast
  getForecast: (districtCode: string = '091', tradeId: string = 'trade_solar_pv', horizon: number = 12) =>
    fetchJson<any>(`/api/forecast?district_code=${districtCode}&trade_id=${tradeId}&horizon=${horizon}`),

  // Ranking
  getRankings: (order: 'shortage' | 'oversupply' = 'shortage', stateCode?: string, sectorId?: string) => {
    let url = `/api/gap/rank?order=${order}`;
    if (stateCode) url += `&state_code=${stateCode}`;
    if (sectorId) url += `&sector_id=${sectorId}`;
    return fetchJson<any[]>(url);
  },

  // Alerts
  getAlerts: (severity?: string, districtCode?: string) => {
    let url = `/api/alerts?limit=25`;
    if (severity) url += `&severity=${severity}`;
    if (districtCode) url += `&district_code=${districtCode}`;
    return fetchJson<any[]>(url);
  },

  // What-If
  runWhatIf: (payload: { district_code: string; trade_id: string; seat_change_pct?: number; seat_change_abs?: number }) =>
    fetchJson<any>('/api/whatif', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Recommendations
  getRecommendations: (districtCode: string = '091', tradeId: string = 'trade_solar_pv') =>
    fetchJson<any>(`/api/recommendations?district_code=${districtCode}&trade_id=${tradeId}`),

  // Trade Why (SHAP drivers)
  getTradeWhy: (tradeId: string = 'trade_solar_pv', districtCode: string = '091') =>
    fetchJson<any>(`/api/trade/${tradeId}/why?district_code=${districtCode}`),

  // Geo / Choropleth
  getGeoData: (tradeId: string = 'trade_solar_pv', stateCode?: string) => {
    let url = `/api/geo/district?trade_id=${tradeId}`;
    if (stateCode) url += `&state_code=${stateCode}`;
    return fetchJson<any>(url);
  },

  // Metadata
  getMethodology: () => fetchJson<any>('/api/meta/methodology'),
  getQuality: () => fetchJson<any>('/api/meta/quality'),
  getModelCard: () => fetchJson<any>('/api/meta/model-card'),
  getLineage: () => fetchJson<any>('/api/meta/lineage'),
  getBacktest: () => fetchJson<any>('/api/meta/backtest'),
  getDemandBreakdown: (districtCode: string, tradeId: string) =>
    fetchJson<any>(`/api/meta/demand-breakdown?district_code=${districtCode}&trade_id=${tradeId}`),

  // Gateway Auth & Overrides
  login: (credentials: { email: string; password: string }) =>
    fetchJson<any>('/gateway/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  getOverrides: () => fetchJson<any[]>('/gateway/overrides'),
  createOverride: (payload: any) =>
    fetchJson<any>('/gateway/overrides', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  subscribeAlert: (payload: any) =>
    fetchJson<any>('/gateway/alerts/subscribe', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Live Official Government Feeds & Dynamic 10-Min Ingestion
  getLiveSources: () => fetchJson<any>('/api/live/sources'),
  syncLiveData: () =>
    fetchJson<any>('/api/live/sync', {
      method: 'POST'
    }),
  getLiveStatus: () => fetchJson<any>('/api/live/status'),

  // Neo4j Knowledge Graph Engine & Cypher Console
  getGraphStatus: () => fetchJson<any>('/api/graph/status'),
  getGraphOverview: () => fetchJson<any>('/api/graph/overview'),
  getGraphLineage: (tradeCode?: string, districtId?: string) => {
    const params = new URLSearchParams();
    if (tradeCode) params.append('trade_code', tradeCode);
    if (districtId) params.append('district_id', districtId);
    return fetchJson<any>(`/api/graph/lineage?${params.toString()}`);
  },
  getCareerPathways: (tradeCode?: string) => {
    const params = new URLSearchParams();
    if (tradeCode) params.append('trade_code', tradeCode);
    return fetchJson<any>(`/api/graph/pathways?${params.toString()}`);
  },
  runCypher: (query: string, params?: any) =>
    fetchJson<any>('/api/graph/cypher', {
      method: 'POST',
      body: JSON.stringify({ query, params })
    })
};

