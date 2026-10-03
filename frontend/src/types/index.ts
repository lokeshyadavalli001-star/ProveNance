export type UserRole = 'ADMIN' | 'DATA_STEWARD' | 'ANALYST' | 'OPERATOR' | 'VIEWER' | 'API_SERVICE';

export interface UserPersona {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessUnits: string[];
  description: string;
}

export interface KPICardData {
  id: string;
  label: string;
  value: string;
  unit: string;
  trend?: { direction: 'up' | 'down'; percentage: number };
  severity?: 'normal' | 'warning' | 'critical';
  subtext?: string;
}

export interface DisruptionAlert {
  id: string;
  timestamp: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  geography: string;
  description: string;
  recommendedAction: string;
  potentialImpactUnits: number;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface EvidenceStep {
  step: number;
  description: string;
  sourceEngine: 'SQL_ANALYTICS' | 'KNOWLEDGE_GRAPH' | 'ML_FORECAST';
  details: string;
}

export interface GovernedQueryResult {
  queryId: string;
  question: string;
  intent: string;
  executionTimeMs: number;
  cacheHit: boolean;
  status: 'COMPLETED' | 'POLICY_DENIED' | 'FAILED';
  summaryAnswer: string;
  columns: Array<{ name: string; label: string; isRestricted: boolean; isMasked: boolean }>;
  rows: Record<string, any>[];
  evidenceChain: EvidenceStep[];
  dataSources: Array<{ name: string; system: string; lastUpdated: string; confidence: number }>;
  metric: {
    name: string;
    code: string;
    owner: string;
    formula: string;
    version: string;
    lastUpdated: string;
  };
  security: {
    policyAuthorizationPassed: boolean;
    rowLevelSecurityApplied: string;
    restrictedColumnsFiltered: string[];
    sensitiveDataMasked: boolean;
    cryptographicHash: string;
  };
  user: {
    name: string;
    email: string;
    role: UserRole;
    businessUnit: string;
  };
}

export interface MetricDefinition {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  formula: string;
  owner: string;
  version: string;
  classificationTier: string;
  unit: string;
  targetBenchmark: string;
  lastUpdated: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  geography: string;
  tier: string;
  properties: Record<string, any>;
  provenance: {
    sourceSystem: string;
    lastSyncTimestamp: string;
    confidenceScore: number;
    recordOwner: string;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  predicate: string;
  provenance: {
    sourceSystem: string;
    verifiedAt: string;
  };
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  parameterChanges: Record<string, any>;
  baselineMetrics: {
    otifRate: number;
    avgLeadTimeDays: number;
    estimatedCostUSD: number;
    stockoutRiskProbability: number;
  };
  simulatedMetrics: {
    otifRate: number;
    avgLeadTimeDays: number;
    estimatedCostUSD: number;
    stockoutRiskProbability: number;
  };
  projectedStarvationDate: string;
  recommendedMitigation: string;
  approvalRequired: boolean;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvalTimestamp?: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  userEmail?: string;
  role?: string;
  businessUnit?: string;
  action: string;
  category: string;
  severity: string;
  details: Record<string, any>;
  previousHash: string;
  hash: string;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  type: string;
  severity: string;
  details: Record<string, any>;
  resolved: boolean;
}
