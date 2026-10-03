import { Router, Request, Response } from 'express';
import { authService } from '../security/auth.service.js';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

/**
 * POST /api/v1/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid email or password format' });
  }

  const { email, password } = parsed.data;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'unknown';

  try {
    const result = await authService.login(email, password, ip, userAgent);
    return res.json(result);
  } catch (err: any) {
    return res.status(401).json({ error: err.message || 'Authentication failed' });
  }
});

/**
 * POST /api/v1/auth/mfa/verify
 */
router.post('/mfa/verify', (req: Request, res: Response) => {
  const { userId, code, isBackupCode } = req.body;
  if (!userId || !code) {
    return res.status(400).json({ error: 'Missing userId or verification code' });
  }

  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  try {
    const result = authService.verifyMfa(userId, code, Boolean(isBackupCode), ip);
    return res.json(result);
  } catch (err: any) {
    return res.status(401).json({ error: err.message || 'MFA verification failed' });
  }
});

/**
 * POST /api/v1/auth/oauth/mock (Enterprise SSO Okta/Google)
 */
router.post('/oauth/mock', (req: Request, res: Response) => {
  const { provider, email } = req.body;
  if (!provider || !email) {
    return res.status(400).json({ error: 'Provider and email are required for SSO login' });
  }

  const result = authService.mockOAuth2Login(provider, email);
  return res.json(result);
});

/**
 * POST /api/v1/auth/logout
 */
router.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  authService.logout(token);
  return res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * GET /api/v1/auth/me
 */
router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing bearer token' });
  }

  try {
    const decoded = authService.verifyAccessToken(authHeader.slice(7));
    return res.json({ user: decoded });
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
});

export default router;
