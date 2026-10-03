import { Request, Response, NextFunction } from 'express';
import { auditService } from './audit-logger.js';

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

interface LoginAttemptTracker {
  failedAttempts: number;
  lockedUntil?: number;
  lastAttempt: number;
}

class RateLimitEngine {
  private ipBuckets = new Map<string, TokenBucket>();
  private loginAttempts = new Map<string, LoginAttemptTracker>();
  private defaultCapacity = 1000;
  private defaultRefillRate = 1000 / 60; // 1000 tokens per 60 seconds

  /**
   * Token bucket rate check for requests
   */
  public checkRateLimit(key: string, cost: number = 1, capacity: number = this.defaultCapacity): { allowed: boolean; remaining: number; reset: number } {
    const now = Date.now();
    let bucket = this.ipBuckets.get(key);

    if (!bucket) {
      bucket = { tokens: capacity, lastRefill: now };
      this.ipBuckets.set(key, bucket);
    }

    // Refill tokens based on elapsed time
    const elapsedSeconds = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(capacity, bucket.tokens + elapsedSeconds * this.defaultRefillRate);
    bucket.lastRefill = now;

    const resetSeconds = Math.ceil((capacity - bucket.tokens) / this.defaultRefillRate);

    if (bucket.tokens < cost) {
      // Trigger security alert on severe burst
      if (bucket.tokens < -10) {
        auditService.triggerAlert({
          type: 'RATE_LIMIT_EXCEEDED',
          severity: 'MEDIUM',
          details: { key, cost, tokensAvailable: bucket.tokens }
        });
      }
      return { allowed: false, remaining: 0, reset: resetSeconds };
    }

    bucket.tokens -= cost;
    return { allowed: true, remaining: Math.floor(bucket.tokens), reset: resetSeconds };
  }

  /**
   * Track login attempts and enforce exponential backoff + account lockout
   */
  public recordLoginAttempt(email: string, ip: string, success: boolean): { allowed: boolean; waitTimeMs?: number; message?: string } {
    const now = Date.now();
    const key = email.toLowerCase().trim();
    let tracker = this.loginAttempts.get(key);

    if (!tracker) {
      tracker = { failedAttempts: 0, lastAttempt: now };
      this.loginAttempts.set(key, tracker);
    }

    // If currently locked out
    if (tracker.lockedUntil && tracker.lockedUntil > now) {
      const waitMinutes = Math.ceil((tracker.lockedUntil - now) / 60000);
      return {
        allowed: false,
        message: `Account temporarily locked due to multiple failed attempts. Try again in ${waitMinutes} minutes.`
      };
    }

    if (success) {
      // Reset tracker on successful login
      this.loginAttempts.delete(key);
      return { allowed: true };
    }

    // Failed attempt increment
    tracker.failedAttempts += 1;
    tracker.lastAttempt = now;

    if (tracker.failedAttempts >= 5) {
      tracker.lockedUntil = now + 30 * 60 * 1000; // 30-min lockout
      auditService.triggerAlert({
        type: 'BRUTE_FORCE',
        severity: 'HIGH',
        details: { email, ip, failedAttempts: tracker.failedAttempts, action: 'ACCOUNT_LOCKED_30_MIN' }
      });
      return {
        allowed: false,
        message: 'Maximum 5 failed attempts exceeded. Account locked for 30 minutes for security.'
      };
    }

    // Exponential backoff delay
    const backoffDelay = Math.pow(2, tracker.failedAttempts - 1) * 1000;
    return {
      allowed: false,
      waitTimeMs: backoffDelay,
      message: `Invalid credentials. (${5 - tracker.failedAttempts} attempts remaining)`
    };
  }

  public getLoginLockStatus(email: string): { isLocked: boolean; remainingMinutes?: number } {
    const tracker = this.loginAttempts.get(email.toLowerCase().trim());
    if (tracker?.lockedUntil && tracker.lockedUntil > Date.now()) {
      return {
        isLocked: true,
        remainingMinutes: Math.ceil((tracker.lockedUntil - Date.now()) / 60000)
      };
    }
    return { isLocked: false };
  }

  /**
   * Calculate complexity token cost for analytical queries
   */
  public calculateQueryCost(query: string, tool: 'sql' | 'sparql' | 'ml'): number {
    if (tool === 'ml') return 50;
    if (tool === 'sparql') {
      const triples = (query.match(/\?/g) || []).length;
      return Math.min(60, 5 + triples * 2);
    }
    const joins = (query.match(/JOIN/gi) || []).length;
    return 1 + joins * 4;
  }
}

export const rateLimitEngine = new RateLimitEngine();

/**
 * Express middleware for global IP-level rate limiting
 */
export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const { allowed, remaining, reset } = rateLimitEngine.checkRateLimit(ip, 1, 1000);

  res.setHeader('X-RateLimit-Limit', '1000');
  res.setHeader('X-RateLimit-Remaining', remaining.toString());
  res.setHeader('X-RateLimit-Reset', reset.toString());

  if (!allowed) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please back off before retrying.',
      retryAfterSeconds: reset
    });
  }

  next();
}
