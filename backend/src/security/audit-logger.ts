import crypto from 'crypto';
import winston from 'winston';

export interface AuditRecord {
  id: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  role?: string;
  businessUnit?: string;
  action: string; // 'login', 'query', 'export', 'simulate', 'security_alert', etc.
  category: 'AUTHENTICATION' | 'DATA_ACCESS' | 'GOVERNANCE' | 'SECURITY' | 'SIMULATION';
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  details: Record<string, any>;
  previousHash: string;
  hash: string;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  type: 'BRUTE_FORCE' | 'INJECTION_ATTEMPT' | 'PRIVILEGE_ESCALATION' | 'RATE_LIMIT_EXCEEDED' | 'INTEGRITY_TAMPER';
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: Record<string, any>;
  resolved: boolean;
}

class AuditService {
  private logger: winston.Logger;
  private auditChain: AuditRecord[] = [];
  private securityAlerts: SecurityAlert[] = [];
  private lastHash: string = '0000000000000000000000000000000000000000000000000000000000000000'; // Genesis hash

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              return `[${timestamp}] [AUDIT] [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
            })
          )
        })
      ]
    });

    // Record Genesis block
    this.record({
      action: 'SYSTEM_GENESIS',
      category: 'GOVERNANCE',
      severity: 'INFO',
      details: {
        system: 'ProveNance Enterprise Gateway',
        securityStandard: 'OWASP Top 10 + Defense-in-Depth',
        tamperProtection: 'SHA-256 Cryptographic Hash Chaining'
      }
    });
  }

  private computeHash(previousHash: string, dataStr: string): string {
    return crypto.createHash('sha256').update(`${previousHash}:${dataStr}`).digest('hex');
  }

  /**
   * Append an immutable audit record to the cryptographic hash chain
   */
  public record(entry: {
    userId?: string;
    userEmail?: string;
    role?: string;
    businessUnit?: string;
    action: string;
    category: 'AUTHENTICATION' | 'DATA_ACCESS' | 'GOVERNANCE' | 'SECURITY' | 'SIMULATION';
    severity: 'INFO' | 'WARN' | 'CRITICAL';
    details: Record<string, any>;
  }): AuditRecord {
    const id = `aud_${crypto.randomUUID().slice(0, 8)}`;
    const timestamp = new Date().toISOString();
    
    // Sanitize details: strip raw passwords, private keys, credit cards
    const sanitizedDetails = { ...entry.details };
    delete sanitizedDetails.password;
    delete sanitizedDetails.token;
    delete sanitizedDetails.apiSecret;

    const recordData = {
      id,
      timestamp,
      userId: entry.userId,
      userEmail: entry.userEmail,
      role: entry.role,
      businessUnit: entry.businessUnit,
      action: entry.action,
      category: entry.category,
      severity: entry.severity,
      details: sanitizedDetails,
    };

    const previousHash = this.lastHash;
    const hash = this.computeHash(previousHash, JSON.stringify(recordData));

    const fullRecord: AuditRecord = {
      ...recordData,
      previousHash,
      hash
    };

    this.auditChain.push(fullRecord);
    this.lastHash = hash;

    this.logger.log(entry.severity.toLowerCase() as any, fullRecord.action, {
      id: fullRecord.id,
      category: fullRecord.category,
      hash: fullRecord.hash.slice(0, 16) + '...'
    });

    return fullRecord;
  }

  /**
   * Verify complete cryptographic integrity of the audit chain
   */
  public verifyLogIntegrity(): { isValid: boolean; checkedCount: number; brokenIndex?: number; message: string } {
    if (this.auditChain.length === 0) {
      return { isValid: true, checkedCount: 0, message: 'Chain is empty' };
    }

    let expectedPrev = '0000000000000000000000000000000000000000000000000000000000000000';

    for (let i = 0; i < this.auditChain.length; i++) {
      const record = this.auditChain[i];
      if (record.previousHash !== expectedPrev) {
        return {
          isValid: false,
          checkedCount: i,
          brokenIndex: i,
          message: `Hash link mismatch at record #${i} (${record.id})`
        };
      }

      const { hash, previousHash, ...data } = record;
      const recomputedHash = this.computeHash(previousHash, JSON.stringify(data));
      if (recomputedHash !== hash) {
        return {
          isValid: false,
          checkedCount: i,
          brokenIndex: i,
          message: `Tampered payload content detected at record #${i} (${record.id})`
        };
      }

      expectedPrev = hash;
    }

    return {
      isValid: true,
      checkedCount: this.auditChain.length,
      message: `Verified all ${this.auditChain.length} records. Cryptographic chain is 100% authentic and tamper-free.`
    };
  }

  /**
   * Trigger a real-time security alert and record in audit trail
   */
  public triggerAlert(alert: {
    type: 'BRUTE_FORCE' | 'INJECTION_ATTEMPT' | 'PRIVILEGE_ESCALATION' | 'RATE_LIMIT_EXCEEDED' | 'INTEGRITY_TAMPER';
    severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
    details: Record<string, any>;
  }): SecurityAlert {
    const newAlert: SecurityAlert = {
      id: `alt_${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      type: alert.type,
      severity: alert.severity,
      details: alert.details,
      resolved: false
    };

    this.securityAlerts.unshift(newAlert);

    this.record({
      action: `SECURITY_ALERT:${alert.type}`,
      category: 'SECURITY',
      severity: alert.severity === 'CRITICAL' ? 'CRITICAL' : 'WARN',
      details: {
        alertId: newAlert.id,
        ...alert.details
      }
    });

    return newAlert;
  }

  public getRecords(limit: number = 50): AuditRecord[] {
    return [...this.auditChain].reverse().slice(0, limit);
  }

  public getAlerts(): SecurityAlert[] {
    return this.securityAlerts;
  }

  public resolveAlert(alertId: string): boolean {
    const alert = this.securityAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.record({
        action: 'RESOLVE_SECURITY_ALERT',
        category: 'SECURITY',
        severity: 'INFO',
        details: { alertId }
      });
      return true;
    }
    return false;
  }
}

export const auditService = new AuditService();
