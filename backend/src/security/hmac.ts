import crypto from 'crypto';
import { config } from '../config/index.js';

/**
 * Generate HMAC-SHA256 signature for payload + timestamp
 */
export function signRequest(body: any, timestamp: number, secret: string = config.masterHmacSecret): string {
  const message = `${JSON.stringify(body)}:${timestamp}`;
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

/**
 * Verify HMAC-SHA256 signature and ±5 minutes replay prevention window
 */
export function verifySignature(
  body: any,
  signature: string,
  timestamp: number,
  secret: string = config.masterHmacSecret
): { isValid: boolean; reason?: string } {
  const now = Math.floor(Date.now() / 1000);
  
  // Replay prevention: strictly within 300 seconds (5 minutes)
  if (Math.abs(now - timestamp) > 300) {
    return {
      isValid: false,
      reason: `Signature timestamp is outside acceptable freshness window (±300s). Difference: ${Math.abs(now - timestamp)}s`
    };
  }

  const expectedSignature = signRequest(body, timestamp, secret);

  try {
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (sigBuffer.length !== expectedBuffer.length) {
      return { isValid: false, reason: 'Signature length mismatch' };
    }

    const match = crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    if (!match) {
      return { isValid: false, reason: 'Cryptographic HMAC signature mismatch' };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, reason: 'Invalid signature encoding or format' };
  }
}
