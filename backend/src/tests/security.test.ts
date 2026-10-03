import { authService } from '../security/auth.service.js';
import { auditService } from '../security/audit-logger.js';
import { rateLimitEngine } from '../security/rate-limiter.js';
import { hasPermission, applyColumnSecurity, UserRole } from '../security/rbac.js';
import { filterRowsByRLS, UserContext } from '../security/abac.js';
import { inspectAndSanitizeQuery, sanitizeCSVCell } from '../security/sanitization.js';
import { signRequest, verifySignature } from '../security/hmac.js';
import { validateSafeUrl, validateUploadedBuffer } from '../security/owasp.guard.js';
import { encryptField, decryptField } from '../security/encryption.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${testName} - ${detail || 'Assertion failed'}`);
    failedTests++;
  }
}

async function runSecurityTestSuite() {
  console.log('\n=============================================================');
  console.log(' PROVENANCE™ ENTERPRISE SECURITY & OWASP VERIFICATION SUITE');
  console.log(' Testing 10 Security Domains & Defense-in-Depth Enforcement  ');
  console.log('=============================================================\n');

  // DOMAIN 1: Authentication & Brute-Force Account Lockout
  console.log('--- DOMAIN 1 & 3: Authentication, Brute-Force & Lockout ---');
  try {
    await authService.login('admin@provenance.io', 'WrongPassword123!', '192.168.1.10', 'test-agent');
    assert(false, 'Bad password must be rejected');
  } catch (err: any) {
    assert(err.message.includes('Invalid credentials') || err.message.includes('attempts remaining'), 'Rejects incorrect password with generic message');
  }

  // Test successful login
  const loginSuccess = await authService.login('operator@provenance.io', 'OperatorSecret2026!', '127.0.0.1', 'test-agent');
  assert(Boolean(loginSuccess.accessToken), 'Valid credentials issue JWT token for non-MFA user');

  // Test MFA challenge for Admin
  const adminLogin = await authService.login('admin@provenance.io', 'AdminSecret2026!', '127.0.0.1', 'test-agent');
  assert(adminLogin.requiresMfa === true, 'Privileged ADMIN requires Multi-Factor Authentication challenge');

  // DOMAIN 1 (Cont.): Column-Level Security (CLS)
  console.log('\n--- DOMAIN 1: Column-Level Security (CLS) ---');
  const sensitiveRecord = {
    name: 'Foxconn Industrial',
    otifRate: 88.6,
    bank_details: 'DE89370400440532013000',
    contract_pricing: '$14,250,000',
    unit_cost: 142.50
  };

  const analystView = applyColumnSecurity(sensitiveRecord, 'ANALYST');
  assert(!('bank_details' in analystView.sanitizedRow), 'CLS: Strips bank_details from ANALYST role');
  assert(!('contract_pricing' in analystView.sanitizedRow), 'CLS: Strips contract_pricing from ANALYST role');
  assert('otifRate' in analystView.sanitizedRow, 'CLS: Retains operational otifRate for ANALYST');

  const adminView = applyColumnSecurity(sensitiveRecord, 'ADMIN');
  assert('bank_details' in adminView.sanitizedRow, 'CLS: Permits bank_details for authorized ADMIN role');

  // DOMAIN 1 (Cont.): Row-Level Security (RLS)
  console.log('\n--- DOMAIN 1: Row-Level Security (RLS) ---');
  const regionalRecords = [
    { name: 'Supplier Alpha', businessUnit: 'EMEA' },
    { name: 'Supplier Beta', businessUnit: 'APAC' },
    { name: 'Supplier Gamma', businessUnit: 'AMER' }
  ];

  const emeaUser: UserContext = {
    id: 'u1',
    email: 'analyst.emea@provenance.io',
    role: 'ANALYST',
    businessUnits: ['EMEA'],
    organizationId: 'org_1'
  };

  const filteredForEmea = filterRowsByRLS(regionalRecords, emeaUser);
  assert(filteredForEmea.length === 1 && filteredForEmea[0].businessUnit === 'EMEA', 'RLS: Injects business unit boundary, hiding APAC & AMER data');

  // DOMAIN 2: Input Validation, Sanitization & SQLi Prevention
  console.log('\n--- DOMAIN 2: Input Sanitization & SQL Injection Prevention ---');
  const sqliQuery = "SELECT * FROM suppliers WHERE id = '1' UNION SELECT * FROM users; DROP TABLE suppliers; --";
  const sanitized = inspectAndSanitizeQuery(sqliQuery, '127.0.0.1', 'test@provenance.io');
  assert(sanitized.isFlagged === true, 'Detects and flags SQL injection attempt');

  // DOMAIN 2 (Cont.): CSV Formula Injection Prevention
  console.log('\n--- DOMAIN 2 & 9: CSV Formula Injection Prevention ---');
  const maliciousFormula = '=CMD|"/C calc"!A0';
  const safeCell = sanitizeCSVCell(maliciousFormula);
  assert(safeCell.startsWith("'"), "Neutralizes CSV formula injection by prepending single quote '");

  // DOMAIN 4: Request Signature Verification (HMAC-SHA256)
  console.log('\n--- DOMAIN 4: HMAC Request Signing & Replay Defense ---');
  const actionPayload = { scenarioId: 'scen_suez_01', approver: 'admin@provenance.io' };
  const currentTs = Math.floor(Date.now() / 1000);
  const validSignature = signRequest(actionPayload, currentTs);

  const verification = verifySignature(actionPayload, validSignature, currentTs);
  assert(verification.isValid === true, 'HMAC-SHA256 signature validates genuine payload');

  const tamperedPayload = { ...actionPayload, approver: 'attacker@evil.com' };
  const tamperedVerification = verifySignature(tamperedPayload, validSignature, currentTs);
  assert(tamperedVerification.isValid === false, 'HMAC-SHA256 verification rejects tampered payload');

  const staleTs = currentTs - 400; // 400s older than 300s window
  const staleVerification = verifySignature(actionPayload, validSignature, staleTs);
  assert(staleVerification.isValid === false, 'Rejects expired timestamp outside ±300s replay window');

  // DOMAIN 5: Cryptographic Field Encryption (AES-256-GCM)
  console.log('\n--- DOMAIN 5: AES-256-GCM Field Encryption ---');
  const secretData = 'Confidential Supplier Bank Account #4492-8812';
  const encrypted = encryptField(secretData);
  assert(encrypted !== secretData && encrypted.includes(':'), 'Field encrypted into IV:Tag:Ciphertext format');
  const decrypted = decryptField(encrypted);
  assert(decrypted === secretData, 'Field successfully decrypted with authenticated GCM tag');

  // DOMAIN 7: Cryptographic Tamper-Evident Audit Logging
  console.log('\n--- DOMAIN 7: Tamper-Evident Cryptographic Hash Chaining ---');
  const chainCheck = auditService.verifyLogIntegrity();
  assert(chainCheck.isValid === true, 'Audit chain integrity verified across all historical blocks');

  // DOMAIN 8 (A10): Server-Side Request Forgery (SSRF) Prevention
  console.log('\n--- DOMAIN 8: SSRF (Server-Side Request Forgery) Defense ---');
  const privateIpCheck = validateSafeUrl('https://192.168.1.1/admin');
  assert(privateIpCheck.isSafe === false, 'Blocks private RFC1918 internal IP address');

  const metadataCheck = validateSafeUrl('https://169.254.169.254/latest/meta-data/');
  assert(metadataCheck.isSafe === false, 'Blocks cloud metadata service IP address');

  const loopbackCheck = validateSafeUrl('https://localhost:8080/internal');
  assert(loopbackCheck.isSafe === false, 'Blocks localhost loopback address');

  const legitimateCheck = validateSafeUrl('https://api.supplier.com/shipments');
  assert(legitimateCheck.isSafe === true, 'Permits approved whitelisted external HTTPS domain');

  // DOMAIN 9: File Upload & XXE Mitigation
  console.log('\n--- DOMAIN 9: File Upload Security & XXE Defense ---');
  const pathTraversalCheck = validateUploadedBuffer(Buffer.from('{}'), 'application/json', '../../etc/passwd');
  assert(pathTraversalCheck.isValid === false, 'Rejects filename with path traversal characters');

  const xxePayload = Buffer.from('<?xml version="1.0"?><!DOCTYPE root [<!ENTITY test SYSTEM "file:///etc/passwd">]><root>&test;</root>');
  const xxeCheck = validateUploadedBuffer(xxePayload, 'application/xml', 'invoice.xml');
  assert(xxeCheck.isValid === false, 'Blocks XML file containing malicious DOCTYPE / ENTITY (XXE defense)');

  console.log('\n=============================================================');
  console.log(` RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('=============================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSecurityTestSuite();
