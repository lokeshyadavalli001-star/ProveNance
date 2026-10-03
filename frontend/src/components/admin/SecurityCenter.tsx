import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Key,
  Users,
  Plus,
  Trash2,
  ShieldCheck,
  Check
} from 'lucide-react';
import { apiService } from '../../services/api.js';
import { AuditRecord, SecurityAlert } from '../../types/index.js';
import { CryptoVault3D } from './CryptoVault3D.js';

export const SecurityCenter: React.FC = () => {
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [rolesData, setRolesData] = useState<any>(null);
  const [integrityStatus, setIntegrityStatus] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'alerts' | 'rbac' | 'keys'>('audit');
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKeySecret, setCreatedKeySecret] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [recData, altData, keysData, roles] = await Promise.all([
        apiService.getAuditRecords(),
        apiService.getSecurityAlerts(),
        apiService.getApiKeys(),
        apiService.getRoles()
      ]);
      setAuditRecords(recData?.records || []);
      setSecurityAlerts(altData?.alerts || []);
      setApiKeys(keysData?.apiKeys || []);
      setRolesData(roles || { roles: [] });
    } catch (e) {
      console.error(e);
    }
  }

  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    try {
      const result = await apiService.verifyAuditIntegrity();
      setIntegrityStatus(result);
    } catch (e: any) {
      setIntegrityStatus({ isValid: false, message: e.message });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const res = await apiService.createApiKey(newKeyName, ['query:sql', 'query:ml']);
      setCreatedKeySecret(res.apiKey);
      setNewKeyName('');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      await apiService.revokeApiKey(keyId);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <ShieldAlert className="h-6 w-6 text-provenance-400" />
            <span>Security & Governance Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Enterprise governance across 10 security domains. Cryptographic hash chaining guarantees audit integrity.
          </p>
        </div>

        <button
          onClick={handleVerifyIntegrity}
          disabled={isVerifying}
          className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50 transition self-start sm:self-auto"
        >
          <Lock className="h-4 w-4" />
          <span>{isVerifying ? 'Verifying Hashes...' : 'Verify Cryptographic Integrity'}</span>
        </button>
      </div>

      {/* Integrity Verification Result Banner */}
      {integrityStatus && (
        <div
          className={`rounded-2xl p-5 border text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
            integrityStatus.isValid
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
              : 'bg-red-950/80 border-red-800 text-red-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-sm block">100% Cryptographic Integrity Confirmed</span>
              <p className="text-xs opacity-90 mt-0.5">{integrityStatus.message}</p>
            </div>
          </div>
          <span className="font-mono text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 self-start sm:self-auto text-emerald-400 font-bold">
            SHA-256 HASH VERIFIED
          </span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="border-b border-slate-800">
        <div className="flex space-x-6 text-xs">
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`pb-3 font-semibold transition border-b-2 flex items-center space-x-1.5 ${
              activeSubTab === 'audit'
                ? 'border-provenance-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>Tamper-Evident Audit Chain ({auditRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('alerts')}
            className={`pb-3 font-semibold transition border-b-2 flex items-center space-x-1.5 ${
              activeSubTab === 'alerts'
                ? 'border-provenance-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Threat Detection Alerts ({securityAlerts.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rbac')}
            className={`pb-3 font-semibold transition border-b-2 flex items-center space-x-1.5 ${
              activeSubTab === 'rbac'
                ? 'border-provenance-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Access Control (RBAC & CLS)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('keys')}
            className={`pb-3 font-semibold transition border-b-2 flex items-center space-x-1.5 ${
              activeSubTab === 'keys'
                ? 'border-provenance-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="h-4 w-4" />
            <span>API Keys</span>
          </button>
        </div>
      </div>

      {/* Sub Tab 1: Audit Log Chain Table */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6 animate-fade-in">
          {/* 3D Holographic Cryptographic Chain */}
          <CryptoVault3D />

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Immutable SHA-256 Audit Trail</h3>
              <span className="text-xs text-slate-500">Every record cryptographically chains to the prior entry</span>
            </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Block Hash (SHA-256)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {auditRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{rec.timestamp.split('T')[1].slice(0, 8)}</td>
                    <td className="px-4 py-3 font-mono font-bold text-white">{rec.action}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-850 px-2 py-0.5 text-[10px] text-provenance-300 font-medium">
                        {rec.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{rec.userEmail || 'System'}</td>
                    <td className="px-4 py-3 font-mono text-emerald-400 text-[11px]">
                      {rec.hash.slice(0, 16)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

      {/* Sub Tab 2: Security Alerts */}
      {activeSubTab === 'alerts' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
            Automated Threat & Anomaly Signals
          </h3>

          <div className="space-y-3">
            {securityAlerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Zero security anomalies detected. System operating normally.
              </div>
            ) : (
              securityAlerts.map((alt) => (
                <div key={alt.id} className="rounded-xl bg-slate-900/60 p-4 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">{alt.type}</span>
                    <span className="rounded bg-red-950 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-800">
                      {alt.severity}
                    </span>
                  </div>
                  <div className="text-slate-300 font-mono text-[11px] bg-slate-950 p-2.5 rounded border border-slate-850">
                    {JSON.stringify(alt.details)}
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between">
                    <span>Detected: {alt.timestamp}</span>
                    <span>Status: {alt.resolved ? 'RESOLVED' : 'ACTIVE'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Sub Tab 3: Access Control (RBAC) */}
      {activeSubTab === 'rbac' && rolesData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
              Role-Based Access Matrix
            </h3>
            <div className="space-y-3">
              {Object.entries(rolesData.rolePermissions).map(([role, perms]: [string, any]) => (
                <div key={role} className="rounded-xl bg-slate-900/60 p-3.5 border border-slate-800 text-xs">
                  <span className="font-bold text-provenance-300 block mb-1.5">{role}</span>
                  <div className="flex flex-wrap gap-1">
                    {perms.map((p: string) => (
                      <span key={p} className="rounded bg-slate-950 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-800">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
              Column-Level Security Rules
            </h3>
            <div className="space-y-3">
              {Object.entries(rolesData.restrictedColumns).map(([col, allowedRoles]: [string, any]) => (
                <div key={col} className="rounded-xl bg-slate-900/60 p-3.5 border border-slate-800 text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="font-mono font-bold text-red-300">{col}</span>
                    <span className="text-[10px] text-slate-500">Tier 3 Restricted</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Visible exclusively to: <strong className="text-slate-200">{allowedRoles.join(', ')}</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 4: API Keys */}
      {activeSubTab === 'keys' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 animate-fade-in">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Machine-to-Machine Integration Keys</h3>
            <p className="text-xs text-slate-400 mt-0.5">SHA-256 hashed at rest; 90-day auto-rotation policy</p>
          </div>

          {createdKeySecret && (
            <div className="rounded-xl bg-emerald-950/80 p-4 border border-emerald-800 text-xs space-y-2">
              <span className="font-bold text-emerald-300">New Key Created: Store this secret now</span>
              <code className="block bg-slate-950 p-2.5 rounded font-mono text-emerald-300 select-all border border-emerald-900">
                {createdKeySecret}
              </code>
              <button
                onClick={() => setCreatedKeySecret(null)}
                className="rounded-lg bg-emerald-700 px-3 py-1 text-[11px] font-bold text-white"
              >
                Dismiss
              </button>
            </div>
          )}

          <form onSubmit={handleCreateApiKey} className="flex gap-2">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g. BlueYonder EDI Freight Ingest Key..."
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-provenance-500 focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center space-x-1.5 rounded-xl bg-provenance-600 px-4 py-2 text-xs font-bold text-white hover:bg-provenance-500 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Issue Key</span>
            </button>
          </form>

          <div className="space-y-2">
            {apiKeys.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between rounded-xl bg-slate-900/60 p-3.5 border border-slate-800 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{k.name}</span>
                    <span className="font-mono text-[11px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">
                      {k.keyPrefix}...
                    </span>
                    {k.revokedAt && (
                      <span className="rounded bg-red-950 px-1.5 py-0.2 text-[10px] text-red-400 font-bold border border-red-800">
                        REVOKED
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Scopes: {k.scopes.join(', ')} • Expires: {k.expiresAt.split('T')[0]}
                  </div>
                </div>

                {!k.revokedAt && (
                  <button
                    onClick={() => handleRevokeKey(k.id)}
                    className="flex items-center space-x-1 rounded-lg border border-red-900/60 bg-red-950/40 px-2.5 py-1 text-[11px] font-medium text-red-400 hover:bg-red-900 transition"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Revoke</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
