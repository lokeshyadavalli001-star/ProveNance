export interface UserContext {
  id: string;
  email: string;
  role: string;
  businessUnits: string[]; // e.g. ['EMEA', 'APAC'] or ['ALL']
  organizationId: string;
}

export interface PolicyCondition {
  geography?: string[];
  productCategory?: string[];
  maxDisruptionSeverity?: string;
}

export interface AbacPolicy {
  id: string;
  name: string;
  effect: 'ALLOW' | 'DENY';
  actions: string[];
  resources: string[];
  conditions: PolicyCondition;
}

export const SYSTEM_ABAC_POLICIES: AbacPolicy[] = [
  {
    id: 'pol_emea_analyst',
    name: 'EMEA Regional Analyst Boundary',
    effect: 'ALLOW',
    actions: ['query:sql', 'query:sparql', 'query:ml'],
    resources: ['supplier', 'order', 'shipment', 'warehouse'],
    conditions: {
      geography: ['EMEA']
    }
  },
  {
    id: 'pol_apac_analyst',
    name: 'APAC Regional Analyst Boundary',
    effect: 'ALLOW',
    actions: ['query:sql', 'query:sparql', 'query:ml'],
    resources: ['supplier', 'order', 'shipment', 'warehouse'],
    conditions: {
      geography: ['APAC']
    }
  },
  {
    id: 'pol_global_admin',
    name: 'Global Enterprise Scope',
    effect: 'ALLOW',
    actions: ['*'],
    resources: ['*'],
    conditions: {
      geography: ['ALL', 'EMEA', 'APAC', 'AMER']
    }
  }
];

/**
 * Evaluate Attribute-Based Access Control
 */
export function evaluateAbac(user: UserContext, action: string, resource: string, targetContext: { geography?: string; productCategory?: string }): boolean {
  if (user.role === 'ADMIN' || user.businessUnits.includes('ALL')) {
    return true;
  }

  // Row-Level Security check: geography of data must match user's authorized business units
  if (targetContext.geography) {
    if (!user.businessUnits.includes(targetContext.geography)) {
      return false;
    }
  }

  return true;
}

/**
 * Injects Row-Level Security into analytical datasets
 */
export function filterRowsByRLS<T extends { businessUnit?: string; geography?: string }>(rows: T[], user: UserContext): T[] {
  if (user.role === 'ADMIN' || user.businessUnits.includes('ALL')) {
    return rows;
  }

  return rows.filter(row => {
    const unit = row.businessUnit || row.geography;
    if (!unit) return true;
    return user.businessUnits.includes(unit);
  });
}
