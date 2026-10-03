import { Router, Request, Response } from 'express';
import { simulationEngine } from '../core/engines/simulation-engine.js';
import { signRequest } from '../security/hmac.js';

const router = Router();

/**
 * GET /api/v1/simulation/scenarios - List preset & active scenarios
 */
router.get('/scenarios', (req: Request, res: Response) => {
  return res.json({ scenarios: simulationEngine.getScenarios() });
});

/**
 * POST /api/v1/simulation/run - Run custom what-if scenario
 */
router.post('/run', (req: Request, res: Response) => {
  const { name, delayDaysDelta, costMultiplier, geography } = req.body;
  const scenario = simulationEngine.runSimulation({
    name: name || 'Custom Ad-Hoc Scenario',
    delayDaysDelta: Number(delayDaysDelta) || 5,
    costMultiplier: Number(costMultiplier) || 1.15,
    geography: geography || 'EMEA'
  });
  return res.json({ scenario });
});

/**
 * POST /api/v1/simulation/approve - Approve mitigation action with HMAC signature verification
 */
router.post('/approve', (req: Request, res: Response) => {
  const { scenarioId, approverEmail, signature, timestamp } = req.body;
  if (!scenarioId || !approverEmail || !signature || !timestamp) {
    return res.status(400).json({
      error: 'Missing required HMAC signature verification parameters (scenarioId, approverEmail, signature, timestamp)'
    });
  }

  const result = simulationEngine.approveMitigation(
    scenarioId,
    approverEmail,
    signature,
    Number(timestamp)
  );

  if (!result.success) {
    return res.status(403).json({ error: result.error });
  }

  return res.json(result);
});

/**
 * POST /api/v1/simulation/generate-signature - Helper tool for client to generate test HMAC signature
 */
router.post('/generate-signature', (req: Request, res: Response) => {
  const { scenarioId, approverEmail } = req.body;
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signRequest({ scenarioId, approverEmail }, timestamp);
  return res.json({ timestamp, signature, payload: { scenarioId, approverEmail } });
});

export default router;
