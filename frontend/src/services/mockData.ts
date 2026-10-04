import {
  GovernedQueryResult,
  KPICardData,
  DisruptionAlert,
  GraphNode,
  GraphEdge,
  MetricDefinition,
  SimulationScenario,
  AuditRecord,
  SecurityAlert
} from '../types/index.js';

export const MOCK_KPIS: KPICardData[] = [
  {
    id: 'kpi_otif',
    label: 'Global OTIF Adherence',
    value: '91.4',
    unit: '%',
    trend: { direction: 'down', percentage: 2.1 },
    severity: 'warning',
    subtext: 'Target: 95.0% | Multi-region average'
  },
  {
    id: 'kpi_lead_time',
    label: 'Weighted Lead Time',
    value: '14.8',
    unit: 'Days',
    trend: { direction: 'up', percentage: 3.4 },
    severity: 'warning',
    subtext: 'Target: < 12.0 Days across active POs'
  },
  {
    id: 'kpi_stockout_risk',
    label: 'Stockout Risk Exposure',
    value: '18',
    unit: 'SKUs',
    trend: { direction: 'up', percentage: 6.0 },
    severity: 'critical',
    subtext: '18 SKUs below 15-day buffer threshold'
  },
  {
    id: 'kpi_disruption_impact',
    label: 'Disruption Financial Impact',
    value: '$2.48',
    unit: 'M',
    trend: { direction: 'up', percentage: 25.8 },
    severity: 'critical',
    subtext: 'Demurrage, rerouting & expedited air freight'
  }
];

export const MOCK_HISTORICAL_TRENDS = [
  { period: 'Jan 2026', otif: 94.8, leadTime: 11.8, costIndex: 100 },
  { period: 'Feb 2026', otif: 94.2, leadTime: 12.1, costIndex: 102 },
  { period: 'Mar 2026', otif: 93.5, leadTime: 12.9, costIndex: 106 },
  { period: 'Apr 2026', otif: 92.1, leadTime: 13.6, costIndex: 114 },
  { period: 'May 2026', otif: 90.7, leadTime: 14.5, costIndex: 122 },
  { period: 'Jun 2026', otif: 91.4, leadTime: 14.8, costIndex: 125 }
];

export const MOCK_ALERTS: DisruptionAlert[] = [
  {
    id: 'alt_red_sea_01',
    timestamp: '2026-10-03 14:32:00',
    title: 'Red Sea Maritime Corridor Closure (Bab-el-Mandeb)',
    severity: 'CRITICAL',
    geography: 'EMEA',
    description: 'Active security hazard diverting 85% of container traffic around Cape of Good Hope (+10-14 days transit).',
    recommendedAction: 'Trigger multi-echelon inventory transfer from Rotterdam buffer stock and shift Tier-1 chips to air freight.',
    potentialImpactUnits: 42000,
    status: 'ACTIVE'
  },
  {
    id: 'alt_singapore_02',
    timestamp: '2026-10-03 11:15:00',
    title: 'PSA Singapore Yard Congestion Warning',
    severity: 'WARNING',
    geography: 'APAC',
    description: 'Vessel dwell times up 42% due to bunching of westbound container ships.',
    recommendedAction: 'Re-route upcoming feeder services to Port of Tanjung Pelepas or Port Klang.',
    potentialImpactUnits: 18500,
    status: 'ACTIVE'
  },
  {
    id: 'alt_chicago_03',
    timestamp: '2026-10-02 09:40:00',
    title: 'BNSF Chicago Intermodal Ramp Maintenance',
    severity: 'WARNING',
    geography: 'AMER',
    description: 'Track upgrades creating 48-hour container dwell on Long Beach-to-Midwest rail spine.',
    recommendedAction: 'Allocate expedited regional truck drayage for high-priority automotive assembly SKUs.',
    potentialImpactUnits: 7200,
    status: 'ACKNOWLEDGED'
  }
];

export const MOCK_GRAPH_NODES: GraphNode[] = [
  {
    id: 'sup_foxconn_01',
    label: 'Foxconn Industrial EMEA',
    type: 'Supplier',
    tier: 'Tier 1',
    geography: 'EMEA',
    properties: { category: 'Electronics Assembly', otif: 88.6, leadTimeDays: 17.5, status: 'AT_RISK' },
    provenance: { sourceSystem: 'SAP S/4HANA', lastSyncTimestamp: '2026-10-03', confidenceScore: 0.99, recordOwner: 'Master Data Steward' }
  },
  {
    id: 'sup_tsmc_02',
    label: 'TSMC Semiconductor Foundry',
    type: 'Supplier',
    tier: 'Tier 1',
    geography: 'APAC',
    properties: { category: 'Microcontrollers', otif: 98.4, leadTimeDays: 24.0, status: 'ACTIVE' },
    provenance: { sourceSystem: 'SAP S/4HANA', lastSyncTimestamp: '2026-10-03', confidenceScore: 1.0, recordOwner: 'Master Data Steward' }
  },
  {
    id: 'sup_basf_03',
    label: 'BASF Chemical Synthetics',
    type: 'Supplier',
    tier: 'Tier 2',
    geography: 'EMEA',
    properties: { category: 'Industrial Polymers', otif: 96.1, leadTimeDays: 8.2, status: 'ACTIVE' },
    provenance: { sourceSystem: 'SAP S/4HANA', lastSyncTimestamp: '2026-10-03', confidenceScore: 0.98, recordOwner: 'Procurement VP' }
  },
  {
    id: 'sup_samsung_04',
    label: 'Samsung Memory Division',
    type: 'Supplier',
    tier: 'Tier 1',
    geography: 'APAC',
    properties: { category: 'Flash Storage', otif: 91.8, leadTimeDays: 14.2, status: 'ACTIVE' },
    provenance: { sourceSystem: 'SAP S/4HANA', lastSyncTimestamp: '2026-10-03', confidenceScore: 0.99, recordOwner: 'Procurement VP' }
  },
  {
    id: 'sup_global_mech_05',
    label: 'Global Precision Mechanics',
    type: 'Supplier',
    tier: 'Tier 2',
    geography: 'APAC',
    properties: { category: 'Precision Chassis', otif: 74.2, leadTimeDays: 28.5, status: 'AT_RISK' },
    provenance: { sourceSystem: 'SAP S/4HANA', lastSyncTimestamp: '2026-10-03', confidenceScore: 0.95, recordOwner: 'Procurement VP' }
  },
  {
    id: 'sup_maersk_06',
    label: 'Maersk Ocean Carrier',
    type: 'Carrier',
    tier: 'Tier 1',
    geography: 'EMEA',
    properties: { category: 'Maritime Logistics', otif: 85.3, leadTimeDays: 22.0, status: 'AT_RISK' },
    provenance: { sourceSystem: 'Blue Yonder TMS', lastSyncTimestamp: '2026-10-03', confidenceScore: 0.97, recordOwner: 'Logistics Operations' }
  },
  {
    id: 'sup_dhl_07',
    label: 'DHL Express Logistics',
    type: 'Carrier',
    tier: 'Tier 1',
    geography: 'AMER',
    properties: { category: 'Global Freight Forwarding', otif: 97.4, leadTimeDays: 4.5, status: 'ACTIVE' },
    provenance: { sourceSystem: 'Blue Yonder TMS', lastSyncTimestamp: '2026-10-03', confidenceScore: 0.99, recordOwner: 'Logistics Operations' }
  },
  {
    id: 'wh_rotterdam_01',
    label: 'Rotterdam EuroHub DC',
    type: 'Warehouse',
    tier: 'Tier 1',
    geography: 'EMEA',
    properties: { capacityUtilization: 88, safetyStockDays: 18, stockoutRisk: 'WARNING' },
    provenance: { sourceSystem: 'Manhattan WMS', lastSyncTimestamp: '2026-10-03', confidenceScore: 0.99, recordOwner: 'DC Operations' }
  },
  {
    id: 'wh_singapore_02',
    label: 'Singapore Transshipment DC',
    type: 'Warehouse',
    tier: 'Tier 1',
    geography: 'APAC',
    properties: { capacityUtilization: 94, safetyStockDays: 11, stockoutRisk: 'CRITICAL' },
    provenance: { sourceSystem: 'Manhattan WMS', lastSyncTimestamp: '2026-10-03', confidenceScore: 0.98, recordOwner: 'DC Operations' }
  },
  {
    id: 'wh_frankfurt_03',
    label: 'Frankfurt Central DC',
    type: 'Warehouse',
    tier: 'Tier 1',
    geography: 'EMEA',
    properties: { capacityUtilization: 72, safetyStockDays: 32, stockoutRisk: 'NORMAL' },
    provenance: { sourceSystem: 'Manhattan WMS', lastSyncTimestamp: '2026-10-03', confidenceScore: 0.99, recordOwner: 'DC Operations' }
  },
  {
    id: 'wh_chicago_04',
    label: 'Chicago Intermodal DC',
    type: 'Warehouse',
    tier: 'Tier 1',
    geography: 'AMER',
    properties: { capacityUtilization: 81, safetyStockDays: 28, stockoutRisk: 'NORMAL' },
    provenance: { sourceSystem: 'Manhattan WMS', lastSyncTimestamp: '2026-10-03', confidenceScore: 0.99, recordOwner: 'DC Operations' }
  },
  {
    id: 'wh_shenzhen_05',
    label: 'Shenzhen Export Hub',
    type: 'Warehouse',
    tier: 'Tier 1',
    geography: 'APAC',
    properties: { capacityUtilization: 85, safetyStockDays: 24, stockoutRisk: 'NORMAL' },
    provenance: { sourceSystem: 'Manhattan WMS', lastSyncTimestamp: '2026-10-03', confidenceScore: 0.99, recordOwner: 'DC Operations' }
  },
  {
    id: 'sku_micro_301',
    label: 'STM32 Microcontroller Core',
    type: 'Product',
    tier: 'Tier 1',
    geography: 'APAC',
    properties: { unitCostUSD: 320, forecastAccuracy: 94 },
    provenance: { sourceSystem: 'SAP PLM', lastSyncTimestamp: '2026-10-03', confidenceScore: 0.99, recordOwner: 'Product Engineering' }
  },
  {
    id: 'sku_flash_502',
    label: '128GB NAND Flash Module',
    type: 'Product',
    tier: 'Tier 1',
    geography: 'APAC',
    properties: { unitCostUSD: 88, forecastAccuracy: 91 },
    provenance: { sourceSystem: 'SAP PLM', lastSyncTimestamp: '2026-10-03', confidenceScore: 0.99, recordOwner: 'Product Engineering' }
  },
  {
    id: 'sku_sensor_709',
    label: 'Automotive LiDAR Optical Sensor',
    type: 'Product',
    tier: 'Tier 1',
    geography: 'EMEA',
    properties: { unitCostUSD: 142.5, forecastAccuracy: 88 },
    provenance: { sourceSystem: 'SAP PLM', lastSyncTimestamp: '2026-10-03', confidenceScore: 0.99, recordOwner: 'Product Engineering' }
  },
  {
    id: 'sku_polymer_104',
    label: 'Reinforced PEEK Polymer Resin',
    type: 'Product',
    tier: 'Tier 2',
    geography: 'EMEA',
    properties: { unitCostUSD: 45.2, forecastAccuracy: 96 },
    provenance: { sourceSystem: 'SAP PLM', lastSyncTimestamp: '2026-10-03', confidenceScore: 0.99, recordOwner: 'Product Engineering' }
  },
  {
    id: 'sku_chassis_201',
    label: 'Titanium Cast Enclosure',
    type: 'Product',
    tier: 'Tier 2',
    geography: 'APAC',
    properties: { unitCostUSD: 65.5, forecastAccuracy: 84 },
    provenance: { sourceSystem: 'SAP PLM', lastSyncTimestamp: '2026-10-03', confidenceScore: 0.99, recordOwner: 'Product Engineering' }
  }
];

export const MOCK_GRAPH_EDGES: GraphEdge[] = [
  { id: 'e1', source: 'sup_tsmc_02', target: 'sku_micro_301', predicate: 'MANUFACTURES', provenance: { sourceSystem: 'SAP ERP', verifiedAt: '2026-10-03' } },
  { id: 'e2', source: 'sup_samsung_04', target: 'sku_flash_502', predicate: 'MANUFACTURES', provenance: { sourceSystem: 'SAP ERP', verifiedAt: '2026-10-03' } },
  { id: 'e3', source: 'sup_foxconn_01', target: 'sku_sensor_709', predicate: 'ASSEMBLES', provenance: { sourceSystem: 'SAP ERP', verifiedAt: '2026-10-03' } },
  { id: 'e4', source: 'sup_basf_03', target: 'sku_polymer_104', predicate: 'SYNTHESIZES', provenance: { sourceSystem: 'SAP ERP', verifiedAt: '2026-10-03' } },
  { id: 'e5', source: 'sup_global_mech_05', target: 'sku_chassis_201', predicate: 'MILLS', provenance: { sourceSystem: 'SAP ERP', verifiedAt: '2026-10-03' } },
  { id: 'e6', source: 'sup_foxconn_01', target: 'wh_rotterdam_01', predicate: 'SHIPS_TO', provenance: { sourceSystem: 'TMS', verifiedAt: '2026-10-03' } },
  { id: 'e7', source: 'sup_tsmc_02', target: 'wh_singapore_02', predicate: 'SHIPS_TO', provenance: { sourceSystem: 'TMS', verifiedAt: '2026-10-03' } },
  { id: 'e8', source: 'wh_singapore_02', target: 'wh_rotterdam_01', predicate: 'TRANSFERS_TO', provenance: { sourceSystem: 'TMS', verifiedAt: '2026-10-03' } },
  { id: 'e9', source: 'wh_rotterdam_01', target: 'wh_frankfurt_03', predicate: 'RAIL_CONNECTS', provenance: { sourceSystem: 'TMS', verifiedAt: '2026-10-03' } },
  { id: 'e10', source: 'wh_shenzhen_05', target: 'wh_chicago_04', predicate: 'OCEAN_CROSSING', provenance: { sourceSystem: 'TMS', verifiedAt: '2026-10-03' } },
  { id: 'e11', source: 'sup_maersk_06', target: 'wh_rotterdam_01', predicate: 'DELIVERS_TO', provenance: { sourceSystem: 'TMS', verifiedAt: '2026-10-03' } },
  { id: 'e12', source: 'sup_dhl_07', target: 'wh_chicago_04', predicate: 'DELIVERS_TO', provenance: { sourceSystem: 'TMS', verifiedAt: '2026-10-03' } }
];

export const MOCK_METRICS: MetricDefinition[] = [
  {
    id: 'm_otif',
    name: 'On-Time In-Full Delivery Rate',
    code: 'OTIF_RATE',
    category: 'Logistics',
    description: 'Percentage of customer and production orders delivered strictly on or before promised delivery date with 100% quantity fulfilled.',
    formula: '(Count of Shipments Delivered On-Time & In-Full / Total Delivered Shipments) * 100',
    owner: 'Global Logistics Operations',
    version: 'v2.4 (2026 Rev)',
    classificationTier: 'Tier 1 (Executive Metric)',
    unit: '%',
    targetBenchmark: '95.0%',
    lastUpdated: 'Hourly'
  },
  {
    id: 'm_lead_time',
    name: 'Weighted Procurement Lead Time',
    code: 'WEIGHTED_LEAD_TIME',
    category: 'Procurement',
    description: 'Composite elapsed time in days from purchase order confirmation to dock-receipt warehouse entry, weighted by line-item purchase value.',
    formula: 'SUM(Days Elapsed * Line Item Value) / SUM(Line Item Value)',
    owner: 'Strategic Procurement Council',
    version: 'v1.8',
    classificationTier: 'Tier 1 (Operational)',
    unit: 'Days',
    targetBenchmark: '< 12.0 Days',
    lastUpdated: 'Daily ERP Batch'
  },
  {
    id: 'm_sri',
    name: 'Stockout Risk Index (SRI)',
    code: 'STOCKOUT_RISK_INDEX',
    category: 'Inventory',
    description: 'Predictive probability score (0 to 100) that an active SKU will drop below mandatory buffer threshold within 30 days based on demand velocity and lead-time variance.',
    formula: '100 * (1 - (Current Inventory + Confirmed POs) / (Demand Velocity * 30 + Safety Buffer))',
    owner: 'Inventory Decision Intelligence',
    version: 'v3.1 (ML Calibrated)',
    classificationTier: 'Tier 2 (Tactical)',
    unit: 'Index (0-100)',
    targetBenchmark: '< 25.0',
    lastUpdated: 'Every 15 Minutes'
  },
  {
    id: 'm_health',
    name: 'Composite Supplier Health Score',
    code: 'COMPOSITE_SUPPLIER_HEALTH',
    category: 'Vendor Governance',
    description: 'Multi-factor weighted evaluation index ranking tier-1 and tier-2 vendor sustainability and delivery reliability.',
    formula: '(OTIF * 0.40) + ((100 - DelayDays*10) * 0.30) + (FinancialSolvency * 0.20) + (ESGScore * 0.10)',
    owner: 'Vendor Governance Board',
    version: 'v2.0',
    classificationTier: 'Tier 2 (Tactical)',
    unit: 'Score (0-100)',
    targetBenchmark: '> 85.0',
    lastUpdated: 'Daily'
  }
];

export const MOCK_SCENARIOS: SimulationScenario[] = [
  {
    id: 'scen_redsea_cape_01',
    name: 'Red Sea Corridor Geopolitical Closure (Cape of Good Hope Divert)',
    description: 'Simulates mandatory diversion of all Asia-Europe maritime container ships around Africa with an average +12 day delay and $1,250/TEU bunker surcharge.',
    parameterChanges: {
      divertRoute: 'Cape of Good Hope',
      addedLeadTimeDays: 12,
      bunkerSurchargePerTEU: 1250,
      geography: 'EMEA'
    },
    baselineMetrics: {
      otifRate: 94.2,
      avgLeadTimeDays: 12.0,
      estimatedCostUSD: 142000000,
      stockoutRiskProbability: 0.08
    },
    simulatedMetrics: {
      otifRate: 85.8,
      avgLeadTimeDays: 24.0,
      estimatedCostUSD: 323250000,
      stockoutRiskProbability: 0.38
    },
    projectedStarvationDate: '2026-10-24',
    recommendedMitigation: 'Charter dedicated air freight bridge for Tier-1 microcontrollers and shift 35% polymer allocation to BASF Europe.',
    approvalRequired: true,
    approvalStatus: 'PENDING'
  },
  {
    id: 'scen_taiwan_fab_02',
    name: 'Hsinchu Science Park Fab Power Fluctuation Delay',
    description: 'Simulates a 4-week yield delay in TSMC automotive microcontrollers affecting North American assembly plants.',
    parameterChanges: {
      fabDowntimeDays: 14,
      productionLossUnits: 280000,
      geography: 'APAC'
    },
    baselineMetrics: {
      otifRate: 96.0,
      avgLeadTimeDays: 14.0,
      estimatedCostUSD: 88000000,
      stockoutRiskProbability: 0.05
    },
    simulatedMetrics: {
      otifRate: 83.9,
      avgLeadTimeDays: 32.0,
      estimatedCostUSD: 152000000,
      stockoutRiskProbability: 0.45
    },
    projectedStarvationDate: '2026-11-02',
    recommendedMitigation: 'Authorize $9.6M spot market broker purchase of qualified alternate packaging SKUs.',
    approvalRequired: true,
    approvalStatus: 'PENDING'
  }
];

export const MOCK_AUDIT_RECORDS: AuditRecord[] = [
  {
    id: 'aud_gen_001',
    timestamp: '2026-10-03 14:10:02',
    userEmail: 'system_root',
    role: 'SYSTEM',
    businessUnit: 'GLOBAL',
    action: 'SYSTEM_GENESIS_ANCHOR',
    category: 'GOVERNANCE',
    severity: 'INFO',
    details: { event: 'Genesis cryptographic anchor established with SHA-256 state chain verification.' },
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    hash: '7a8f9c2d1e0b3a4c5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a'
  },
  {
    id: 'aud_query_002',
    timestamp: '2026-10-03 14:22:15',
    userEmail: 'admin@provenance.io',
    role: 'ADMIN',
    businessUnit: 'ALL',
    action: 'GOVERNED_QUERY_EXECUTION',
    category: 'DATA_ACCESS',
    severity: 'INFO',
    details: { intent: 'SUPPLIER_DELIVERY_DELAYS', rlsApplied: 'GLOBAL', unmaskedColumns: true },
    previousHash: '7a8f9c2d1e0b3a4c5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a',
    hash: '3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b'
  },
  {
    id: 'aud_policy_003',
    timestamp: '2026-10-03 14:35:48',
    userEmail: 'analyst.emea@provenance.io',
    role: 'ANALYST',
    businessUnit: 'EMEA',
    action: 'COLUMN_MASKING_ENFORCED',
    category: 'POLICY_ENFORCEMENT',
    severity: 'WARN',
    details: { maskedColumns: ['bank_details', 'contract_pricing'], scope: 'EMEA_ONLY' },
    previousHash: '3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b',
    hash: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e'
  },
  {
    id: 'aud_mit_004',
    timestamp: '2026-10-03 15:02:11',
    userEmail: 'admin@provenance.io',
    role: 'ADMIN',
    businessUnit: 'ALL',
    action: 'HMAC_MITIGATION_SIGNATURE_VERIFIED',
    category: 'CRYPTO_EXECUTION',
    severity: 'INFO',
    details: { mitigationId: 'mit_air_bridge_01', proofValid: true, standard: 'RFC-8439' },
    previousHash: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e',
    hash: 'b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2'
  }
];

export const MOCK_SECURITY_ALERTS: SecurityAlert[] = [
  {
    id: 'sec_01',
    timestamp: '2026-10-03 13:45:00',
    type: 'INJECTION_ATTEMPT_PREVENTED',
    severity: 'HIGH',
    details: { actor: 'external_ip_194.26.29.11', rule: 'SQL_PARSER_BLOCK' },
    resolved: true
  },
  {
    id: 'sec_02',
    timestamp: '2026-10-03 12:10:00',
    type: 'ABAC_BOUNDARY_RESTRICTION',
    severity: 'INFO',
    details: { actor: 'analyst.emea@provenance.io', restrictedScope: 'APAC_WAREHOUSES' },
    resolved: true
  }
];

export const MOCK_ROLES = [
  {
    name: 'ADMIN',
    description: 'Executive CSCO / Master Data Steward with unrestricted cross-region visibility and crypto signing.',
    permissions: ['query:all', 'query:unmasked', 'audit:read', 'audit:verify', 'simulate:execute', 'simulate:approve', 'admin:keys']
  },
  {
    name: 'ANALYST',
    description: 'Regional Business Unit Analyst. Sensitive financial columns masked and RLS enforced.',
    permissions: ['query:scoped', 'query:masked', 'audit:read', 'simulate:execute']
  },
  {
    name: 'OPERATOR',
    description: 'Distribution Center Logistics Specialist with shipment tracking execution rights.',
    permissions: ['query:operational', 'shipment:track', 'alert:acknowledge']
  },
  {
    name: 'VIEWER',
    description: 'Auditor or Executive Observer with read-only access to aggregate KPIs.',
    permissions: ['kpi:view', 'dashboard:view']
  }
];

export const MOCK_API_KEYS = [
  {
    id: 'key_prod_erp_gateway',
    name: 'SAP S/4HANA ERP Connector',
    keyPrefix: 'prov_live_9a8b',
    createdAt: '2026-09-15T00:00:00Z',
    expiresAt: '2027-09-15T00:00:00Z',
    lastUsed: '2026-10-03 15:40:22',
    scopes: ['orders:sync', 'inventory:read', 'suppliers:read'],
    status: 'ACTIVE'
  },
  {
    id: 'key_tms_ocean_telemetry',
    name: 'Blue Yonder TMS Live Ingestion',
    keyPrefix: 'prov_live_44f1',
    createdAt: '2026-09-20T00:00:00Z',
    expiresAt: '2027-09-20T00:00:00Z',
    lastUsed: '2026-10-03 15:42:01',
    scopes: ['shipments:ingest', 'telemetry:write'],
    status: 'ACTIVE'
  }
];

export function generateMockQueryResult(question: string, activeRole: string, activeBusinessUnits: string[]): GovernedQueryResult {
  const qLower = question.toLowerCase();
  const isDelay = qLower.includes('delay') || qLower.includes('late');
  const isStockout = qLower.includes('stockout') || qLower.includes('inventory') || qLower.includes('risk');
  const isHealth = qLower.includes('health') || qLower.includes('supplier') || qLower.includes('lead time');

  const isAdmin = activeRole === 'ADMIN';

  let rows: Record<string, any>[] = [];
  let columns: Array<{ name: string; label: string; isRestricted: boolean; isMasked: boolean }> = [];
  let intent = 'SUPPLIER_DELIVERY_DELAYS';
  let summaryAnswer = '';
  let metricCode = 'WEIGHTED_LEAD_TIME';

  if (isStockout) {
    intent = 'STOCKOUT_RISK_PREDICTION';
    metricCode = 'STOCKOUT_RISK_INDEX';
    columns = [
      { name: 'sku', label: 'Product SKU', isRestricted: false, isMasked: false },
      { name: 'name', label: 'Product Name', isRestricted: false, isMasked: false },
      { name: 'warehouse', label: 'Storage Facility', isRestricted: false, isMasked: false },
      { name: 'safetyStockDays', label: 'Buffer Stock (Days)', isRestricted: false, isMasked: false },
      { name: 'stockoutRisk', label: 'Risk Level', isRestricted: false, isMasked: false },
      { name: 'unitCostUSD', label: 'Inventory Value ($)', isRestricted: true, isMasked: !isAdmin }
    ];

    rows = [
      { sku: 'SKU-LID-709', name: 'Automotive LiDAR Optical Sensor', warehouse: 'Rotterdam EuroHub DC', safetyStockDays: 4, stockoutRisk: 'CRITICAL', unitCostUSD: isAdmin ? '$142.50' : '••••••' },
      { sku: 'SKU-FLA-502', name: '128GB NAND Flash Module', warehouse: 'Singapore Transshipment DC', safetyStockDays: 7, stockoutRisk: 'CRITICAL', unitCostUSD: isAdmin ? '$88.00' : '••••••' },
      { sku: 'SKU-CHA-201', name: 'Titanium Cast Enclosure', warehouse: 'Frankfurt Central DC', safetyStockDays: 9, stockoutRisk: 'WARNING', unitCostUSD: isAdmin ? '$65.50' : '••••••' },
      { sku: 'SKU-MIC-301', name: 'STM32 Microcontroller Core', warehouse: 'Chicago Intermodal DC', safetyStockDays: 12, stockoutRisk: 'WARNING', unitCostUSD: isAdmin ? '$320.00' : '••••••' }
    ];

    summaryAnswer = 'Identified 4 high-velocity SKUs with buffer stock levels under 15 days. Primary vulnerability is centered on Automotive LiDAR sensors in Rotterdam (4 days buffer) caused by Cape of Good Hope transit delays.';
  } else if (isHealth || isDelay) {
    intent = 'SUPPLIER_DELIVERY_DELAYS';
    metricCode = 'WEIGHTED_LEAD_TIME';
    columns = [
      { name: 'supplier', label: 'Supplier Name', isRestricted: false, isMasked: false },
      { name: 'geography', label: 'Region', isRestricted: false, isMasked: false },
      { name: 'activeDelayDays', label: 'Current Delay (Days)', isRestricted: false, isMasked: false },
      { name: 'otifRate', label: 'OTIF %', isRestricted: false, isMasked: false },
      { name: 'riskLevel', label: 'Status', isRestricted: false, isMasked: false },
      { name: 'bank_details', label: 'Settlement Escrow', isRestricted: true, isMasked: !isAdmin },
      { name: 'contract_pricing', label: 'Frame Agreement', isRestricted: true, isMasked: !isAdmin }
    ];

    rows = [
      { supplier: 'Global Precision Mechanics', geography: 'APAC', activeDelayDays: '7.8 Days', otifRate: '74.2%', riskLevel: 'CRITICAL', bank_details: isAdmin ? 'IBAN VN5598...7890' : '••••••••••••••••', contract_pricing: isAdmin ? '$5,200,000 PO' : '••••••••••••••••' },
      { supplier: 'Maersk Ocean Carrier', geography: 'EMEA', activeDelayDays: '6.1 Days', otifRate: '85.3%', riskLevel: 'AT_RISK', bank_details: isAdmin ? 'IBAN DK4489...6543' : '••••••••••••••••', contract_pricing: isAdmin ? '$18,900,000 PO' : '••••••••••••••••' },
      { supplier: 'Foxconn Industrial EMEA', geography: 'EMEA', activeDelayDays: '5.2 Days', otifRate: '88.6%', riskLevel: 'AT_RISK', bank_details: isAdmin ? 'IBAN DE8937...3000' : '••••••••••••••••', contract_pricing: isAdmin ? '$14,250,000 PO' : '••••••••••••••••' },
      { supplier: 'Samsung Memory Division', geography: 'APAC', activeDelayDays: '3.4 Days', otifRate: '91.8%', riskLevel: 'MONITORED', bank_details: isAdmin ? 'IBAN KR8812...5678' : '••••••••••••••••', contract_pricing: isAdmin ? '$26,500,000 PO' : '••••••••••••••••' }
    ];

    summaryAnswer = `Discovered 3 Tier-1/2 suppliers exhibiting average shipment delays exceeding 5 days. Global Precision Mechanics (APAC) and Maersk Ocean (EMEA) exhibit highest operational vulnerability. Policy Guard enforced row boundaries for ${activeBusinessUnits.join(', ')}.`;
  } else {
    intent = 'OTIF_PERFORMANCE_ANALYTICS';
    metricCode = 'OTIF_RATE';
    columns = [
      { name: 'facility', label: 'Logistics Facility', isRestricted: false, isMasked: false },
      { name: 'region', label: 'Region', isRestricted: false, isMasked: false },
      { name: 'otif', label: 'Current OTIF', isRestricted: false, isMasked: false },
      { name: 'target', label: 'Target SLA', isRestricted: false, isMasked: false },
      { name: 'variance', label: 'Delta', isRestricted: false, isMasked: false }
    ];

    rows = [
      { facility: 'Rotterdam EuroHub DC', region: 'EMEA', otif: '95.8%', target: '95.0%', variance: '+0.8%' },
      { facility: 'Frankfurt Central DC', region: 'EMEA', otif: '97.0%', target: '95.0%', variance: '+2.0%' },
      { facility: 'Chicago Intermodal DC', region: 'AMER', otif: '94.1%', target: '95.0%', variance: '-0.9%' },
      { facility: 'Singapore Transshipment DC', region: 'APAC', otif: '88.2%', target: '95.0%', variance: '-6.8%' }
    ];

    summaryAnswer = 'Global On-Time In-Full fulfillment stands at 91.4% against a target SLA of 95.0%. European distribution nodes maintain positive compliance, whereas Southeast Asian transshipment hubs have dropped by 6.8% due to yard dwell.';
  }

  if (!activeBusinessUnits.includes('ALL')) {
    rows = rows.filter(r => {
      const geo = r.geography || r.region;
      return !geo || activeBusinessUnits.includes(geo);
    });
  }

  return {
    queryId: `qry_${Date.now()}`,
    question,
    intent,
    executionTimeMs: 142,
    cacheHit: false,
    status: 'COMPLETED',
    summaryAnswer,
    columns,
    rows,
    evidenceChain: [
      {
        step: 1,
        description: 'Intent Classification & Policy Guard Clearance',
        sourceEngine: 'KNOWLEDGE_GRAPH',
        details: `Classified user prompt into intent "${intent}". Verified active role [${activeRole}] against ABAC security policy matrix.`
      },
      {
        step: 2,
        description: 'Semantic Layer Grounding & Metric Resolution',
        sourceEngine: 'SQL_ANALYTICS',
        details: `Resolved business metric [${metricCode}] from governed registry. Prevented LLM metric invention.`
      },
      {
        step: 3,
        description: 'Multi-Source SQL Execution with Row & Column Guardrails',
        sourceEngine: 'SQL_ANALYTICS',
        details: `Injected RLS predicates for [${activeBusinessUnits.join(', ')}]. Masked restricted financial columns for non-admin personas.`
      },
      {
        step: 4,
        description: 'Multi-Hop Relational Lineage Traversal',
        sourceEngine: 'KNOWLEDGE_GRAPH',
        details: 'Traversed graph entities (Vendor → Carrier → Warehouse → SKU) to verify downstream impact.'
      }
    ],
    dataSources: [
      { name: 'SAP S/4HANA Master Orders Ledger', system: 'ERP', lastUpdated: '10 mins ago', confidence: 0.99 },
      { name: 'Blue Yonder TMS Vessel Telemetry', system: 'TMS', lastUpdated: '3 mins ago', confidence: 0.98 },
      { name: 'Manhattan WMS Inventory Ledger', system: 'WMS', lastUpdated: '5 mins ago', confidence: 0.99 }
    ],
    metric: {
      name: 'Approved Operational Metric',
      code: metricCode,
      owner: 'Supply Chain Governance Council',
      formula: 'SUM(Delivered On Time In Full) / SUM(Total Orders)',
      version: 'v2.4 (2026)',
      lastUpdated: '2026-10-01'
    },
    security: {
      policyAuthorizationPassed: true,
      rowLevelSecurityApplied: activeBusinessUnits.includes('ALL') ? 'GLOBAL_CROSS_REGION' : `REGION IN ('${activeBusinessUnits.join("','")}')`,
      restrictedColumnsFiltered: isAdmin ? [] : ['bank_details', 'contract_pricing', 'unitCostUSD'],
      sensitiveDataMasked: !isAdmin,
      cryptographicHash: `sha256:${Math.random().toString(36).substring(2, 12)}...`
    },
    user: {
      name: 'Current Authenticated User',
      email: 'user@provenance.io',
      role: activeRole as any,
      businessUnit: activeBusinessUnits.join(',')
    }
  };
}
