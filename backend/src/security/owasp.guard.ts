import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { auditService } from './audit-logger.js';

/**
 * Express Middleware: Non-leaky Error Handler
 * Never expose internal stack traces, DB connection strings, or system paths.
 * Returns standard { error, requestId } while logging detail server-side.
 */
export function nonLeakyErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const requestId = (req.headers['x-request-id'] as string) || `req_${crypto.randomUUID().slice(0, 8)}`;

  auditService.record({
    action: 'SERVER_EXCEPTION',
    category: 'SECURITY',
    severity: 'WARN',
    details: {
      requestId,
      path: req.path,
      method: req.method,
      errorName: err.name,
      errorMessage: err.message,
      stack: err.stack ? err.stack.split('\n').slice(0, 3) : undefined
    }
  });

  const statusCode = err.status || err.statusCode || 500;
  
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : err.message,
    requestId,
    timestamp: new Date().toISOString()
  });
}

/**
 * SSRF Prevention (OWASP A10)
 * Blocks requests targeting private IP ranges, cloud metadata services, and local loopback
 */
export function validateSafeUrl(targetUrl: string, allowedDomains: string[] = ['api.supplier.com', 'tracking.freight.com', 'provenance.io']): { isSafe: boolean; reason?: string } {
  try {
    const parsed = new URL(targetUrl);

    if (parsed.protocol !== 'https:') {
      return { isSafe: false, reason: 'Only HTTPS protocol is permitted' };
    }

    const host = parsed.hostname.toLowerCase();

    // Block localhost, cloud metadata endpoints
    if (['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254', 'metadata.google.internal'].includes(host)) {
      return { isSafe: false, reason: 'Targeting loopback or cloud metadata services is strictly forbidden' };
    }

    // Block private IP CIDR ranges
    const isPrivate = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(host);
    if (isPrivate) {
      return { isSafe: false, reason: 'Targeting private RFC1918 internal networks is strictly forbidden' };
    }

    // Domain whitelist validation
    const domainMatch = allowedDomains.some(d => host === d || host.endsWith(`.${d}`));
    if (!domainMatch) {
      return { isSafe: false, reason: `Host ${host} is not in the approved external domain whitelist` };
    }

    return { isSafe: true };
  } catch (e) {
    return { isSafe: false, reason: 'Malformed URL structure' };
  }
}

/**
 * File Upload Security Validation (Magic Bytes + Path Traversal + Size)
 */
export function validateUploadedBuffer(
  buffer: Buffer,
  declaredMimeType: string,
  filename: string
): { isValid: boolean; error?: string } {
  // Path traversal check on filename
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return { isValid: false, error: 'Illegal path traversal sequence in filename' };
  }

  // Max size check: 50 MB
  if (buffer.length > 50 * 1024 * 1024) {
    return { isValid: false, error: 'File size exceeds maximum allowable limit of 50MB' };
  }

  // Magic bytes / signature check
  if (declaredMimeType === 'application/json') {
    // JSON starts with '{' (0x7B) or '[' (0x5B)
    const firstByte = buffer[0];
    if (firstByte !== 0x7b && firstByte !== 0x5b) {
      return { isValid: false, error: 'File content does not match valid JSON signature' };
    }
  } else if (declaredMimeType === 'application/xml' || declaredMimeType === 'text/xml') {
    // XML starts with '<' (0x3C)
    if (buffer[0] !== 0x3c) {
      return { isValid: false, error: 'File content does not match valid XML signature' };
    }
    // XXE check: forbid DOCTYPE or ENTITY
    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 2048));
    if (/<!DOCTYPE/i.test(content) || /<!ENTITY/i.test(content)) {
      return { isValid: false, error: 'XML files containing DOCTYPE or external ENTITY are rejected to prevent XXE attacks' };
    }
  }

  return { isValid: true };
}
