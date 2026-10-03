# ProveNance™ Enterprise Supply Chain Intelligence Platform
## Secure, Governed Conversational Analytics Architecture

---

## EXECUTIVE DIRECTIVE & ARCHITECTURE MANDATE

**ProveNance™** is a mission-critical, secure, governed supply-chain decision-intelligence platform that transforms heterogeneous operational data (ERP, WMS, TMS, PLM, IoT) into auditable, explainable business intelligence through a natural-language conversational interface.

The platform operates with "**Defense-in-Depth**" security across every layer, ensuring that no single point of compromise exposes sensitive supply-chain, supplier, customer, or operational data.

```
OPERATIONAL DATA SOURCES (ERP, WMS, TMS, CRM, Supplier Feeds, IoT)
    ↓
DATA ENGINEERING & QUALITY (Validation, Cleaning, Golden Records)
    ↓
MASTER DATA & SEMANTIC MAPPING (Entity Resolution, Classification Tiers)
    ↓
SUPPLY CHAIN ONTOLOGY (Semantic Model, Business Concepts, Relationships)
    ↓
KNOWLEDGE GRAPH & ANALYTICAL STORAGE (Entity Store, Multi-Hop Lineage)
    ↓
SEMANTIC LAYER & METRIC REGISTRY (Approved Metrics, Zero Hallucination Standard)
    ↓
GOVERNED QUERY PLANNING (Intent Classifier, Policy Guard, Tool Routing)
    ↓
SQL / SPARQL / ML / MONTE CARLO SIMULATION (Evidence Generation Engines)
    ↓
LLM REASONING & GROUNDED EXPLANATION (Grounded, Auditable Answers)
    ↓
DECISION INTELLIGENCE (Executive Dashboard, Alerts, HMAC Approval Gate)
```

**Rule: Operational truth lives in source systems. Data engineering prepares trusted data. Ontology defines meaning. Knowledge graph captures relationships. Analytics and ML generate validated evidence. LLM explains evidence. Authorization gates everything.**

---

## 10 SECURITY DOMAINS IMPLEMENTED

| Domain | Mandate | Implementation in ProveNance™ |
|---|---|---|
| **1. Secure Auth & AuthZ** | Authenticated identity before access; context-aware authorization. | JWT (HS256/RS256) with 15m expiry, 7d refresh token rotation, Redis-compatible session store, TOTP MFA (window=1), backup codes, RBAC matrix, ABAC regional policy evaluation, Row-Level Security (RLS), and Column-Level Security (CLS) field masking. |
| **2. Input Validation & Sanitization** | Strict whitelist schema; zero injection vectors. | Strict Zod validation schemas, SQL injection defense, XSS neutralization, CSV formula injection defense (neutralizing cells starting with `=, +, -, @` with `'`), safe SPARQL query generation. |
| **3. Rate Limiting & Brute-Force** | Protect against credential stuffing, DoS, and compute exhaustion. | IP sliding-window token bucket (1000 tokens/min), account lockout after 5 failed login attempts with exponential backoff (1s, 2s, 4s, 8s, 16s -> 30m lock), query complexity costing (ML = 50 tokens, joins = 5 tokens), standard `X-RateLimit-*` headers. |
| **4. API Security** | Secure API gateways with non-leaky errors and tamper resistance. | Bearer tokens & SHA-256 hashed API keys, HMAC-SHA256 request signatures for high-value mutations with ±300s freshness window, non-leaky error handling with unique `requestId`, TLS/HSTS headers, restrictive CORS, 10MB payload size limit, idempotency keys. |
| **5. Encryption & Data Protection** | Data encrypted in transit (TLS) and at rest (AES-256). | AES-256-GCM field-level encryption for Tier 3 sensitive columns (`bank_details`, `contract_pricing`), bcrypt password hashing (cost 12), data classification tiers (Public, Confidential, Restricted), dynamic masking in UI. |
| **6. Secrets Management** | Zero hardcoded credentials in source code. | Fail-fast startup configuration validation, masked logging (`[prov...2026]`), gitignored environment configuration with `.env.example`, API key generation and revocation lifecycle. |
| **7. Security Logging & Monitoring** | Maintain tamper-resistant, comprehensive audit trails. | Winston structured logging, **tamper-evident SHA-256 cryptographic hash chaining** (every log entry links to previous hash digest), real-time anomaly detection (brute force, injection attempts, rate limit breaches), one-click hash chain integrity verification. |
| **8. OWASP Security Controls** | Mitigate OWASP Top 10 risks across all endpoints. | Complete mitigations for A1 (Broken Access Control), A2 (Cryptographic Failures), A3 (Injection), A4 (Insecure Design), A5 (Broken Authentication), A6 (Sensitive Data Exposure), A7 (XXE Protection), A8 (Integrity Failures), A9 (Logging Failures), and A10 (SSRF Protection blocking RFC1918 private IPs and cloud metadata). |
| **9. File & Upload Security** | Prevent malicious uploads, path traversal, and code execution. | Magic bytes validation, 50MB size ceilings, path traversal filename rejection (`..`, `/`, `\`), CSV formula injection protection, XML DOCTYPE and external entity rejection (XXE). |
| **10. Vulnerability Testing** | Automated security verification in CI/CD pipeline. | Automated test suite (`backend/src/tests/security.test.ts`) covering all 10 domains with 22 automated security tests passing. |

---

## QUICK START & RUN INSTRUCTIONS

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Installation
Run from root:
```bash
npm run install:all
```

### 2. Run Security Verification Test Suite
```bash
npm run test:security
```
Output:
```
=============================================================
 RESULTS: 22 PASSED, 0 FAILED
=============================================================
```

### 3. Start Full Platform
Start backend and frontend in separate terminals:

**Terminal 1 (Backend - Port 4000):**
```bash
npm run dev:backend
```

**Terminal 2 (Frontend - Port 5173):**
```bash
npm run dev:frontend
```

Open your browser to: **[http://localhost:5173](http://localhost:5173)**

---

## INTERACTIVE DEMO PERSONAS FOR JUDGES

ProveNance™ provides a built-in **Persona Switcher** in the top navigation bar to immediately demo Row-Level and Column-Level Security enforcement:

| Persona | Role | Scope | Permitted Access & Data Masking Behavior |
|---|---|---|---|
| **CSCO (Global Admin)** | `ADMIN` | Global (ALL) | Full unrestricted access; unmasked Tier 3 bank details and pricing contracts; full simulation approval rights. |
| **Elena Rostova (EMEA Risk Lead)** | `ANALYST` | `EMEA` | Scoped to EMEA only (APAC/AMER data filtered by RLS); sensitive bank details and contract pricing masked by Policy Guard. |
| **Kenji Sato (APAC Operations Lead)** | `ANALYST` | `APAC` | Scoped to APAC only (EMEA data filtered by RLS); financial exposures masked. |
| **Marcus Vance (Rotterdam Hub Operator)** | `OPERATOR` | `EMEA` | Operational order tracking and stock rebalance execution rights. |
| **Audrey Chen (Executive Viewer)** | `VIEWER` | `AMER` | Read-only aggregate view; mutations and detailed row queries restricted. |

---

## WORKSPACES OVERVIEW

1. **Executive Command Center (`/dashboard`)**:
   - Executive KPIs: OTIF Rate (94.2%), Average Lead Time (12.3 days), Stockout Risk (3 hubs), Supplier Health (87%).
   - Historical weekly trend trajectories (OTIF and Lead Time).
   - Real-time disruption alerts stream with one-click simulation launchpad.

2. **Governed Conversational AI (`/query`)**:
   - Natural language input with whitelist sanitization and 2000-character counter.
   - Pre-configured approved enterprise prompts.
   - Live **Query Plan & Policy Guard Inspector** demonstrating intent classification, tool routing, metric registry binding, and token complexity costing.

3. **Query Results & Evidence Lineage (`/results`)**:
   - **Structured Data Table**: Interactive table with sorting, search, column masking badges (`[RESTRICTED_MASKED]`).
   - **Evidence & Metric Lineage**: Multi-step grounded calculation chain, data sources lineage (ERP, TMS, WMS, ML model with confidence ratings), approved metric registry definition and formula.
   - **Cryptographic Audit Proof**: Query ID, identity attribution, execution latency, RLS rule applied, restricted columns filtered, and immutable SHA-256 hash block.
   - **Safe CSV Export**: Exports results with formula injection defense.

4. **Supply Chain Ontology & Metric Registry (`/ontology`)**:
   - Centralized Metric Registry: OTIF, Average Lead Time, Stockout Risk, Supplier Health, Disruption Exposure.
   - Formal ontology concepts: Supplier, Product, Warehouse, Shipment, RiskFactor, Contract with field-level classification tags.

5. **Knowledge Graph Explorer (`/graph`)**:
   - Multi-hop relationship canvas linking vendors, distribution hubs, products, and active freight.
   - Interactive provenance metadata inspector (source system, timestamp, confidence rating).
   - **Disruption Propagation Ripple Tool**: Click any vendor (e.g. Foxconn) to trace downstream supply disruption into shipments and regional warehouses.

6. **What-If Simulation & Decision Sandbox (`/simulation`)**:
   - Monte Carlo simulation evaluating lead time variance, cost inflation, and inventory starvation dates.
   - **Cryptographic HMAC Authorization Gate**: Authorizing high-impact supply chain mitigation requires HMAC-SHA256 signature verification with timestamp freshness check (±300s) to guarantee non-repudiation.

7. **Security & Governance Operations Center (`/admin/security`)**:
   - Real-time anomaly detection stream (brute force, injection attempts, rate limits).
   - **Cryptographic Hash Chain Verifier**: Interactive one-click integrity verification tool that proves all audit blocks are 100% authentic and untampered.
   - RBAC & CLS Policy matrix inspector.
   - Machine-to-Machine API Key lifecycle manager (issue and revoke keys).

---

## OWASP TOP 10 COMPLIANCE MATRIX

- **A1: Broken Access Control** → Enforced via RBAC action matrix, ABAC regional conditions, automatic RLS SQL injection, and CLS column masking.
- **A2: Cryptographic Failures** → AES-256-GCM authenticated encryption for sensitive fields, bcrypt cost 12 for passwords, TLS/HSTS headers, RS256/HS256 JWTs.
- **A3: Injection** → Parameterized query abstraction, strict Zod schemas, input character sanitization, and CSV formula neutralization.
- **A4: Insecure Design** → Strict separation across 8 layers: operational source truth, ontology, knowledge graph, metric registry, policy guard, evidence engines, and LLM reasoning.
- **A5: Broken Authentication** → 5-attempt brute-force lockout with exponential backoff (30m lock), TOTP MFA (Speakeasy), single-use backup codes, and session revocation.
- **A6: Sensitive Data Exposure** → Dynamic UI masking, structured Winston log sanitization (passwords, tokens, and PII stripped before disk write).
- **A7: XML External Entity (XXE)** → Safe XML parser rejects DOCTYPE and ENTITY expansion.
- **A8: Software & Data Integrity** → Tamper-evident SHA-256 audit hash chaining; verified package versions with zero vulnerabilities.
- **A9: Logging & Monitoring Failures** → Real-time anomaly alerting, immutable audit blocks with hash verification.
- **A10: Server-Side Request Forgery (SSRF)** → `validateSafeUrl` blocks RFC1918 private IP addresses (10.*, 172.16.*, 192.168.*), loopback (127.*, localhost), and cloud metadata endpoints.

---

*ProveNance™ Architecture Team — Mission-Critical Supply Chain Decision Intelligence.*
