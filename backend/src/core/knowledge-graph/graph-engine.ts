import { MOCK_SUPPLIERS, MOCK_WAREHOUSES, MOCK_SHIPMENTS } from '../../data/mock-data.js';

export interface GraphNode {
  id: string;
  label: string;
  type: 'Supplier' | 'Warehouse' | 'Product' | 'Shipment' | 'RiskFactor';
  geography: string;
  tier: 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED';
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
  weight?: number;
  provenance: {
    sourceSystem: string;
    verifiedAt: string;
  };
}

class KnowledgeGraphEngine {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];

  constructor() {
    this.buildGraph();
  }

  private buildGraph() {
    // 1. Add Supplier Nodes
    for (const sup of MOCK_SUPPLIERS) {
      this.nodes.set(sup.id, {
        id: sup.id,
        label: sup.name,
        type: 'Supplier',
        geography: sup.geography,
        tier: 'CONFIDENTIAL',
        properties: {
          category: sup.category,
          tier: sup.tier,
          otifRate: sup.otifRate,
          riskScore: sup.riskScore,
          activeDelayDays: sup.activeDelayDays
        },
        provenance: {
          sourceSystem: 'SAP S/4HANA Strategic Sourcing',
          lastSyncTimestamp: '2026-10-03T18:00:00Z',
          confidenceScore: 0.99,
          recordOwner: 'Global Procurement Data Steward'
        }
      });
    }

    // 2. Add Warehouse Nodes
    for (const wh of MOCK_WAREHOUSES) {
      this.nodes.set(wh.id, {
        id: wh.id,
        label: wh.name,
        type: 'Warehouse',
        geography: wh.geography,
        tier: 'CONFIDENTIAL',
        properties: {
          capacityUtilization: wh.capacityUtilization,
          currentStockUnits: wh.currentStockUnits,
          safetyStockDays: wh.safetyStockDays,
          stockoutRisk: wh.stockoutRisk
        },
        provenance: {
          sourceSystem: 'Oracle Fusion Cloud WMS',
          lastSyncTimestamp: '2026-10-03T18:15:00Z',
          confidenceScore: 0.98,
          recordOwner: 'Warehouse Operations Command'
        }
      });
    }

    // 3. Add Key Products
    const products = [
      { id: 'prd_mcu_01', name: 'Microcontroller MCU-8088', supId: 'sup_tsmc_02', whId: 'wh_frankfurt_02', geo: 'EMEA' },
      { id: 'prd_batt_02', name: 'Lithium Battery Module 850Wh', supId: 'sup_foxconn_01', whId: 'wh_rotterdam_01', geo: 'EMEA' },
      { id: 'prd_poly_03', name: 'Polymer Synthetic Resin B-2', supId: 'sup_basf_03', whId: 'wh_rotterdam_01', geo: 'EMEA' },
      { id: 'prd_mech_04', name: 'Precision Aluminum Chassis', supId: 'sup_global_mech_05', whId: 'wh_singapore_03', geo: 'APAC' }
    ];

    for (const p of products) {
      this.nodes.set(p.id, {
        id: p.id,
        label: p.name,
        type: 'Product',
        geography: p.geo,
        tier: 'PUBLIC',
        properties: { sku: p.id.toUpperCase() },
        provenance: {
          sourceSystem: 'Teamcenter PLM Master BOM',
          lastSyncTimestamp: '2026-10-03T12:00:00Z',
          confidenceScore: 1.0,
          recordOwner: 'Engineering Systems Lead'
        }
      });

      // Edge: Supplier -> supplies -> Product
      this.edges.push({
        id: `e_${p.supId}_${p.id}`,
        source: p.supId,
        target: p.id,
        predicate: 'supplies',
        provenance: { sourceSystem: 'SAP Purchase Contract', verifiedAt: '2026-10-03T12:00:00Z' }
      });

      // Edge: Product -> storedAt -> Warehouse
      this.edges.push({
        id: `e_${p.id}_${p.whId}`,
        source: p.id,
        target: p.whId,
        predicate: 'storedAt',
        provenance: { sourceSystem: 'Oracle WMS Inventory Ledger', verifiedAt: '2026-10-03T12:00:00Z' }
      });
    }

    // 4. Add Shipments
    for (const shp of MOCK_SHIPMENTS) {
      this.nodes.set(shp.id, {
        id: shp.id,
        label: `Shipment ${shp.trackingNumber}`,
        type: 'Shipment',
        geography: shp.geography,
        tier: 'CONFIDENTIAL',
        properties: {
          carrier: shp.carrier,
          units: shp.units,
          status: shp.status,
          delayDays: shp.delayDays
        },
        provenance: {
          sourceSystem: 'BlueYonder Transportation Management (TMS)',
          lastSyncTimestamp: '2026-10-03T18:30:00Z',
          confidenceScore: 0.97,
          recordOwner: 'Global Freight Forwarding Desk'
        }
      });

      // Edge: Supplier -> ships -> Shipment
      this.edges.push({
        id: `e_${shp.supplierId}_${shp.id}`,
        source: shp.supplierId,
        target: shp.id,
        predicate: 'originatesShipment',
        provenance: { sourceSystem: 'TMS EDI 214 Carrier Status', verifiedAt: '2026-10-03T18:30:00Z' }
      });

      // Edge: Shipment -> deliversTo -> Warehouse
      this.edges.push({
        id: `e_${shp.id}_${shp.destinationWarehouseId}`,
        source: shp.id,
        target: shp.destinationWarehouseId,
        predicate: 'deliversTo',
        provenance: { sourceSystem: 'TMS ASN Record', verifiedAt: '2026-10-03T18:30:00Z' }
      });
    }
  }

  public getFullGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges
    };
  }

  /**
   * Traverses disruption ripple effects for a supplier or warehouse
   */
  public traceDisruptionRipple(entityId: string): {
    origin: GraphNode | undefined;
    affectedShipments: GraphNode[];
    affectedWarehouses: GraphNode[];
    downstreamExposureSummary: string;
  } {
    const origin = this.nodes.get(entityId);
    if (!origin) {
      return {
        origin: undefined,
        affectedShipments: [],
        affectedWarehouses: [],
        downstreamExposureSummary: 'Entity not found in knowledge graph'
      };
    }

    const affectedShipments: GraphNode[] = [];
    const affectedWarehouseIds = new Set<string>();

    for (const edge of this.edges) {
      if (edge.source === entityId && edge.predicate === 'originatesShipment') {
        const shpNode = this.nodes.get(edge.target);
        if (shpNode) affectedShipments.push(shpNode);
      }
    }

    for (const shp of affectedShipments) {
      for (const edge of this.edges) {
        if (edge.source === shp.id && edge.predicate === 'deliversTo') {
          affectedWarehouseIds.add(edge.target);
        }
      }
    }

    const affectedWarehouses: GraphNode[] = [];
    for (const whId of affectedWarehouseIds) {
      const whNode = this.nodes.get(whId);
      if (whNode) affectedWarehouses.push(whNode);
    }

    return {
      origin,
      affectedShipments,
      affectedWarehouses,
      downstreamExposureSummary: `Disruption at ${origin.label} propagates across ${affectedShipments.length} active in-transit shipments directly impacting ${affectedWarehouses.length} regional distribution warehouses.`
    };
  }
}

export const knowledgeGraph = new KnowledgeGraphEngine();
