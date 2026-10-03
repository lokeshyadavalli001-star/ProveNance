import React, { useState } from 'react';
import { ResultsTable } from './ResultsTable.js';
import { EvidencePanel } from './EvidencePanel.js';
import { AuditTrailPanel } from './AuditTrailPanel.js';
import { GovernedQueryResult } from '../../types/index.js';
import { Table, Layers, ShieldCheck, Sparkles, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { TiltCard } from '../common/TiltCard.js';

interface ResultsViewProps {
  result: GovernedQueryResult | null;
  onNewQuery: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, onNewQuery }) => {
  const [activeTab, setActiveTab] = useState<'table' | 'evidence' | 'audit'>('table');

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center rounded-2xl border border-slate-800 bg-slate-900/40 max-w-2xl mx-auto my-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-provenance-600/20 text-provenance-400 mb-4 border border-provenance-500/30">
          <Sparkles className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-white">No Active Query Selected</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1.5 mb-6 leading-relaxed">
          Ask a conversational question in the AI Assistant tab to inspect verified operational evidence and cryptographic audit records.
        </p>
        <button
          onClick={onNewQuery}
          className="rounded-xl bg-provenance-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-provenance-600/30 hover:bg-provenance-500 transition"
        >
          Open AI Assistant
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Top AI Narrative Summary Card with 3D Parallax */}
      <TiltCard maxTilt={5} scale={1.01} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3 translate-z-10">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-provenance-600/20 text-provenance-400 border border-provenance-500/30">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-provenance-400 block">
                Grounded Operational Intelligence
              </span>
              <h3 className="text-sm font-bold text-white">"{result.question}"</h3>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs self-start sm:self-auto">
            <span className="flex items-center space-x-1 text-slate-400 text-[11px]">
              <Clock className="h-3.5 w-3.5" />
              <span>{result.executionTimeMs} ms</span>
            </span>
            <span className="flex items-center space-x-1 text-emerald-400 font-semibold text-[11px]">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Grounded Evidence</span>
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800/80 translate-z-10">
          {result.summaryAnswer}
        </p>
      </TiltCard>

      {/* Main Tabs Navigation */}
      <div className="border-b border-slate-800">
        <div className="flex space-x-8 text-xs">
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center space-x-2 pb-3 font-bold transition border-b-2 ${
              activeTab === 'table'
                ? 'border-provenance-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="h-4 w-4" />
            <span>Structured Data Table ({result.rows.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`flex items-center space-x-2 pb-3 font-bold transition border-b-2 ${
              activeTab === 'evidence'
                ? 'border-provenance-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Evidence & Calculation Chain</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center space-x-2 pb-3 font-bold transition border-b-2 ${
              activeTab === 'audit'
                ? 'border-provenance-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Cryptographic Audit Proof</span>
          </button>
        </div>
      </div>

      {/* Active Tab Panel */}
      <div>
        {activeTab === 'table' && (
          <ResultsTable
            queryId={result.queryId}
            columns={result.columns}
            rows={result.rows}
            restrictedColumnsFiltered={result.security.restrictedColumnsFiltered}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidencePanel
            evidenceChain={result.evidenceChain}
            dataSources={result.dataSources}
            metric={result.metric}
          />
        )}

        {activeTab === 'audit' && (
          <AuditTrailPanel
            queryId={result.queryId}
            executionTimeMs={result.executionTimeMs}
            cacheHit={result.cacheHit}
            security={result.security}
            user={result.user}
          />
        )}
      </div>
    </div>
  );
};
