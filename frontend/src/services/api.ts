import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || '/api/v1',
  timeout: 30000,
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
    // Pass demo persona headers for seamless role inspection
    config.headers['X-Demo-Role'] = currentDemoRole;
    config.headers['X-Demo-Units'] = currentDemoUnits;
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Idempotency key for mutations
    if (['post', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      config.headers['Idempotency-Key'] = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg = error.response?.data?.error || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(errorMsg));
  }
);

export const apiService = {
  // Auth
  login: async (email: string, password: string) => (await api.post('/auth/login', { email, password })).data,
  verifyMfa: async (userId: string, code: string, isBackupCode: boolean = false) =>
    (await api.post('/auth/mfa/verify', { userId, code, isBackupCode })).data,
  mockOAuth: async (provider: string, email: string) => (await api.post('/auth/oauth/mock', { provider, email })).data,
  logout: async () => (await api.post('/auth/logout')).data,
  getMe: async () => (await api.get('/auth/me')).data,

  // Queries
  submitQuery: async (question: string, filters?: any) => (await api.post('/queries', { question, filters })).data,
  getQuery: async (queryId: string) => (await api.get(`/queries/${queryId}`)).data,
  exportCsv: async (queryId: string) => {
    const response = await api.post('/queries/export-csv', { queryId }, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `provenance_audit_${queryId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Dashboard
  getDashboardSummary: async () => (await api.get('/dashboard/summary')).data,
  acknowledgeAlert: async (alertId: string) => (await api.post(`/dashboard/alerts/${alertId}/acknowledge`)).data,

  // Ontology & Metrics
  getOntology: async () => (await api.get('/ontology')).data,
  getMetrics: async () => (await api.get('/ontology/metrics')).data,

  // Knowledge Graph
  getGraph: async () => (await api.get('/graph')).data,
  traceDisruptions: async (entityId: string) => (await api.get(`/graph/disruptions/${entityId}`)).data,

  // Simulation
  getScenarios: async () => (await api.get('/simulation/scenarios')).data,
  runSimulation: async (payload: any) => (await api.post('/simulation/run', payload)).data,
  generateHmacSignature: async (scenarioId: string, approverEmail: string) =>
    (await api.post('/simulation/generate-signature', { scenarioId, approverEmail })).data,
  approveMitigation: async (scenarioId: string, approverEmail: string, signature: string, timestamp: number) =>
    (await api.post('/simulation/approve', { scenarioId, approverEmail, signature, timestamp })).data,

  // Audit
  getAuditRecords: async () => (await api.get('/audit/records')).data,
  verifyAuditIntegrity: async () => (await api.post('/audit/verify')).data,
  getSecurityAlerts: async () => (await api.get('/audit/alerts')).data,
  resolveAlert: async (alertId: string) => (await api.post(`/audit/alerts/${alertId}/resolve`)).data,

  // Admin
  getRoles: async () => (await api.get('/admin/roles')).data,
  getApiKeys: async () => (await api.get('/admin/api-keys')).data,
  createApiKey: async (name: string, scopes?: string[]) => (await api.post('/admin/api-keys', { name, scopes })).data,
  revokeApiKey: async (keyId: string) => (await api.post(`/admin/api-keys/${keyId}/revoke`)).data
};

export default api;
