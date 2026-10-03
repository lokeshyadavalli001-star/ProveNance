import { z } from 'zod';
import { auditService } from './audit-logger.js';

/**
 * Zod Schema for Governed Conversational Query
 */
export const queryInputSchema = z.object({
  question: z.string()
    .min(3, 'Question must be at least 3 characters')
    .max(2000, 'Question exceeds 2000 character maximum')
    .refine((val) => {
      // Check for SQL injection signature patterns in raw prompt
      const suspiciousPatterns = [/;\s*DROP\s+TABLE/i, /UNION\s+SELECT/i, /--/i, /<script>/i];
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(val)) return false;
      }
      return true;
    }, { message: 'Potential injection attempt detected in query string' }),
  filters: z.object({
    geography: z.enum(['ALL', 'EMEA', 'APAC', 'AMER']).optional(),
    supplierId: z.string().optional(),
    productCategory: z.string().optional(),
    dateRange: z.object({
      start: z.string().optional(),
      end: z.string().optional()
    }).optional()
  }).optional()
});

/**
 * Text sanitization for safe display (neutralizes XSS tags and malicious controls)
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '') // strip HTML brackets
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Neutralize CSV Formula Injection (Excel / Google Sheets execution)
 * Values starting with =, +, -, @ will be prefixed with a single quote '
 */
export function sanitizeCSVCell(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/^[=+\-@]/.test(str)) {
    return `'${str}`;
  }
  // If contains commas or quotes, wrap in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert tabular data to secure CSV with formula injection mitigation
 */
export function generateSafeCSV(headers: string[], rows: Record<string, any>[]): string {
  const headerLine = headers.map(h => sanitizeCSVCell(h)).join(',');
  const rowLines = rows.map(row => {
    return headers.map(header => sanitizeCSVCell(row[header])).join(',');
  });
  return [headerLine, ...rowLines].join('\r\n');
}

/**
 * Sanitize query input and trigger security alert if injection pattern is detected
 */
export function inspectAndSanitizeQuery(question: string, ip: string, userEmail?: string): { safeQuestion: string; isFlagged: boolean } {
  const injectionPatterns = [
    { name: 'SQL Injection', regex: /((\%27)|('))\s*(union|select|insert|update|delete|drop|alter)/i },
    { name: 'XSS Injection', regex: /(<script|javascript:|onerror=|onload=)/i },
    { name: 'Path Traversal', regex: /(\.\.\/|\.\.\\)/i }
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.regex.test(question)) {
      auditService.triggerAlert({
        type: 'INJECTION_ATTEMPT',
        severity: 'HIGH',
        details: {
          pattern: pattern.name,
          rawQuery: question.slice(0, 100),
          ip,
          userEmail: userEmail || 'anonymous'
        }
      });
      return { safeQuestion: sanitizeText(question), isFlagged: true };
    }
  }

  return { safeQuestion: sanitizeText(question), isFlagged: false };
}
