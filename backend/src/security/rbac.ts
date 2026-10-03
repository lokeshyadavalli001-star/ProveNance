export type UserRole = 'ADMIN' | 'DATA_STEWARD' | 'ANALYST' | 'OPERATOR' | 'VIEWER' | 'API_SERVICE';

export type UserAction =
  | 'query:sql'
  | 'query:sparql'
  | 'query:ml'
  | 'simulate'
  | 'approve_action'
  | 'audit_log_read'
  | 'admin:keys'
  | 'admin:policies'
  | 'ontology:edit';

export const ROLE_PERMISSIONS: Record<UserRole, UserAction[]> = {
  ADMIN: [
    'query:sql',
    'query:sparql',
    'query:ml',
    'simulate',
    'approve_action',
    'audit_log_read',
    'admin:keys',
    'admin:policies',
    'ontology:edit'
  ],
  DATA_STEWARD: [
    'query:sql',
    'query:sparql',
    'query:ml',
    'simulate',
    'audit_log_read',
    'ontology:edit'
  ],
  ANALYST: [
    'query:sql',
    'query:sparql',
    'query:ml',
    'simulate',
    'audit_log_read'
  ],
  OPERATOR: [
    'query:sql',
    'approve_action'
  ],
  VIEWER: [
    'query:sql'
  ],
  API_SERVICE: [
    'query:sql',
    'query:ml'
  ]
};

/**
 * Column-Level Security (CLS) Definitions
 * Columns categorized into security tiers
 */
export const RESTRICTED_COLUMNS: Record<string, UserRole[]> = {
  bank_details: ['ADMIN'],
  contract_pricing: ['ADMIN', 'DATA_STEWARD'],
  unit_cost: ['ADMIN', 'DATA_STEWARD'],
  customer_pii: ['ADMIN'],
  customer_phone: ['ADMIN'],
  customer_ssn: ['ADMIN'],
  financial_exposure: ['ADMIN', 'DATA_STEWARD', 'ANALYST']
};

/**
 * Check if a role has permission for a specific action
 */
export function hasPermission(role: UserRole, action: UserAction): boolean {
  const allowedActions = ROLE_PERMISSIONS[role] || [];
  return allowedActions.includes(action);
}

/**
 * Filter columns based on user role (Column-Level Security)
 */
export function applyColumnSecurity(row: Record<string, any>, userRole: UserRole): { sanitizedRow: Record<string, any>; filteredColumns: string[] } {
  const sanitizedRow: Record<string, any> = { ...row };
  const filteredColumns: string[] = [];

  for (const [colName, allowedRoles] of Object.entries(RESTRICTED_COLUMNS)) {
    if (colName in sanitizedRow) {
      if (!allowedRoles.includes(userRole)) {
        delete sanitizedRow[colName];
        filteredColumns.push(colName);
      }
    }
  }

  return { sanitizedRow, filteredColumns };
}
