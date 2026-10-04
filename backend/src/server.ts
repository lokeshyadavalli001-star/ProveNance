import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { rateLimitMiddleware } from './security/rate-limiter.js';
import { nonLeakyErrorHandler } from './security/owasp.guard.js';

// Route handlers
import authRoutes from './routes/auth.routes.js';
import queryRoutes from './routes/query.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import ontologyRoutes from './routes/ontology.routes.js';
import graphRoutes from './routes/graph.routes.js';
import simulationRoutes from './routes/simulation.routes.js';
import auditRoutes from './routes/audit.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

// 1. Security Headers (OWASP Defense-in-Depth)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:4000", "http://localhost:5173"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// 2. Restrictive CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://app.provenance.io'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Request-ID', 'X-Demo-Role', 'X-Demo-Units'],
  credentials: true,
  maxAge: 86400
}));

// 3. Request Body Size Limits (Mitigate DoS & Buffer Bombing)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 4. Rate Limiting Middleware
app.use(rateLimitMiddleware);

// 5. Health Check
const healthHandler = (req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    service: 'ProveNance Enterprise Intelligence Gateway',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    securityGateways: {
      auth: 'JWT RS256 / OAuth2 Active',
      policyGuard: 'RBAC + ABAC Active',
      auditLog: 'SHA-256 Cryptographic Hash Chain Active',
      dataProtection: 'AES-256-GCM Column Level Active'
    }
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// 6. Mount Governed API Endpoints
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/queries', queryRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/ontology', ontologyRoutes);
app.use('/api/v1/graph', graphRoutes);
app.use('/api/v1/simulation', simulationRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/admin', adminRoutes);

// 7. Non-Leaky Error Handler (OWASP A10 / Non-disclosure)
app.use(nonLeakyErrorHandler);

// Start Server
const server = app.listen(config.port, () => {
  console.log(`\n======================================================`);
  console.log(` ProveNance™ Secure Governed Analytics Engine Online `);
  console.log(` Listening on port: ${config.port}                      `);
  console.log(` Architecture: 8-Layer Separation & 10 Security Domains`);
  console.log(`======================================================\n`);
});

export default app;
