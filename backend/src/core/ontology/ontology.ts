export interface OntologyConcept {
  id: string;
  name: string;
  uri: string;
  description: string;
  classificationTier: 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED';
  attributes: Array<{ name: string; type: string; tier: 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED'; description: string }>;
  relationships: Array<{ predicate: string; targetConcept: string; cardinality: string }>;
}

export const SUPPLY_CHAIN_ONTOLOGY: Record<string, OntologyConcept> = {
  Supplier: {
    id: 'ont_supplier',
    name: 'Supplier',
    uri: 'http://provenance.io/ontology#Supplier',
    description: 'External commercial vendor or manufacturing contractor producing raw materials, subassemblies, or finished goods.',
    classificationTier: 'CONFIDENTIAL',
    attributes: [
      { name: 'name', type: 'string', tier: 'PUBLIC', description: 'Legal entity name' },
      { name: 'geography', type: 'string', tier: 'PUBLIC', description: 'Operating region (EMEA, APAC, AMER)' },
      { name: 'otifRate', type: 'number', tier: 'CONFIDENTIAL', description: 'On-time delivery performance' },
      { name: 'bank_details', type: 'string', tier: 'RESTRICTED', description: 'Settlement bank routing and account' },
      { name: 'contract_pricing', type: 'string', tier: 'RESTRICTED', description: 'Master purchase agreement commercial terms' }
    ],
    relationships: [
      { predicate: 'supplies', targetConcept: 'Product', cardinality: '1..N' },
      { predicate: 'governedBy', targetConcept: 'Contract', cardinality: '1..N' },
      { predicate: 'exposes', targetConcept: 'RiskFactor', cardinality: '0..N' }
    ]
  },
  Product: {
    id: 'ont_product',
    name: 'Product Component',
    uri: 'http://provenance.io/ontology#Product',
    description: 'BOM item, raw material or finished assembly managed within company inventory.',
    classificationTier: 'PUBLIC',
    attributes: [
      { name: 'sku', type: 'string', tier: 'PUBLIC', description: 'Stock keeping unit identifier' },
      { name: 'category', type: 'string', tier: 'PUBLIC', description: 'Component classification category' },
      { name: 'unitCost', type: 'number', tier: 'RESTRICTED', description: 'Standard bill-of-materials cost' }
    ],
    relationships: [
      { predicate: 'suppliedBy', targetConcept: 'Supplier', cardinality: '1..N' },
      { predicate: 'storedAt', targetConcept: 'Warehouse', cardinality: '1..N' }
    ]
  },
  Warehouse: {
    id: 'ont_warehouse',
    name: 'Warehouse Facility',
    uri: 'http://provenance.io/ontology#Warehouse',
    description: 'Physical storage facility, regional distribution center, or intermodal freight transit hub.',
    classificationTier: 'CONFIDENTIAL',
    attributes: [
      { name: 'name', type: 'string', tier: 'PUBLIC', description: 'Hub identification title' },
      { name: 'capacityUtilization', type: 'number', tier: 'CONFIDENTIAL', description: 'Occupied pallet percentage' },
      { name: 'safetyStockDays', type: 'number', tier: 'CONFIDENTIAL', description: 'Buffer inventory days on hand' }
    ],
    relationships: [
      { predicate: 'stores', targetConcept: 'Product', cardinality: '1..N' },
      { predicate: 'receives', targetConcept: 'Shipment', cardinality: '0..N' }
    ]
  },
  Shipment: {
    id: 'ont_shipment',
    name: 'Freight Shipment',
    uri: 'http://provenance.io/ontology#Shipment',
    description: 'Active freight in-transit movement between vendor premises and distribution warehouses.',
    classificationTier: 'CONFIDENTIAL',
    attributes: [
      { name: 'trackingNumber', type: 'string', tier: 'CONFIDENTIAL', description: 'Master bill of lading or AWB' },
      { name: 'carrier', type: 'string', tier: 'PUBLIC', description: 'Logistics provider' },
      { name: 'delayDays', type: 'number', tier: 'CONFIDENTIAL', description: 'Deviation from promised ETA' }
    ],
    relationships: [
      { predicate: 'originatesFrom', targetConcept: 'Supplier', cardinality: '1..1' },
      { predicate: 'destinedFor', targetConcept: 'Warehouse', cardinality: '1..1' },
      { predicate: 'carries', targetConcept: 'Product', cardinality: '1..N' }
    ]
  },
  RiskFactor: {
    id: 'ont_risk',
    name: 'Supply Chain Risk Factor',
    uri: 'http://provenance.io/ontology#RiskFactor',
    description: 'Operational, geopolitical, weather, or financial risk impacting continuity.',
    classificationTier: 'RESTRICTED',
    attributes: [
      { name: 'riskScore', type: 'number', tier: 'RESTRICTED', description: '0 to 100 quantified vulnerability score' },
      { name: 'category', type: 'string', tier: 'RESTRICTED', description: 'Disruption driver' }
    ],
    relationships: [
      { predicate: 'affects', targetConcept: 'Supplier', cardinality: '1..N' }
    ]
  }
};
