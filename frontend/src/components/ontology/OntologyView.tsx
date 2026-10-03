import React, { useState, useEffect } from 'react';
import { BookOpen, Shield, Layers, CheckCircle2, Lock } from 'lucide-react';
import { apiService } from '../../services/api.js';
import { MetricDefinition } from '../../types/index.js';

export const OntologyView: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricDefinition[]>([]);
  const [ontology, setOntology] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [ontData, metricsData] = await Promise.all([
          apiService.getOntology(),
          apiService.getMetrics()
        ]);
        setOntology(ontData);
        setMetrics(metricsData?.registry || []);
      } catch (e) {
        console.error('Failed to load ontology', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading Supply Chain Ontology...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-provenance-400" />
          <span>Semantic Layer & Supply Chain Ontology</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          The ontology formalizes business semantics across enterprise data silos. Operational truth lives in source systems; ontology defines meaning; centralized metric definitions prevent LLM invention.
        </p>
      </div>

      {/* 1. Approved Metric Registry */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Official Metric Registry (Single Source of Truth)</h3>
            <p className="text-[11px] text-slate-400">Approved formulas ratified by the Enterprise Data Governance Board</p>
          </div>
          <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-800/40">
            MANDATORY GOVERNANCE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Metric Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Approved Formula</th>
                <th className="px-4 py-3">Council Owner</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Security Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {(metrics || []).map((m) => (
                <tr key={m.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-bold text-white whitespace-nowrap">{m.name}</td>
                  <td className="px-4 py-3 font-mono text-provenance-400">{m.code}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-emerald-300 max-w-xs truncate" title={m.formula}>
                    {m.formula}
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{m.owner}</td>
                  <td className="px-4 py-3 font-semibold text-slate-200">{m.targetBenchmark}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        m.classificationTier === 'RESTRICTED'
                          ? 'bg-red-950 text-red-400 border border-red-800/40'
                          : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                      }`}
                    >
                      {m.classificationTier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Semantic Concepts Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Ontology Semantic Entities & Attributes</h3>
          <p className="text-[11px] text-slate-400">Entity specifications with field-level classification tags</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ontology?.concepts?.map((c: any) => (
            <div key={c.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{c.name}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    c.classificationTier === 'RESTRICTED'
                      ? 'bg-red-950 text-red-400 border border-red-800/40'
                      : c.classificationTier === 'CONFIDENTIAL'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                  }`}
                >
                  {c.classificationTier}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">{c.description}</p>

              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Attributes & Sensitivity
                </span>
                <div className="space-y-1">
                  {c.attributes?.map((attr: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between rounded bg-slate-950 px-2 py-1 text-[11px]">
                      <span className="font-mono text-slate-300">{attr.name}</span>
                      <span
                        className={`text-[9px] font-semibold px-1 rounded ${
                          attr.tier === 'RESTRICTED'
                            ? 'text-red-400'
                            : attr.tier === 'CONFIDENTIAL'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {attr.tier}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Semantic Relationships
                </span>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {c.relationships?.map((rel: any, idx: number) => (
                    <span key={idx} className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-provenance-300">
                      -{rel.predicate}&gt; {rel.targetConcept}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
