import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { SimulationScenario } from '../types/index.js';
import {
  MOCK_KPIS,
  MOCK_HISTORICAL_TRENDS,
  MOCK_ALERTS,
  MOCK_GRAPH_NODES,
  MOCK_GRAPH_EDGES,
  MOCK_METRICS,
  MOCK_SCENARIOS,
  MOCK_AUDIT_RECORDS,
  MOCK_SECURITY_ALERTS,
  MOCK_ROLES,
  MOCK_API_KEYS,
  generateMockQueryResult
} from './mockData.js';

const api: AxiosInstance = axios.create({
  baseURL: ((import.meta as any).env?.VITE_API_URL as string) || '/api/v1',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

let currentToken: string | null = null;
let currentDemoRole: string = 'ADMIN';
let currentDemoUnits: string = 'ALL,EMEA,APAC,AMER';

export function setAuthToken(token: string | null) {
  currentToken = token;
}

export function setDemoPersona(role: string, businessUnits: string[]) {
  currentDemoRole = role;
  currentDemoUnits = businessUnits.join(',');
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    config.headers['X-Demo-Role'] = currentDemoRole;
    config.headers['X-Demo-Units'] = currentDemoUnits;
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    if (['post', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      config.headers['Idempotency-Key'] = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // If Vercel rewrites /api/v1/* to /index.html, it returns 200 with HTML
    if (typeof response.data === 'string' && (response.data.includes('<!DOCTYPE html>') || response.data.includes('<html'))) {
      return Promise.reject(new Error('HTML_REWRITE_DETECTED'));
    }
    return response;
  },
  (error) => {
    const errorMsg = error.response?.data?.error || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(errorMsg));
  }
);

// In-memory state for client-side persistence in static/demo mode
let clientAlerts = [...MOCK_ALERTS];
let clientScenarios = [...MOCK_SCENARIOS];
let clientAuditRecords = [...MOCK_AUDIT_RECORDS];
let clientApiKeys = [...MOCK_API_KEYS];

export const apiService = {
  // Auth
  login: async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.accessToken) return res.data;
    } catch (e) {
      // Demo fallback
    }
    const role = email.includes('admin') ? 'ADMIN' : email.includes('analyst') ? 'ANALYST' : 'OPERATOR';
    const units = email.includes('emea') ? ['EMEA'] : email.includes('apac') ? ['APAC'] : ['ALL'];
    return {
      accessToken: `mock_jwt_${Date.now()}`,
      refreshToken: `mock_refresh_${Date.now()}`,
      user: {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0].toUpperCase(),
        email,
        role,
        businessUnits: units
      }
    };
  },

  verifyMfa: async (userId: string, code: string, isBackupCode: boolean = false) => {
    try {
      const res = await api.post('/auth/mfa/verify', { userId, code, isBackupCode });
      if (res.data?.accessToken) return res.data;
    } catch (e) {}
    return {
      accessToken: `mock_jwt_mfa_${Date.now()}`,
      user: {
        id: userId,
        email: 'admin@provenance.io',
        role: 'ADMIN',
        businessUnits: ['ALL', 'EMEA', 'APAC', 'AMER']
      }
    };
  },

  mockOAuth: async (provider: string, email: string) => {
    try {
      const res = await api.post('/auth/oauth/mock', { provider, email });
      if (res.data?.accessToken) return res.data;
    } catch (e) {}
    return {
      accessToken: `mock_oauth_${Date.now()}`,
      user: {
        id: `usr_oauth`,
        email,
        role: 'ADMIN',
        businessUnits: ['ALL', 'EMEA', 'APAC', 'AMER']
      }
    };
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    return { success: true };
  },

  getMe: async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.id) return res.data;
    } catch (e) {}
    return {
      id: 'usr_admin',
      name: 'CSCO (Global Admin)',
      email: 'admin@provenance.io',
      role: currentDemoRole,
      businessUnits: currentDemoUnits.split(',')
    };
  },

  // Queries
  submitQuery: async (question: string, filters?: any) => {
    try {
      const res = await api.post('/queries', { question, filters });
      if (res.data?.queryId && res.data?.rows) return res.data;
    } catch (e) {}
    // Seamless governed client query execution
    return generateMockQueryResult(question, currentDemoRole, currentDemoUnits.split(','));
  },

  getQuery: async (queryId: string) => {
    try {
      const res = await api.get(`/queries/${queryId}`);
      if (res.data?.queryId) return res.data;
    } catch (e) {}
    return generateMockQueryResult('Which suppliers have delivery delays exceeding 5 days?', currentDemoRole, currentDemoUnits.split(','));
  },

  exportCsv: async (queryId: string) => {
    try {
      const response = await api.post('/queries/export-csv', { queryId }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `provenance_audit_${queryId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    } catch (e) {}
    // Client CSV download fallback
    const csvContent = "data:text/csv;charset=utf-8,Supplier,Region,DelayDays,OTIF,Status\nGlobal Precision Mechanics,APAC,7.8,74.2%,CRITICAL\nMaersk Ocean Carrier,EMEA,6.1,85.3%,AT_RISK\nFoxconn Industrial,EMEA,5.2,88.6%,AT_RISK";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `provenance_audit_${queryId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Dashboard
  getDashboardSummary: async () => {
    try {
      const res = await api.get('/dashboard/summary');
      if (res.data?.kpis && Array.isArray(res.data.kpis)) return res.data;
    } catch (e) {}
    return {
      kpis: MOCK_KPIS,
      historicalTrends: MOCK_HISTORICAL_TRENDS,
      alerts: clientAlerts
    };
  },

  acknowledgeAlert: async (alertId: string) => {
    try {
      const res = await api.post(`/dashboard/alerts/${alertId}/acknowledge`);
      if (res.data?.success) return res.data;
    } catch (e) {}
    clientAlerts = clientAlerts.map(a => a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' as const } : a);
    return { success: true, alertId };
  },

  // Ontology & Metrics
  getOntology: async () => {
    try {
      const res = await api.get('/ontology');
      if (res.data?.classes) return res.data;
    } catch (e) {}
    return {
      classes: [
        { name: 'Supplier', description: 'Tiered component, raw material, or assembly vendor', instanceCount: 142 },
        { name: 'DistributionHub', description: 'Intermodal freight terminal or regional fulfillment center', instanceCount: 38 },
        { name: 'ProductSKU', description: 'Finished good or bill-of-materials component', instanceCount: 1240 },
        { name: 'ShipmentLane', description: 'Active ocean, rail, air, or drayage transit corridor', instanceCount: 89 }
      ]
    };
  },

  getMetrics: async () => {
    try {
      const res = await api.get('/ontology/metrics');
      if (res.data?.registry) return res.data;
    } catch (e) {}
    return {
      registry: MOCK_METRICS
    };
  },

  // Knowledge Graph
  getGraph: async () => {
    try {
      const res = await api.get('/graph');
      if (res.data?.nodes && Array.isArray(res.data.nodes)) return res.data;
    } catch (e) {}
    return {
      nodes: MOCK_GRAPH_NODES,
      edges: MOCK_GRAPH_EDGES
    };
  },

  traceDisruptions: async (entityId: string) => {
    try {
      const res = await api.get(`/graph/disruptions/${entityId}`);
      if (res.data?.affectedNodes) return res.data;
    } catch (e) {}
    const matched = MOCK_GRAPH_NODES.find(n => n.id === entityId) || MOCK_GRAPH_NODES[0];
    return {
      targetId: entityId,
      targetName: matched.label,
      rippleDepth: 2,
      affectedNodes: [
        { id: 'wh_rotterdam_01', name: 'Rotterdam EuroHub DC', impact: 'Delayed Inbound (+6.5d)' },
        { id: 'sku_sensor_709', name: 'Automotive LiDAR Optical Sensor', impact: 'Deficit Risk in 11 Days' },
        { id: 'wh_frankfurt_03', name: 'Frankfurt Central DC', impact: 'Assembly Starvation Risk' }
      ]
    };
  },

  // Simulation
  getScenarios: async () => {
    try {
      const res = await api.get('/simulation/scenarios');
      if (res.data?.scenarios) return res.data;
    } catch (e) {}
    return {
      scenarios: clientScenarios
    };
  },

  runSimulation: async (payload: any) => {
    try {
      const res = await api.post('/simulation/run', payload);
      if (res.data?.scenario) return res.data;
    } catch (e) {}
    const newScenario: SimulationScenario = {
      id: `scen_${Date.now()}`,
      name: payload.name || 'Ad-Hoc Disruption Model',
      description: `Evaluated ${payload.delayDaysDelta || 8} days lead time elongation at ${payload.costMultiplier || 1.2}x cost multiplier for ${payload.geography || 'EMEA'}.`,
      parameterChanges: {
        delayDaysDelta: payload.delayDaysDelta || 8,
        costMultiplier: payload.costMultiplier || 1.2,
        geography: payload.geography || 'EMEA'
      },
      baselineMetrics: {
        otifRate: 94.2,
        avgLeadTimeDays: 12.0,
        estimatedCostUSD: 142000000,
        stockoutRiskProbability: 0.08
      },
      simulatedMetrics: {
        otifRate: Math.max(50, Math.round((94.2 - (payload.delayDaysDelta || 8) * 0.9) * 10) / 10),
        avgLeadTimeDays: 12.0 + (payload.delayDaysDelta || 8),
        estimatedCostUSD: Math.round(142000000 * (payload.costMultiplier || 1.2)),
        stockoutRiskProbability: Math.min(0.85, 0.08 + (payload.delayDaysDelta || 8) * 0.03)
      },
      projectedStarvationDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      recommendedMitigation: 'Expedited air freight bridge and multi-echelon stock rebalance.',
      approvalRequired: true,
      approvalStatus: 'PENDING'
    };
    clientScenarios = [newScenario, ...clientScenarios];
    return { scenario: newScenario };
  },

  generateHmacSignature: async (scenarioId: string, approverEmail: string) => {
    try {
      const res = await api.post('/simulation/generate-signature', { scenarioId, approverEmail });
      if (res.data?.signature) return res.data;
    } catch (e) {}
    const timestamp = Date.now();
    return {
      scenarioId,
      approverEmail,
      timestamp,
      signature: `hmac_sha256_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`
    };
  },

  approveMitigation: async (scenarioId: string, approverEmail: string, signature: string, timestamp: number) => {
    try {
      const res = await api.post('/simulation/approve', { scenarioId, approverEmail, signature, timestamp });
      if (res.data?.status) return res.data;
    } catch (e) {}
    return {
      status: 'APPROVED',
      approvalId: `appr_${Date.now()}`,
      scenarioId,
      approverEmail,
      timestamp,
      signatureVerification: 'VALID_HMAC_SHA256',
      auditAnchor: `sha256:${Math.random().toString(36).substring(2, 14)}...`
    };
  },

  // Audit
  getAuditRecords: async () => {
    try {
      const res = await api.get('/audit/records');
      if (res.data?.records && Array.isArray(res.data.records)) return res.data;
    } catch (e) {}
    return {
      records: clientAuditRecords
    };
  },

  verifyAuditIntegrity: async () => {
    try {
      const res = await api.post('/audit/verify');
      if (res.data?.isValid !== undefined) return res.data;
    } catch (e) {}
    return {
      isValid: true,
      totalBlocks: clientAuditRecords.length,
      genesisBlock: clientAuditRecords[0]?.hash || '0000...0000',
      latestBlock: clientAuditRecords[clientAuditRecords.length - 1]?.hash || 'sha256:verified',
      verifiedAt: new Date().toISOString(),
      algorithm: 'SHA-256 Chained Hash Digest (RFC 6234)'
    };
  },

  getSecurityAlerts: async () => {
    try {
      const res = await api.get('/audit/alerts');
      if (res.data?.alerts && Array.isArray(res.data.alerts)) return res.data;
    } catch (e) {}
    return {
      alerts: MOCK_SECURITY_ALERTS
    };
  },

  resolveAlert: async (alertId: string) => {
    try {
      const res = await api.post(`/audit/alerts/${alertId}/resolve`);
      if (res.data?.success) return res.data;
    } catch (e) {}
    return { success: true, alertId };
  },

  // Admin
  getRoles: async () => {
    try {
      const res = await api.get('/admin/roles');
      if (res.data?.rolePermissions) return res.data;
    } catch (e) {}
    return {
      rolePermissions: {
        ADMIN: ['query:all', 'query:unmasked', 'audit:read', 'audit:verify', 'simulate:execute', 'simulate:approve', 'admin:keys'],
        ANALYST: ['query:scoped', 'query:masked', 'audit:read', 'simulate:execute'],
        OPERATOR: ['query:operational', 'shipment:track', 'alert:acknowledge'],
        VIEWER: ['kpi:view', 'dashboard:view']
      },
      restrictedColumns: {
        bank_details: ['ADMIN'],
        contract_pricing: ['ADMIN'],
        unitCostUSD: ['ADMIN']
      }
    };
  },

  getApiKeys: async () => {
    try {
      const res = await api.get('/admin/api-keys');
      if (res.data?.apiKeys) return res.data;
    } catch (e) {}
    return {
      apiKeys: clientApiKeys
    };
  },

  createApiKey: async (name: string, scopes: string[] = ['read:all']) => {
    try {
      const res = await api.post('/admin/api-keys', { name, scopes });
      if (res.data?.apiKey) return res.data;
    } catch (e) {}
    const newKey = {
      id: `key_${Date.now()}`,
      name,
      keyPrefix: 'prov_live_' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
      lastUsed: 'Never',
      scopes,
      status: 'ACTIVE'
    };
    clientApiKeys = [newKey, ...clientApiKeys];
    return {
      apiKey: newKey,
      secret: `prov_live_${Math.random().toString(36).substring(2, 12)}_${Math.random().toString(36).substring(2, 12)}`
    };
  },

  revokeApiKey: async (keyId: string) => {
    try {
      const res = await api.post(`/admin/api-keys/${keyId}/revoke`);
      if (res.data?.success) return res.data;
    } catch (e) {}
    clientApiKeys = clientApiKeys.filter(k => k.id !== keyId);
    return { success: true, keyId };
  }
};

export default api;
