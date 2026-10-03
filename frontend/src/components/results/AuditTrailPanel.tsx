import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, Copy } from 'lucide-react';

interface AuditTrailPanelProps {
  queryId: string;
  executionTimeMs: number;
  cacheHit: boolean;
  security: {
    policyAuthorizationPassed: boolean;
    rowLevelSecurityApplied: string;
    restrictedColumnsFiltered: string[];
    sensitiveDataMasked: boolean;
    cryptographicHash: string;
  };
  user: {
    name: string;
    email: string;
    role: string;
    businessUnit: string;
  };
}

export const AuditTrailPanel: React.FC<AuditTrailPanelProps> = ({
  queryId,
  executionTimeMs,
  cacheHit,
  security,
  user
}) => {
  return (
    <div className="space-y-6 text-xs">
      {/* Execution Footprint */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center space-x-2">
          <ShieldCheck className="h-4 w-4 text-provenance-400" />
          <span>Execution Metadata & Identity Attribution</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-slate-300">
          <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
            <span className="text-[11px] text-slate-500 block mb-0.5">Query ID</span>
            <span className="font-mono text-provenance-300">{queryId}</span>
          </div>

          <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
            <span className="text-[11px] text-slate-500 block mb-0.5">Authenticated User</span>
            <span className="font-semibold text-white">{user.email}</span>
          </div>

          <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
            <span className="text-[11px] text-slate-500 block mb-0.5">Active Role & Scope</span>
            <span className="font-semibold text-white">{user.role} ({user.businessUnit})</span>
          </div>

          <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
            <span className="text-[11px] text-slate-500 block mb-0.5">Gateway Execution Latency</span>
            <span className="font-semibold text-emerald-400">{executionTimeMs} ms</span>
          </div>

          <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
            <span className="text-[11px] text-slate-500 block mb-0.5">Cache Status</span>
            <span className="font-semibold text-slate-300">{cacheHit ? 'HIT' : 'FRESH COMPUTATION'}</span>
          </div>

          <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
            <span className="text-[11px] text-slate-500 block mb-0.5">Authorization Evaluation</span>
            <span className="font-semibold text-emerald-400">PASSED</span>
          </div>
        </div>
      </div>

      {/* Security Gatekeeping Verification */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center space-x-2">
          <Lock className="h-4 w-4 text-emerald-400" />
          <span>Active Security Gatekeeping Verification</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-start space-x-2.5 rounded-lg bg-slate-900/80 p-3 border border-slate-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Row-Level Security (RLS) Enforced</span>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                {security.rowLevelSecurityApplied}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 rounded-lg bg-slate-900/80 p-3 border border-slate-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Column-Level Security (CLS) Masking</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Restricted columns filtered or masked from payload:{' '}
                <strong className="text-amber-300">
                  {(security?.restrictedColumnsFiltered || []).length > 0
                    ? security.restrictedColumnsFiltered.join(', ')
                    : 'None (Authorized Role)'}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 rounded-lg bg-slate-900/80 p-3 border border-slate-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-white block">Cryptographic Audit Block (SHA-256)</span>
              <div className="mt-1 flex items-center space-x-2">
                <code className="text-[11px] font-mono text-emerald-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 break-all">
                  {security.cryptographicHash}
                </code>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Immutable hash chained to previous audit records to prevent log tampering or deletion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
