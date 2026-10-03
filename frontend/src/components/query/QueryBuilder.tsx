import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  ShieldCheck,
  Cpu,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lock
} from 'lucide-react';
import { apiService } from '../../services/api.js';
import { GovernedQueryResult } from '../../types/index.js';
import { TiltCard } from '../common/TiltCard.js';

interface QueryBuilderProps {
  onQueryExecuted: (result: GovernedQueryResult) => void;
  activeBusinessUnits: string[];
  activeRole: string;
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({
  onQueryExecuted,
  activeBusinessUnits,
  activeRole
}) => {
  const [question, setQuestion] = useState('Which suppliers have delivery delays exceeding 5 days?');
  const [geography, setGeography] = useState<string>('ALL');
  const [showUnderTheHood, setShowUnderTheHood] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const promptCategories = [
    {
      category: 'Delivery Adherence',
      prompt: 'Which suppliers have delivery delays exceeding 5 days?'
    },
    {
      category: 'OTIF Performance',
      prompt: 'What is our OTIF rate across EMEA distribution centers?'
    },
    {
      category: 'Stockout Exposure',
      prompt: 'Which warehouses are at critical stockout risk within 30 days?'
    },
    {
      category: 'Supplier Health',
      prompt: 'Compare top suppliers by composite health score and lead time'
    }
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    setError('');
    setIsLoading(true);

    try {
      const result = await apiService.submitQuery(question, {
        geography: geography === 'ALL' ? undefined : geography
      });
      onQueryExecuted(result);
    } catch (err: any) {
      setError(err.message || 'Query execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Preview calculations
  const isDelayQuery = question.toLowerCase().includes('delay') || question.toLowerCase().includes('late');
  const isStockoutQuery = question.toLowerCase().includes('stockout') || question.toLowerCase().includes('inventory');
  const previewIntent = isStockoutQuery
    ? 'STOCKOUT_RISK_PREDICTION'
    : isDelayQuery
    ? 'SUPPLIER_DELIVERY_DELAYS'
    : 'COMPOSITE_RISK_ASSESSMENT';
  const previewTool = isStockoutQuery ? 'ML Forecaster' : isDelayQuery ? 'SQL Analytical Engine' : 'Knowledge Graph';
  const previewMetric = isStockoutQuery ? 'STOCKOUT_RISK' : 'OTIF';

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Title & Introduction */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center space-x-1.5 rounded-full bg-provenance-950/80 px-3 py-1 text-xs font-semibold text-provenance-300 border border-provenance-800/60 mb-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Governed Conversational Decision Intelligence</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Ask Anything About Your Supply Chain
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Questions are strictly validated and routed to operational engines. Answers cite official metrics, apply Row-Level Security, and mask confidential columns.
        </p>
      </div>

      {/* Main Spacious Prompt Input Container */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl space-y-4">
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value.substring(0, 2000))}
            placeholder="e.g. Which suppliers in EMEA have delivery delays over 5 days?"
            rows={3}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950 p-4 text-sm text-white placeholder-slate-500 focus:border-provenance-500 focus:outline-none focus:ring-2 focus:ring-provenance-500/20 transition resize-none leading-relaxed"
          />

          <div className="absolute right-3 bottom-3 text-[11px] text-slate-500 font-mono">
            {question.length}/2000
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 rounded-lg bg-red-950/80 border border-red-800 p-3 text-xs text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Pills & Submit Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Scope:</span>
            {['ALL', 'EMEA', 'APAC', 'AMER'].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGeography(g)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  geography === g
                    ? 'bg-provenance-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {question && (
              <button
                type="button"
                onClick={() => setQuestion('')}
                className="rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
              >
                Clear
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="flex items-center space-x-2 rounded-xl bg-provenance-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-provenance-600/30 hover:bg-provenance-500 disabled:opacity-50 transition"
            >
              {isLoading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Planning Query...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Ask ProveNance</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Suggested Prompts Cards */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 block text-center sm:text-left">
          Suggested Operational Queries:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {promptCategories.map((item, idx) => (
            <TiltCard
              key={idx}
              maxTilt={8}
              scale={1.02}
              onClick={() => setQuestion(item.prompt)}
              className="flex flex-col text-left rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 hover:border-provenance-500 hover:bg-slate-900/90 transition cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between mb-1 translate-z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-provenance-400">
                  {item.category}
                </span>
                <span className="text-[10px] text-slate-500 group-hover:text-provenance-300 transition">
                  Click to Ask →
                </span>
              </div>
              <span className="text-xs text-slate-200 group-hover:text-white transition line-clamp-1 font-medium translate-z-10">
                "{item.prompt}"
              </span>
            </TiltCard>
          ))}
        </div>
      </div>

      {/* Collapsible Under-the-Hood Policy Guard Inspector */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowUnderTheHood(!showUnderTheHood)}
          className="w-full flex items-center justify-between p-4 text-xs font-semibold text-slate-300 hover:bg-slate-900/60 transition"
        >
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Under The Hood: Policy Guard & Query Plan Inspection</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
            <span>{showUnderTheHood ? 'Hide Technical Details' : 'Show Governance & Inspection Pipeline'}</span>
            {showUnderTheHood ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </button>

        {showUnderTheHood && (
          <div className="p-5 border-t border-slate-800 bg-slate-900/40 space-y-4 animate-fade-in text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Recognized Intent</span>
                <span className="font-mono text-provenance-300 font-semibold">{previewIntent}</span>
              </div>
              <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Routed Engine</span>
                <span className="font-semibold text-white">{previewTool}</span>
              </div>
              <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Active Metric</span>
                <span className="font-mono text-amber-300 font-semibold">{previewMetric} Standard</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800 text-[11px] text-slate-400 space-y-1.5 font-mono">
              <div>
                <span className="text-slate-500">Row-Level Security: </span>
                <span className="text-emerald-400">WHERE business_unit IN ('{activeBusinessUnits.join("', '")}')</span>
              </div>
              <div>
                <span className="text-slate-500">Column-Level Security: </span>
                <span className="text-amber-300">{activeRole === 'ADMIN' ? 'All Columns Permitted' : 'Masking Sensitive Bank & Pricing Data'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
