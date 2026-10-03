import React from 'react';
import { Database, CheckCircle2, ShieldCheck, BookOpen, Layers } from 'lucide-react';
import { EvidenceStep } from '../../types/index.js';

interface EvidencePanelProps {
  evidenceChain: EvidenceStep[];
  dataSources: Array<{ name: string; system: string; lastUpdated: string; confidence: number }>;
  metric: {
    name: string;
    code: string;
    owner: string;
    formula: string;
    version: string;
    lastUpdated: string;
  };
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  evidenceChain,
  dataSources,
  metric
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Calculation Chain */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center space-x-2">
          <Layers className="h-4 w-4 text-provenance-400" />
          <span>Multi-Step Grounded Calculation Chain</span>
        </h3>

        <div className="space-y-4">
          {(evidenceChain || []).map((step) => (
            <div key={step.step} className="flex items-start space-x-3 text-xs">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-provenance-600 font-bold text-white text-[11px]">
                {step.step}
              </span>
              <div className="flex-1 rounded-lg bg-slate-900/80 p-3.5 border border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white">{step.description}</span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-provenance-300 border border-slate-700">
                    {step.sourceEngine}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{step.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Data Sources & Provenance */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center space-x-2">
          <Database className="h-4 w-4 text-emerald-400" />
          <span>Data Sources Lineage & Confidence Metrics</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {(dataSources || []).map((ds, idx) => (
            <div key={idx} className="rounded-lg bg-slate-900/80 p-3.5 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-white">{ds.name}</span>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-emerald-400 font-semibold border border-emerald-900/50">
                  {Math.round(ds.confidence * 100)}% Confidence
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>System: {ds.system}</span>
                <span>Freshness: {ds.lastUpdated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Approved Metric Definition (Single Source of Truth) */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Approved Metric Registry Standard: {metric.name} ({metric.code})
            </h3>
          </div>
          <span className="rounded bg-amber-950/80 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-800/40">
            v{metric.version}
          </span>
        </div>

        <div className="rounded-lg bg-slate-900 p-3.5 border border-slate-800 text-xs space-y-2">
          <div>
            <span className="text-slate-400 text-[11px] block">Approved Business Formula:</span>
            <code className="block mt-1 font-mono text-emerald-300 bg-slate-950 p-2 rounded text-[11px] overflow-x-auto">
              {metric.formula}
            </code>
          </div>

          <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <div>
              <span>Governance Council Owner: </span>
              <strong className="text-slate-200 block">{metric.owner}</strong>
            </div>
            <div>
              <span>Last Metric Review: </span>
              <strong className="text-slate-200 block">{metric.lastUpdated}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
