import { Router, Request, Response } from 'express';
import { queryPlanner } from '../core/query-planner/planner.js';
import { inspectAndSanitizeQuery, generateSafeCSV } from '../security/sanitization.js';
import { authService } from '../security/auth.service.js';
import { UserContext } from '../security/abac.js';

const router = Router();

// Cache of executed queries in-memory for immediate retrieval
const queryCache = new Map<string, any>();

function extractUserContext(req: Request): UserContext {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = authService.verifyAccessToken(authHeader.slice(7));
      return {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        businessUnits: decoded.businessUnits || ['EMEA'],
        organizationId: decoded.org || 'org_global'
      };
    } catch (e) {
      // invalid token fallback
    }
  }

  // Fallback to header-selected persona or default analyst for instant demo exploration
  const requestedRole = (req.headers['x-demo-role'] as string) || 'ANALYST';
  const requestedUnits = (req.headers['x-demo-units'] as string) ? (req.headers['x-demo-units'] as string).split(',') : ['EMEA'];

  return {
    id: 'usr_demo_session',
    email: `${requestedRole.toLowerCase()}@provenance.io`,
    role: requestedRole,
    businessUnits: requestedUnits,
    organizationId: 'org_enterprise_global'
  };
}

/**
 * POST /api/v1/queries - Submit Governed Conversational Query
 */
router.post('/', async (req: Request, res: Response) => {
  const { question, filters } = req.body;
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Question string is required' });
  }

  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const user = extractUserContext(req);

  // Input inspection & sanitization
  const { safeQuestion, isFlagged } = inspectAndSanitizeQuery(question, ip, user.email);
  if (isFlagged) {
    return res.status(400).json({
      error: 'Security Warning: Query input contains unauthorized characters or potential injection syntax and was neutralized.'
    });
  }

  try {
    const result = await queryPlanner.executeGovernedQuery(safeQuestion, user, filters);
    queryCache.set(result.queryId, result);
    return res.json(result);
  } catch (err: any) {
    return res.status(403).json({ error: err.message });
  }
});

/**
 * GET /api/v1/queries/:id - Retrieve Query Results
 */
router.get('/:id', (req: Request, res: Response) => {
  const queryId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const query = queryCache.get(queryId);
  if (!query) {
    return res.status(404).json({ error: 'Query not found' });
  }
  return res.json(query);
});

/**
 * POST /api/v1/queries/export-csv - Safe CSV Export with Formula Injection Neutralization
 */
router.post('/export-csv', (req: Request, res: Response) => {
  const { queryId } = req.body;
  const query = queryCache.get(queryId);
  if (!query) {
    return res.status(404).json({ error: 'Query result not found' });
  }

  const headers = query.columns.map((c: any) => c.name);
  const csvContent = generateSafeCSV(headers, query.rows);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="provenance_query_${queryId}.csv"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.send(csvContent);
});

export default router;
