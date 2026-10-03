import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, ShieldCheck, CheckCircle2, KeyRound, Play, Check, Shield } from 'lucide-react';
import { apiService } from '../../services/api.js';
import { SimulationScenario } from '../../types/index.js';
import { TiltCard } from '../common/TiltCard.js';
import { AnimatedCounter } from '../common/AnimatedCounter.js';

interface SimulationSandboxProps {
  approverEmail: string;
}

export const SimulationSandbox: React.FC<SimulationSandboxProps> = ({ approverEmail }) => {
  const [activeTab, setActiveTab] = useState<'modeler' | 'approvals'>('modeler');
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null);
  const [delayDelta, setDelayDelta] = useState(8);
  const [costMultiplier, setCostMultiplier] = useState(1.2);
  const [geo, setGeo] = useState('EMEA');
  const [isSimulating, setIsSimulating] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState(false);
  const [approvalError, setApprovalError] = useState('');
  const [signatureProof, setSignatureProof] = useState<any>(null);

  useEffect(() => {
    loadScenarios();
  }, []);

  async function loadScenarios() {
    try {
      const data = await apiService.getScenarios();
      const list = data?.scenarios || [];
      setScenarios(list);
      if (list.length > 0) {
        setSelectedScenario(list[0]);
      }
    } catch (e) {
      console.error('Failed to load scenarios', e);
    }
  }

  const handleRunCustom = async () => {
    setIsSimulating(true);
    try {
      const result = await apiService.runSimulation({
        name: `Ad-Hoc Disruption (+${delayDelta}d in ${geo})`,
        delayDaysDelta: delayDelta,
        costMultiplier: costMultiplier,
        geography: geo
      });
      setSelectedScenario(result.scenario);
      setScenarios(prev => [result.scenario, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleOpenApproval = async (scen: SimulationScenario) => {
    setSelectedScenario(scen);
    setApprovalError('');
    setApprovalSuccess(false);

    try {
      const sigData = await apiService.generateHmacSignature(scen.id, approverEmail);
      setSignatureProof(sigData);
      setApprovalModalOpen(true);
    } catch (e: any) {
      setApprovalError(e.message || 'Signature generation failed');
    }
  };

  const handleExecuteApproval = async () => {
    if (!selectedScenario || !signatureProof) return;
    setApprovalError('');

    try {
      const result = await apiService.approveMitigation(
        selectedScenario.id,
        approverEmail,
        signatureProof.signature,
        signatureProof.timestamp
      );

      if (result.success) {
        setApprovalSuccess(true);
        setSelectedScenario(result.scenario);
        loadScenarios();
      }
    } catch (err: any) {
      setApprovalError(err.message || 'Approval signature rejected');
    }
  };

  const approvedScenarios = scenarios.filter(s => s.approvalStatus === 'APPROVED');

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <SlidersHorizontal className="h-6 w-6 text-provenance-400" />
          <span>What-If Disruption Simulator</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Evaluate systemic risk before disruptions materialize. Test shipping delay shifts and safety buffer drawdowns. High-value mitigations require HMAC-SHA256 signature sign-off.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800">
        <div className="flex space-x-6 text-xs">
          <button
            onClick={() => setActiveTab('modeler')}
            className={`flex items-center space-x-2 pb-3 font-semibold transition border-b-2 ${
              activeTab === 'modeler'
                ? 'border-provenance-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Scenario Modeler & Impact</span>
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center space-x-2 pb-3 font-semibold transition border-b-2 ${
              activeTab === 'approvals'
                ? 'border-provenance-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>HMAC Authorized Actions ({approvedScenarios.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Modeler */}
      {activeTab === 'modeler' && (
        <div className="space-y-6 animate-fade-in">
          {/* Preset Scenario Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {scenarios.map((scen) => {
              const isSelected = selectedScenario?.id === scen.id;
              return (
                <TiltCard
                  key={scen.id}
                  maxTilt={10}
                  scale={1.02}
                  onClick={() => setSelectedScenario(scen)}
                  className={`rounded-xl border p-4 cursor-pointer transition ${
                    isSelected
                      ? 'border-provenance-500 bg-slate-900 shadow-md shadow-provenance-600/10'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 translate-z-10">
                    <span className="text-xs font-bold text-white truncate max-w-[180px]">{scen.name}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        scen.approvalStatus === 'APPROVED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                          : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                      }`}
                    >
                      {scen.approvalStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed translate-z-10">{scen.description}</p>
                </TiltCard>
              );
            })}
          </div>

          {/* Active Scenario Impact Evaluation */}
          {selectedScenario && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedScenario.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedScenario.description}</p>
                </div>

                {selectedScenario.approvalStatus === 'APPROVED' ? (
                  <span className="rounded-full bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-800/40 self-start sm:self-auto">
                    MITIGATION AUTHORIZED
                  </span>
                ) : (
                  <button
                    onClick={() => handleOpenApproval(selectedScenario)}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500 transition self-start sm:self-auto"
                  >
                    Authorize Mitigation Plan
                  </button>
                )}
              </div>

              {/* Key Projected Impact Metrics with 3D Depth */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <TiltCard maxTilt={8} className="rounded-xl bg-slate-900/80 p-4 border border-slate-800">
                  <span className="text-[11px] text-slate-500 block mb-1">OTIF Delivery Rate</span>
                  <div className="text-xl font-bold text-red-400">
                    <AnimatedCounter value={`${selectedScenario.simulatedMetrics.otifRate}%`} />
                  </div>
                  <span className="text-[10px] text-slate-400">Baseline: {selectedScenario.baselineMetrics.otifRate}%</span>
                </TiltCard>

                <TiltCard maxTilt={8} className="rounded-xl bg-slate-900/80 p-4 border border-slate-800">
                  <span className="text-[11px] text-slate-500 block mb-1">Projected Lead Time</span>
                  <div className="text-xl font-bold text-amber-400">
                    <AnimatedCounter value={`${selectedScenario.simulatedMetrics.avgLeadTimeDays} Days`} />
                  </div>
                  <span className="text-[10px] text-slate-400">Baseline: {selectedScenario.baselineMetrics.avgLeadTimeDays}d</span>
                </TiltCard>

                <TiltCard maxTilt={8} className="rounded-xl bg-slate-900/80 p-4 border border-slate-800">
                  <span className="text-[11px] text-slate-500 block mb-1">Financial Exposure</span>
                  <div className="text-xl font-bold text-white">
                    <AnimatedCounter value={`$${(selectedScenario.simulatedMetrics.estimatedCostUSD / 1000000).toFixed(1)}M`} />
                  </div>
                  <span className="text-[10px] text-slate-400">Cost variance</span>
                </TiltCard>

                <TiltCard maxTilt={8} className="rounded-xl bg-slate-900/80 p-4 border border-slate-800">
                  <span className="text-[11px] text-slate-500 block mb-1">Line Starvation Date</span>
                  <div className="text-base font-bold text-red-400 mt-1">
                    {selectedScenario.projectedStarvationDate}
                  </div>
                </TiltCard>
              </div>

              {/* AI Recommended Mitigation Plan */}
              <div className="rounded-xl bg-slate-900/80 p-4 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-provenance-400 uppercase tracking-wider block">
                  Recommended Action Plan
                </span>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3.5 rounded-lg border border-slate-800/80">
                  {selectedScenario.recommendedMitigation}
                </p>
              </div>

              {/* Collapsible Ad-Hoc Modeler */}
              <div className="rounded-xl bg-slate-900/40 p-4 border border-slate-800/80 space-y-4">
                <span className="text-xs font-bold text-slate-300 block">Tweak Simulation Variables:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Delay Deviation: +{delayDelta} Days</label>
                    <input
                      type="range"
                      min="1"
                      max="25"
                      value={delayDelta}
                      onChange={(e) => setDelayDelta(Number(e.target.value))}
                      className="w-full accent-provenance-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Cost Factor: {costMultiplier}x</label>
                    <input
                      type="range"
                      min="1.0"
                      max="2.0"
                      step="0.05"
                      value={costMultiplier}
                      onChange={(e) => setCostMultiplier(Number(e.target.value))}
                      className="w-full accent-provenance-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleRunCustom}
                      disabled={isSimulating}
                      className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2 text-xs font-semibold text-white border border-slate-700 transition"
                    >
                      {isSimulating ? 'Simulating...' : 'Recompute Model'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Approvals Audit Trail */}
      {activeTab === 'approvals' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 animate-fade-in">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Cryptographic Mitigation Authorizations</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Approved operational mitigations are cryptographically signed using HMAC-SHA256 with non-repudiation timestamps.
            </p>
          </div>

          <div className="space-y-3">
            {approvedScenarios.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No mitigations have been authorized yet.
              </div>
            ) : (
              approvedScenarios.map((scen) => (
                <div key={scen.id} className="rounded-xl bg-slate-900/60 p-4 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{scen.name}</span>
                    <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800/40">
                      HMAC-SHA256 VERIFIED
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{scen.recommendedMitigation}</p>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-850">
                    <span>Authorized by: <strong className="text-slate-300">{scen.approvedBy}</strong></span>
                    <span>Committed at: {scen.approvalTimestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* HMAC Cryptographic Signature Approval Modal */}
      {approvalModalOpen && signatureProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400">
              <KeyRound className="h-5 w-5" />
              <h3 className="text-base font-bold text-white">Authorize Disruption Mitigation</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Authorizing will execute contingent freight rerouting in SAP & TMS for <strong className="text-white">{selectedScenario?.name}</strong>.
            </p>

            {approvalError && (
              <div className="rounded-lg bg-red-950/80 p-3 border border-red-800 text-xs text-red-200">
                {approvalError}
              </div>
            )}

            {approvalSuccess ? (
              <div className="rounded-xl bg-emerald-950/60 p-4 border border-emerald-800 text-xs text-emerald-300 space-y-2">
                <div className="flex items-center space-x-2 font-bold">
                  <Check className="h-4 w-4" />
                  <span>Mitigation Successfully Authorized!</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Cryptographic HMAC signature committed to immutable audit trail.
                </p>
                <button
                  onClick={() => setApprovalModalOpen(false)}
                  className="mt-2 w-full rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Approver:</span>
                    <span className="text-slate-200">{approverEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">HMAC-SHA256 Signature:</span>
                    <code className="block bg-slate-900 p-2 rounded text-[10px] text-emerald-400 break-all border border-slate-800">
                      {signatureProof.signature}
                    </code>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setApprovalModalOpen(false)}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteApproval}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30"
                  >
                    Confirm & Sign
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
