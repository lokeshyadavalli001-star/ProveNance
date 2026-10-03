import { Router, Request, Response } from 'express';
import { auditService } from '../security/audit-logger.js';

const router = Router();

/**
 * GET /api/v1/audit/records - Retrieve recent audit records
 */
router.get('/records', (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 50;
  const records = auditService.getRecords(limit);
  return res.json({ records, total: records.length });
});

/**
 * POST /api/v1/audit/verify - Run cryptographic SHA-256 hash chain verification across all records
 */
router.post('/verify', (req: Request, res: Response) => {
  const verification = auditService.verifyLogIntegrity();
  return res.json(verification);
});

/**
 * GET /api/v1/audit/alerts - Real-time security alerts
 */
router.get('/alerts', (req: Request, res: Response) => {
  const alerts = auditService.getAlerts();
  return res.json({ alerts });
});

/**
 * POST /api/v1/audit/alerts/:id/resolve - Mark security alert resolved
 */
router.post('/alerts/:id/resolve', (req: Request, res: Response) => {
  const alertId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const resolved = auditService.resolveAlert(alertId);
  if (!resolved) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  return res.json({ success: true, alertId });
});

export default router;
