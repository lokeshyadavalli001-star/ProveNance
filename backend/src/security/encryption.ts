import crypto from 'crypto';
import { config } from '../config/index.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt sensitive string data using AES-256-GCM with authentication tag
 */
export function encryptField(plainText: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = Buffer.from(config.aesKeyHex, 'hex');
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    throw new Error('Encryption operation failed');
  }
}

/**
 * Decrypt AES-256-GCM encrypted field
 */
export function decryptField(encryptedPayload: string): string {
  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted payload format');
    }
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = Buffer.from(config.aesKeyHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed or data integrity compromised');
  }
}

/**
 * Mask Phone Number: "+1-***-***-1234"
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  return phone.replace(/\d(?=\d{4})/g, '*');
}

/**
 * Mask Email: "j***e@domain.com"
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***.com';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  const masked = local[0] + '*'.repeat(Math.max(1, local.length - 2)) + local[local.length - 1];
  return `${masked}@${domain}`;
}

/**
 * Mask Bank Account: "•••• •••• •••• 9876"
 */
export function maskBankDetails(account: string): string {
  if (!account) return '••••';
  const clean = account.replace(/\s+/g, '');
  const last4 = clean.slice(-4);
  return `•••• •••• •••• ${last4}`;
}

/**
 * Mask Pricing Terms or Margins
 */
export function maskFinancialValue(value: number | string): string {
  return '[CONFIDENTIAL_RESTRICTED]';
}
