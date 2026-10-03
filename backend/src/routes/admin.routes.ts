import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { ROLE_PERMISSIONS, RESTRICTED_COLUMNS } from '../security/rbac.js';
import { auditService } from '../security/audit-logger.js';

const router = Router();

interface ApiKeyRecord {
  id: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  scopes: string[];
  createdAt: string;
  expiresAt: string;
  revokedAt?: string;
}

const apiKeysStore: ApiKeyRecord[] = [
  {
    id: 'key_prod_erp_sync',
    name: 'SAP S/4HANA ERP Ingestion Pipe',
    keyPrefix: 'prov_live_9a8b',
    keyHash: crypto.createHash('sha256').update('prov_live_9a8b_secret_key_mock').digest('hex'),
    scopes: ['query:sql', 'write:ingest'],
    createdAt: '2026-08-01T00:00:00Z',
    expiresAt: '2027-08-01T00:00:00Z'
  },
  {
    id: 'key_prod_tms_feed',
    name: 'BlueYonder EDI 214 Freight Ingest',
    keyPrefix: 'prov_live_44f1',
    keyHash: crypto.createHash('sha256').update('prov_live_44f1_secret_key_mock').digest('hex'),
    scopes: ['query:sql', 'write:ingest'],
    createdAt: '2026-09-01T00:00:00Z',
    expiresAt: '2027-09-01T00:00:00Z'
  }
];

/**
 * GET /api/v1/admin/roles - Return RBAC matrix and column security rules
 */
router.get('/roles', (req: Request, res: Response) => {
  return res.json({
    rolePermissions: ROLE_PERMISSIONS,
    restrictedColumns: RESTRICTED_COLUMNS
  });
});

/**
 * GET /api/v1/admin/api-keys - List API keys
 */
router.get('/api-keys', (req: Request, res: Response) => {
  return res.json({ apiKeys: apiKeysStore });
});

/**
 * POST /api/v1/admin/api-keys - Create API key
 */
router.post('/api-keys', (req: Request, res: Response) => {
  const { name, scopes } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Key name is required' });
  }

  const rawKeySecret = `prov_live_${crypto.randomBytes(16).toString('hex')}`;
  const keyPrefix = rawKeySecret.slice(0, 14);
  const keyHash = crypto.createHash('sha256').update(rawKeySecret).digest('hex');

  const newKey: ApiKeyRecord = {
    id: `key_${crypto.randomUUID().slice(0, 8)}`,
    name,
    keyPrefix,
    keyHash,
    scopes: scopes || ['query:sql'],
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 90 * 86400000).toISOString() // 90 days default
  };

  apiKeysStore.push(newKey);

  auditService.record({
    action: 'CREATE_API_KEY',
    category: 'SECURITY',
    severity: 'INFO',
    details: { keyId: newKey.id, name, scopes: newKey.scopes }
  });

  return res.json({
    message: 'API key created successfully. Store this secret key now; it will never be displayed again.',
    apiKey: rawKeySecret,
    record: newKey
  });
});

/**
 * POST /api/v1/admin/api-keys/:id/revoke - Revoke API key
 */
router.post('/api-keys/:id/revoke', (req: Request, res: Response) => {
  const key = apiKeysStore.find(k => k.id === req.params.id);
  if (!key) {
    return res.status(404).json({ error: 'API key not found' });
  }

  key.revokedAt = new Date().toISOString();

  auditService.record({
    action: 'REVOKE_API_KEY',
    category: 'SECURITY',
    severity: 'WARN',
    details: { keyId: key.id, name: key.name }
  });

  return res.json({ success: true, key });
});

export default router;
