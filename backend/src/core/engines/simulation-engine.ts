import crypto from 'crypto';
import { auditService } from '../../security/audit-logger.js';
import { verifySignature } from '../../security/hmac.js';

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

export const PRESET_SCENARIOS: SimulationScenario[] = [
  {
    id: 'scen_suez_chokepoint',
    name: 'Maritime Chokepoint Transit Delay (+12 Days)',
    description: 'Simulates a 12-day maritime shipping delay affecting Far East to Europe ocean freight vessels transiting through the Red Sea / Suez corridor.',
    parameterChanges: {
      carrierDelayDelta: '+12.0 days',
      bunkerFuelSurcharge: '+18.5%',
      affectedRoutes: ['APAC -> EMEA']
    },
    baselineMetrics: {
      otifRate: 94.2,
      avgLeadTimeDays: 14.5,
      estimatedCostUSD: 12500000,
      stockoutRiskProbability: 0.08
    },
    simulatedMetrics: {
      otifRate: 86.1,
      avgLeadTimeDays: 26.5,
      estimatedCostUSD: 14850000,
      stockoutRiskProbability: 0.42
    },
    projectedStarvationDate: '2026-10-18',
    recommendedMitigation: 'Reroute 35,000 high-priority microcontroller units to chartered DHL air freight and draw down 40% safety stock at Frankfurt Cargo Center.',
    approvalRequired: true,
    approvalStatus: 'PENDING'
  },
  {
    id: 'scen_foxconn_escalation',
    name: 'Foxconn Industrial Assembly Line Stoppage (7 Days)',
    description: 'Models a 7-day complete production pause at Foxconn Czechia assembly plant due to unexpected tooling re-calibration.',
    parameterChanges: {
      supplierCapacityDelta: '-100% for 7 days',
      dailyDeficitUnits: 2500
    },
    baselineMetrics: {
      otifRate: 94.2,
      avgLeadTimeDays: 14.5,
      estimatedCostUSD: 12500000,
      stockoutRiskProbability: 0.08
    },
    simulatedMetrics: {
      otifRate: 88.4,
      avgLeadTimeDays: 21.0,
      estimatedCostUSD: 13700000,
      stockoutRiskProbability: 0.35
    },
    projectedStarvationDate: '2026-10-14',
    recommendedMitigation: 'Split production batch across secondary contractor and accelerate Rotterdam warehouse safety buffer injection.',
    approvalRequired: true,
    approvalStatus: 'PENDING'
  }
];

class SimulationEngine {
  private scenarios: Map<string, SimulationScenario> = new Map();

  constructor() {
    for (const scen of PRESET_SCENARIOS) {
      this.scenarios.set(scen.id, { ...scen });
    }
  }

  public getScenarios(): SimulationScenario[] {
    return Array.from(this.scenarios.values());
  }

  public getScenario(id: string): SimulationScenario | undefined {
    return this.scenarios.get(id);
  }

  /**
   * Run a custom what-if scenario parameter simulation
   */
  public runSimulation(params: {
    name: string;
    delayDaysDelta: number;
    costMultiplier: number;
    geography: string;
  }): SimulationScenario {
    const id = `scen_custom_${crypto.randomUUID().slice(0, 6)}`;
    const baselineOtif = 94.2;
    const simulatedOtif = Math.max(60, +(baselineOtif - params.delayDaysDelta * 0.95).toFixed(1));
    const simulatedCost = Math.round(12500000 * params.costMultiplier);
    const stockoutProb = Math.min(0.95, +(0.08 + params.delayDaysDelta * 0.04).toFixed(2));

    const scenario: SimulationScenario = {
      id,
      name: params.name || 'Ad-Hoc Monte Carlo Disruption Scenario',
      description: `Custom simulation evaluating a ${params.delayDaysDelta} day delay shift in ${params.geography} with a ${(params.costMultiplier * 100 - 100).toFixed(0)}% cost variance.`,
      parameterChanges: {
        delayDaysDelta: `+${params.delayDaysDelta} days`,
        costMultiplier: `${params.costMultiplier}x`,
        geography: params.geography
      },
      baselineMetrics: {
        otifRate: 94.2,
        avgLeadTimeDays: 14.5,
        estimatedCostUSD: 12500000,
        stockoutRiskProbability: 0.08
      },
      simulatedMetrics: {
        otifRate: simulatedOtif,
        avgLeadTimeDays: +(14.5 + params.delayDaysDelta).toFixed(1),
        estimatedCostUSD: simulatedCost,
        stockoutRiskProbability: stockoutProb
      },
      projectedStarvationDate: new Date(Date.now() + Math.max(5, 30 - params.delayDaysDelta) * 86400000).toISOString().split('T')[0],
      recommendedMitigation: `Deploy safety buffer rebalancing and issue contingent supplier purchase orders in ${params.geography}.`,
      approvalRequired: true,
      approvalStatus: 'PENDING'
    };

    this.scenarios.set(id, scenario);
    return scenario;
  }

  /**
   * Approve a simulation mitigation action with HMAC signature verification
   */
  public approveMitigation(
    scenarioId: string,
    approverEmail: string,
    signature: string,
    timestamp: number
  ): { success: boolean; scenario?: SimulationScenario; error?: string } {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) {
      return { success: false, error: 'Scenario not found' };
    }

    // Verify HMAC-SHA256 signature to guarantee non-repudiation
    const verification = verifySignature({ scenarioId, approverEmail }, signature, timestamp);
    if (!verification.isValid) {
      auditService.record({
        userEmail: approverEmail,
        action: 'SIMULATION_APPROVAL_FAILED_INVALID_SIGNATURE',
        category: 'SECURITY',
        severity: 'CRITICAL',
        details: { scenarioId, reason: verification.reason }
      });
      return { success: false, error: `HMAC Signature verification failed: ${verification.reason}` };
    }

    scenario.approvalStatus = 'APPROVED';
    scenario.approvedBy = approverEmail;
    scenario.approvalTimestamp = new Date().toISOString();

    auditService.record({
      userEmail: approverEmail,
      action: 'SIMULATION_MITIGATION_APPROVED_WITH_HMAC',
      category: 'SIMULATION',
      severity: 'INFO',
      details: {
        scenarioId,
        scenarioName: scenario.name,
        approverEmail,
        signature: signature.slice(0, 16) + '...'
      }
    });

    return { success: true, scenario };
  }
}

export const simulationEngine = new SimulationEngine();
