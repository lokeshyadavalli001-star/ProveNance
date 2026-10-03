import { Router, Request, Response } from 'express';
import { knowledgeGraph } from '../core/knowledge-graph/graph-engine.js';

const router = Router();

/**
 * GET /api/v1/graph - Return knowledge graph nodes & edges
 */
router.get('/', (req: Request, res: Response) => {
  const data = knowledgeGraph.getFullGraph();
  return res.json(data);
});

/**
 * GET /api/v1/graph/disruptions/:entityId - Trace disruption ripples
 */
router.get('/disruptions/:entityId', (req: Request, res: Response) => {
  const entityId = Array.isArray(req.params.entityId) ? req.params.entityId[0] : req.params.entityId;
  const result = knowledgeGraph.traceDisruptionRipple(entityId);
  return res.json(result);
});

export default router;
