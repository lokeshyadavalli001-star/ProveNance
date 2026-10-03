import { Router, Request, Response } from 'express';
import { SUPPLY_CHAIN_ONTOLOGY } from '../core/ontology/ontology.js';
import { getAllMetrics } from '../core/semantic-layer/metric-registry.js';

const router = Router();

/**
 * GET /api/v1/ontology - Return full semantic ontology definitions
 */
router.get('/', (req: Request, res: Response) => {
  return res.json({
    name: 'ProveNance Supply Chain Enterprise Ontology',
    namespace: 'http://provenance.io/ontology#',
    version: '2.4.0',
    concepts: Object.values(SUPPLY_CHAIN_ONTOLOGY),
    lastUpdated: '2026-10-01T00:00:00Z'
  });
});

/**
 * GET /api/v1/ontology/metrics - Return approved Metric Registry
 */
router.get('/metrics', (req: Request, res: Response) => {
  return res.json({
    registry: getAllMetrics(),
    governanceCouncil: 'Enterprise Data Governance Board & Strategic Procurement Council',
    enforcementMode: 'STRICT_SINGLE_SOURCE_OF_TRUTH'
  });
});

export default router;
