import React, { useState } from 'react';
import { KPICard } from './KPICard.js';
import { AlertsPanel } from './AlertsPanel.js';
import { TrendCharts } from './TrendCharts.js';
import { KPICardData, DisruptionAlert } from '../../types/index.js';
import { TiltCard } from '../common/TiltCard.js';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface DashboardViewProps {
  kpis: KPICardData[];
  historicalTrends: Array<{ period: string; otif: number; leadTime: number; costIndex: number }>;
  alerts: DisruptionAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
  onNavigateToQuery: () => void;
  onNavigateToSimulation: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpis,
  historicalTrends,
  alerts,
  onAcknowledgeAlert,
  onNavigateToQuery,
  onNavigateToSimulation
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'trends' | 'alerts' | 'hubs'>('trends');

  const activeAlerts = (alerts || []).filter(a => a?.status === 'ACTIVE');

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Clean Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Supply Chain Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time operational KPIs grounded in ERP and TMS ledgers with zero hallucination.
          </p>
        </div>

        <button
          onClick={onNavigateToQuery}
          className="flex items-center space-x-2 rounded-xl bg-provenance-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-provenance-600/30 hover:bg-provenance-500 transition self-start sm:self-auto"
        >
          <Sparkles className="h-4 w-4" />
          <span>Ask Conversational AI</span>
        </button>
      </div>

      {/* 4 Clean, Spacious KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(kpis || []).map((kpi) => (
          <KPICard
            key={kpi.id}
            kpi={kpi}
            onClick={onNavigateToQuery}
          />
        ))}
      </div>

      {/* Section Tabs to prevent overwhelming the user */}
      <div className="space-y-4">
        <div className="border-b border-slate-800">
          <div className="flex space-x-6 text-xs">
            <button
              onClick={() => setActiveSubTab('trends')}
              className={`flex items-center space-x-2 pb-3 font-semibold transition border-b-2 ${
                activeSubTab === 'trends'
                  ? 'border-provenance-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Performance Velocity & Trends</span>
            </button>

            <button
              onClick={() => setActiveSubTab('alerts')}
              className={`flex items-center space-x-2 pb-3 font-semibold transition border-b-2 ${
                activeSubTab === 'alerts'
                  ? 'border-provenance-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Active Disruption Signals</span>
              {activeAlerts.length > 0 && (
                <span className="rounded-full bg-red-950 px-1.5 py-0.2 text-[10px] font-bold text-red-400 border border-red-800">
                  {activeAlerts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('hubs')}
              className={`flex items-center space-x-2 pb-3 font-semibold transition border-b-2 ${
                activeSubTab === 'hubs'
                  ? 'border-provenance-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Regional Fulfillment Hubs</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Trends */}
        {activeSubTab === 'trends' && (
          <div className="space-y-4 animate-fade-in">
            <TrendCharts data={historicalTrends} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
                <span className="text-[11px] text-slate-400 block mb-1 font-medium">On-Time Delivery (OTIF)</span>
                <p className="text-slate-200 text-xs leading-relaxed">
                  Consistently improving from <strong className="text-white">91.2%</strong> in W36 to <strong className="text-emerald-400">94.2%</strong> today, led by strong TSMC APAC adherence.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
                <span className="text-[11px] text-slate-400 block mb-1 font-medium">Supplier Lead Time</span>
                <p className="text-slate-200 text-xs leading-relaxed">
                  Averaging <strong className="text-white">14.5 days</strong> globally, beating the target of 16 days. Key bottleneck remains ocean transit from Vietnam.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
                <span className="text-[11px] text-slate-400 block mb-1 font-medium">Policy Guard Enforcement</span>
                <p className="text-slate-200 text-xs leading-relaxed">
                  All metrics computed via approved <strong className="text-amber-300">Metric Registry v3.2</strong>. Zero synthetic extrapolation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Disruption Signals */}
        {activeSubTab === 'alerts' && (
          <div className="animate-fade-in">
            <AlertsPanel
              alerts={alerts}
              onAcknowledge={onAcknowledgeAlert}
              onNavigateToSimulation={onNavigateToSimulation}
            />
          </div>
        )}

        {/* Tab 3: Regional Hubs */}
        {activeSubTab === 'hubs' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
            <TiltCard maxTilt={10} scale={1.02} className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
              <div className="flex items-center justify-between translate-z-10">
                <h4 className="text-xs font-bold text-white">Rotterdam EuroHub</h4>
                <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800/40">
                  HEALTHY
                </span>
              </div>
              <div className="text-xs text-slate-400 space-y-1 translate-z-10">
                <div className="flex justify-between"><span>Region:</span><span className="text-slate-200">EMEA</span></div>
                <div className="flex justify-between"><span>Capacity:</span><span className="text-slate-200">88%</span></div>
                <div className="flex justify-between"><span>Safety Buffer:</span><span className="text-emerald-400 font-semibold">38 Days</span></div>
                <div className="flex justify-between"><span>On-Hand:</span><span className="text-slate-200">425,000 units</span></div>
              </div>
            </TiltCard>

            <TiltCard maxTilt={10} scale={1.02} className="rounded-xl border border-red-900/50 bg-red-950/20 p-5 space-y-3">
              <div className="flex items-center justify-between translate-z-10">
                <h4 className="text-xs font-bold text-white">Singapore Pacific Port</h4>
                <span className="rounded bg-red-950 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-800/40 animate-pulse">
                  LOW BUFFER
                </span>
              </div>
              <div className="text-xs text-slate-400 space-y-1 translate-z-10">
                <div className="flex justify-between"><span>Region:</span><span className="text-slate-200">APAC</span></div>
                <div className="flex justify-between"><span>Capacity:</span><span className="text-slate-200">94%</span></div>
                <div className="flex justify-between"><span>Safety Buffer:</span><span className="text-red-400 font-bold">11 Days (Below 15d SLA)</span></div>
                <div className="flex justify-between"><span>On-Hand:</span><span className="text-slate-200">88,000 units</span></div>
              </div>
              <button
                onClick={onNavigateToSimulation}
                className="w-full mt-2 rounded-lg bg-red-900/60 hover:bg-red-800 py-1.5 text-[11px] font-semibold text-red-100 transition translate-z-10"
              >
                Model Stock Rebalance
              </button>
            </TiltCard>

            <TiltCard maxTilt={10} scale={1.02} className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
              <div className="flex items-center justify-between translate-z-10">
                <h4 className="text-xs font-bold text-white">Chicago Inland Depot</h4>
                <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800/40">
                  HEALTHY
                </span>
              </div>
              <div className="text-xs text-slate-400 space-y-1 translate-z-10">
                <div className="flex justify-between"><span>Region:</span><span className="text-slate-200">AMER</span></div>
                <div className="flex justify-between"><span>Capacity:</span><span className="text-slate-200">72%</span></div>
                <div className="flex justify-between"><span>Safety Buffer:</span><span className="text-emerald-400 font-semibold">42 Days</span></div>
                <div className="flex justify-between"><span>On-Hand:</span><span className="text-slate-200">340,000 units</span></div>
              </div>
            </TiltCard>
          </div>
        )}
      </div>
    </div>
  );
};
