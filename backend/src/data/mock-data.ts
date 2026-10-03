import { encryptField } from '../security/encryption.js';

export interface SupplierRecord {
  id: string;
  name: string;
  category: string;
  geography: 'EMEA' | 'APAC' | 'AMER';
  businessUnit: 'EMEA' | 'APAC' | 'AMER';
  tier: 1 | 2 | 3;
  otifRate: number; // percentage e.g. 94.2
  avgLeadTimeDays: number;
  activeDelayDays: number;
  riskScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'AUDIT_PENDING' | 'AT_RISK';
  // Restricted fields (Tier 3)
  bank_details: string; // encrypted
  contract_pricing: string; // encrypted or restricted
  unit_cost: number;
  contactEmail: string;
  contactPhone: string;
}

export interface WarehouseRecord {
  id: string;
  name: string;
  geography: 'EMEA' | 'APAC' | 'AMER';
  businessUnit: 'EMEA' | 'APAC' | 'AMER';
  capacityUtilization: number; // e.g. 88%
  currentStockUnits: number;
  safetyStockDays: number;
  stockoutRisk: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface ProductRecord {
  id: string;
  sku: string;
  name: string;
  category: string;
  primarySupplierId: string;
  unitCostUSD: number;
  leadTimeVarianceDays: number;
  forecastAccuracy: number; // e.g. 92%
}

export interface ShipmentRecord {
  id: string;
  trackingNumber: string;
  supplierId: string;
  destinationWarehouseId: string;
  geography: 'EMEA' | 'APAC' | 'AMER';
  businessUnit: 'EMEA' | 'APAC' | 'AMER';
  carrier: string;
  units: number;
  status: 'IN_TRANSIT' | 'DELAYED' | 'DELIVERED' | 'CUSTOMS_HOLD';
  promisedDeliveryDate: string;
  estimatedDeliveryDate: string;
  delayDays: number;
  disruptionImpact: string;
}

export interface DisruptionAlert {
  id: string;
  timestamp: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  geography: 'EMEA' | 'APAC' | 'AMER';
  supplierId?: string;
  description: string;
  recommendedAction: string;
  potentialImpactUnits: number;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export const MOCK_SUPPLIERS: SupplierRecord[] = [
  {
    id: 'sup_foxconn_01',
    name: 'Foxconn Industrial EMEA',
    category: 'Electronics Assembly',
    geography: 'EMEA',
    businessUnit: 'EMEA',
    tier: 1,
    otifRate: 88.6,
    avgLeadTimeDays: 17.5,
    activeDelayDays: 5.2,
    riskScore: 78,
    riskLevel: 'HIGH',
    status: 'AT_RISK',
    bank_details: encryptField('IBAN DE89370400440532013000'),
    contract_pricing: encryptField('$14,250,000 Annual Frame Agreement'),
    unit_cost: 142.50,
    contactEmail: 'logistics@foxconn-emea.com',
    contactPhone: '+420 234 567 890'
  },
  {
    id: 'sup_tsmc_02',
    name: 'TSMC Semiconductor Foundry',
    category: 'Microcontrollers & ASIC',
    geography: 'APAC',
    businessUnit: 'APAC',
    tier: 1,
    otifRate: 98.4,
    avgLeadTimeDays: 24.0,
    activeDelayDays: 0.0,
    riskScore: 18,
    riskLevel: 'LOW',
    status: 'ACTIVE',
    bank_details: encryptField('IBAN TW09876543210987654321'),
    contract_pricing: encryptField('$42,800,000 Silicon Wafer Supply'),
    unit_cost: 320.00,
    contactEmail: 'orders@tsmc.com.tw',
    contactPhone: '+886 3 563 6688'
  },
  {
    id: 'sup_basf_03',
    name: 'BASF Chemical Synthetics',
    category: 'Industrial Polymers',
    geography: 'EMEA',
    businessUnit: 'EMEA',
    tier: 2,
    otifRate: 96.1,
    avgLeadTimeDays: 8.2,
    activeDelayDays: 1.1,
    riskScore: 24,
    riskLevel: 'LOW',
    status: 'ACTIVE',
    bank_details: encryptField('IBAN DE12500105170648489890'),
    contract_pricing: encryptField('$8,400,000 Polymeric Resin PO'),
    unit_cost: 45.20,
    contactEmail: 'supplychain@basf.de',
    contactPhone: '+49 621 60-0'
  },
  {
    id: 'sup_samsung_04',
    name: 'Samsung Memory Division',
    category: 'Flash Storage Modules',
    geography: 'APAC',
    businessUnit: 'APAC',
    tier: 1,
    otifRate: 91.8,
    avgLeadTimeDays: 14.2,
    activeDelayDays: 3.4,
    riskScore: 62,
    riskLevel: 'MEDIUM',
    status: 'ACTIVE',
    bank_details: encryptField('IBAN KR88123456789012345678'),
    contract_pricing: encryptField('$26,500,000 Storage Allocation'),
    unit_cost: 88.00,
    contactEmail: 'semi.export@samsung.com',
    contactPhone: '+82 2 2255 0114'
  },
  {
    id: 'sup_global_mech_05',
    name: 'Global Precision Mechanics',
    category: 'Chassis & Structural',
    geography: 'APAC',
    businessUnit: 'APAC',
    tier: 2,
    otifRate: 74.2,
    avgLeadTimeDays: 28.5,
    activeDelayDays: 7.8,
    riskScore: 89,
    riskLevel: 'CRITICAL',
    status: 'AT_RISK',
    bank_details: encryptField('IBAN VN55987654321234567890'),
    contract_pricing: encryptField('$5,200,000 Tooling & Machining'),
    unit_cost: 65.50,
    contactEmail: 'ops@globalprecision.vn',
    contactPhone: '+84 28 3823 4567'
  },
  {
    id: 'sup_maersk_06',
    name: 'Maersk Intermodal Freight',
    category: 'Maritime Logistics',
    geography: 'EMEA',
    businessUnit: 'EMEA',
    tier: 1,
    otifRate: 85.3,
    avgLeadTimeDays: 22.0,
    activeDelayDays: 6.1,
    riskScore: 76,
    riskLevel: 'HIGH',
    status: 'AT_RISK',
    bank_details: encryptField('IBAN DK44898765432109876543'),
    contract_pricing: encryptField('$18,900,000 Master Ocean Carrier'),
    unit_cost: 12.00,
    contactEmail: 'customercare@maersk.com',
    contactPhone: '+45 33 63 33 63'
  },
  {
    id: 'sup_dhl_07',
    name: 'DHL Express Supply Chain',
    category: 'Global Freight Forwarding',
    geography: 'AMER',
    businessUnit: 'AMER',
    tier: 1,
    otifRate: 97.4,
    avgLeadTimeDays: 4.5,
    activeDelayDays: 0.5,
    riskScore: 21,
    riskLevel: 'LOW',
    status: 'ACTIVE',
    bank_details: encryptField('IBAN US11CHAS0000000123456789'),
    contract_pricing: encryptField('$11,500,000 Air Freight SLA'),
    unit_cost: 35.00,
    contactEmail: 'enterprise@dhl.com',
    contactPhone: '+1 800 225 5345'
  }
];

export const MOCK_WAREHOUSES: WarehouseRecord[] = [
  {
    id: 'wh_rotterdam_01',
    name: 'Rotterdam EuroHub Fulfillment',
    geography: 'EMEA',
    businessUnit: 'EMEA',
    capacityUtilization: 88,
    currentStockUnits: 425000,
    safetyStockDays: 38,
    stockoutRisk: 'NORMAL'
  },
  {
    id: 'wh_frankfurt_02',
    name: 'Frankfurt Cargo Distribution',
    geography: 'EMEA',
    businessUnit: 'EMEA',
    capacityUtilization: 64,
    currentStockUnits: 210000,
    safetyStockDays: 28,
    stockoutRisk: 'NORMAL'
  },
  {
    id: 'wh_singapore_03',
    name: 'Singapore Pacific Port Warehouse',
    geography: 'APAC',
    businessUnit: 'APAC',
    capacityUtilization: 94,
    currentStockUnits: 88000,
    safetyStockDays: 11, // Critical safety stock low
    stockoutRisk: 'CRITICAL'
  },
  {
    id: 'wh_chicago_04',
    name: 'Chicago Inland Mega-Hub',
    geography: 'AMER',
    businessUnit: 'AMER',
    capacityUtilization: 72,
    currentStockUnits: 340000,
    safetyStockDays: 42,
    stockoutRisk: 'NORMAL'
  }
];

export const MOCK_SHIPMENTS: ShipmentRecord[] = [
  {
    id: 'shp_2026_01',
    trackingNumber: 'MSK-99281-EU',
    supplierId: 'sup_foxconn_01',
    destinationWarehouseId: 'wh_rotterdam_01',
    geography: 'EMEA',
    businessUnit: 'EMEA',
    carrier: 'Maersk Intermodal',
    units: 14500,
    status: 'DELAYED',
    promisedDeliveryDate: '2026-09-28',
    estimatedDeliveryDate: '2026-10-05',
    delayDays: 7.0,
    disruptionImpact: '200 assembly units short on line 3 by Friday'
  },
  {
    id: 'shp_2026_02',
    trackingNumber: 'TSM-11029-AS',
    supplierId: 'sup_tsmc_02',
    destinationWarehouseId: 'wh_frankfurt_02',
    geography: 'EMEA',
    businessUnit: 'EMEA',
    carrier: 'DHL Express',
    units: 50000,
    status: 'IN_TRANSIT',
    promisedDeliveryDate: '2026-10-06',
    estimatedDeliveryDate: '2026-10-06',
    delayDays: 0.0,
    disruptionImpact: 'On track, zero downstream bottleneck'
  },
  {
    id: 'shp_2026_03',
    trackingNumber: 'GPM-88123-VN',
    supplierId: 'sup_global_mech_05',
    destinationWarehouseId: 'wh_singapore_03',
    geography: 'APAC',
    businessUnit: 'APAC',
    carrier: 'Regional Maritime Feeder',
    units: 8200,
    status: 'DELAYED',
    promisedDeliveryDate: '2026-09-26',
    estimatedDeliveryDate: '2026-10-04',
    delayDays: 8.0,
    disruptionImpact: 'Triggered safety stock breach at Singapore hub'
  },
  {
    id: 'shp_2026_04',
    trackingNumber: 'BSF-44012-DE',
    supplierId: 'sup_basf_03',
    destinationWarehouseId: 'wh_rotterdam_01',
    geography: 'EMEA',
    businessUnit: 'EMEA',
    carrier: 'Deutsche Bahn Freight',
    units: 24000,
    status: 'DELIVERED',
    promisedDeliveryDate: '2026-10-02',
    estimatedDeliveryDate: '2026-10-02',
    delayDays: 0.0,
    disruptionImpact: 'Delivered in full, inventory replenished'
  }
];

export const MOCK_DISRUPTIONS: DisruptionAlert[] = [
  {
    id: 'alt_disrupt_001',
    timestamp: '2026-10-03T18:30:00Z',
    title: 'Critical Delivery Bottleneck: Foxconn Industrial EMEA',
    severity: 'CRITICAL',
    geography: 'EMEA',
    supplierId: 'sup_foxconn_01',
    description: 'Shipment MSK-99281-EU delayed by 7.0 days due to maritime carrier congestion. Projected deficit of 200 units by Friday.',
    recommendedAction: 'Trigger expedited air freight allocation from alternative supplier or draw safety stock from Frankfurt hub.',
    potentialImpactUnits: 14500,
    status: 'ACTIVE'
  },
  {
    id: 'alt_disrupt_002',
    timestamp: '2026-10-03T14:15:00Z',
    title: 'Singapore Hub Safety Stock Breach (11 Days Remaining)',
    severity: 'WARNING',
    geography: 'APAC',
    description: 'Inventory at Singapore Pacific Port has dropped below the 15-day safety threshold due to Global Precision Mechanics shipment delays.',
    recommendedAction: 'Initiate emergency inter-warehouse transfer of 20,000 units from Rotterdam EuroHub.',
    potentialImpactUnits: 8200,
    status: 'ACTIVE'
  },
  {
    id: 'alt_disrupt_003',
    timestamp: '2026-10-02T09:00:00Z',
    title: 'Ocean Freight Rate Spike (+14.2% on Trans-Pacific Lane)',
    severity: 'INFO',
    geography: 'APAC',
    description: 'Carrier spot rates increased following seasonal capacity tightening. COGS impact estimated at +$0.85/unit.',
    recommendedAction: 'Lock in volume tier allocations under existing long-term charter contracts.',
    potentialImpactUnits: 45000,
    status: 'ACKNOWLEDGED'
  }
];
