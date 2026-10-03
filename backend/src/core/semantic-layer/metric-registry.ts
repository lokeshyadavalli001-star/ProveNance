export interface MetricDefinition {
  id: string;
  name: string;
  code: string;
  category: 'DELIVERY' | 'INVENTORY' | 'SUPPLIER_RISK' | 'FINANCIAL' | 'RESILIENCE';
  description: string;
  formula: string;
  sqlTemplate: string;
  owner: string;
  version: string;
  classificationTier: 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED';
  unit: string;
  targetBenchmark: string;
  lastUpdated: string;
}

export const METRIC_REGISTRY: Record<string, MetricDefinition> = {
  OTIF: {
    id: 'met_otif_001',
    name: 'On-Time In-Full Rate',
    code: 'OTIF',
    category: 'DELIVERY',
    description: 'Percentage of purchase orders delivered on or before the committed delivery date and meeting 100% quantity specifications.',
    formula: '(Count(Orders Delivered <= PromisedDate AND QuantityDelivered >= QuantityOrdered) / TotalOrders) * 100',
    sqlTemplate: 'SELECT (COUNT(CASE WHEN delay_days <= 0 THEN 1 END) * 100.0 / COUNT(*)) AS otif_rate FROM shipments WHERE business_unit IN (:authorizedUnits)',
    owner: 'Global Supply Chain Analytics Council',
    version: '3.2.0',
    classificationTier: 'CONFIDENTIAL',
    unit: '%',
    targetBenchmark: '>= 95.0%',
    lastUpdated: '2026-09-15 00:00:00 UTC'
  },
  AVG_LEAD_TIME: {
    id: 'met_leadtime_002',
    name: 'Average Supplier Lead Time',
    code: 'AVG_LEAD_TIME',
    category: 'DELIVERY',
    description: 'Mean duration in days from official Purchase Order confirmation to receipt and scan-in at destination warehouse.',
    formula: 'AVG(ActualReceiptDate - PurchaseOrderDate)',
    sqlTemplate: 'SELECT supplier_id, AVG(avg_lead_time_days) AS avg_lead_time FROM suppliers WHERE business_unit IN (:authorizedUnits) GROUP BY supplier_id',
    owner: 'Logistics Operations Board',
    version: '2.1.0',
    classificationTier: 'CONFIDENTIAL',
    unit: 'days',
    targetBenchmark: '<= 14.0 days',
    lastUpdated: '2026-09-01 00:00:00 UTC'
  },
  STOCKOUT_RISK: {
    id: 'met_stockout_003',
    name: 'Stockout Risk Exposure Index',
    code: 'STOCKOUT_RISK',
    category: 'INVENTORY',
    description: 'Probabilistic forecast evaluating probability that customer demand exceeds on-hand plus pipeline in-transit inventory within 30 days.',
    formula: 'P(Demand30D > (OnHandInventory + PipelineInTransit - SafetyStockBuffer))',
    sqlTemplate: 'SELECT warehouse_id, current_stock_units, safety_stock_days FROM warehouses WHERE business_unit IN (:authorizedUnits)',
    owner: 'Demand Sensing & Inventory Optimization',
    version: '4.0.1',
    classificationTier: 'CONFIDENTIAL',
    unit: 'ratio',
    targetBenchmark: '< 0.05',
    lastUpdated: '2026-09-20 00:00:00 UTC'
  },
  SUPPLIER_HEALTH: {
    id: 'met_health_004',
    name: 'Composite Supplier Health Score',
    code: 'SUPPLIER_HEALTH',
    category: 'SUPPLIER_RISK',
    description: 'Multi-factor health index synthesizing delivery adherence (40%), quality yield (30%), and financial solvency stability (30%).',
    formula: '(OTIF * 0.40) + (QualityYieldRate * 0.30) + (FinancialSolvencyIndex * 0.30)',
    sqlTemplate: 'SELECT supplier_id, (otif_rate * 0.40 + (100 - risk_score) * 0.60) AS health_score FROM suppliers WHERE business_unit IN (:authorizedUnits)',
    owner: 'Strategic Procurement Committee',
    version: '1.5.0',
    classificationTier: 'RESTRICTED',
    unit: 'score (0-100)',
    targetBenchmark: '>= 85.0',
    lastUpdated: '2026-08-30 00:00:00 UTC'
  },
  DISRUPTION_EXPOSURE: {
    id: 'met_disrupt_005',
    name: 'Single-Point-of-Failure Disruption Vulnerability',
    code: 'DISRUPTION_EXPOSURE',
    category: 'RESILIENCE',
    description: 'Knowledge graph dependency centrality weighted by supplier tier and lack of pre-qualified second-source alternatives.',
    formula: 'GraphDependencyCentrality * (1 - SecondarySupplierReadiness)',
    sqlTemplate: 'SPARQL: SELECT ?supplier ?dependencyWeight WHERE { ?supplier sc:supplies ?part . ?part sc:hasCriticality "HIGH" }',
    owner: 'Enterprise Business Continuity Governance',
    version: '2.0.0',
    classificationTier: 'RESTRICTED',
    unit: 'index (0-1.0)',
    targetBenchmark: '< 0.25',
    lastUpdated: '2026-09-10 00:00:00 UTC'
  }
};

export function getApprovedMetric(code: string): MetricDefinition | undefined {
  return METRIC_REGISTRY[code.toUpperCase()];
}

export function getAllMetrics(): MetricDefinition[] {
  return Object.values(METRIC_REGISTRY);
}
