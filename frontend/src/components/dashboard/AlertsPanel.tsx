import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle, ArrowRight } from 'lucide-react';
import { DisruptionAlert } from '../../types/index.js';

interface AlertsPanelProps {
  alerts: DisruptionAlert[];
  onAcknowledge: (alertId: string) => void;
  onNavigateToSimulation: () => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onAcknowledge,
  onNavigateToSimulation
}) => {
  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />;
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-950 text-red-400 border-red-800/60';
      case 'WARNING':
        return 'bg-amber-950 text-amber-400 border-amber-800/60';
      default:
        return 'bg-blue-950 text-blue-400 border-blue-800/60';
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-bold text-white">Real-Time Disruption Signals</h3>
          <span className="rounded-full bg-red-950 px-2 py-0.5 text-[10px] font-semibold text-red-400 border border-red-800/50">
            {alerts.length} Active
          </span>
        </div>
        <button
          onClick={onNavigateToSimulation}
          className="flex items-center space-x-1 text-xs font-semibold text-provenance-400 hover:text-provenance-300"
        >
          <span>Model What-If Scenarios</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
            <p className="text-xs">Zero active disruption alerts across all operational lanes.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-lg border border-slate-800/80 bg-slate-950/80 p-4 transition hover:border-slate-700"
            >
              <div className="flex items-start space-x-3">
                {getSeverityIcon(alert.severity)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{alert.title}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-slate-400">{alert.geography}</span>
                    </div>
                  </div>

                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">{alert.description}</p>

                  <div className="mt-2.5 rounded bg-slate-900 p-2 text-[11px] border border-slate-800 text-slate-300">
                    <strong className="text-provenance-400">Recommended Action: </strong>
                    {alert.recommendedAction}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-900">
                    <span>Deficit Exposure: <strong className="text-white">{alert.potentialImpactUnits.toLocaleString()} units</strong></span>
                    <div className="flex items-center space-x-2">
                      {alert.status === 'ACTIVE' && (
                        <button
                          onClick={() => onAcknowledge(alert.id)}
                          className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 hover:bg-slate-700 transition"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={onNavigateToSimulation}
                        className="rounded bg-provenance-600 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-provenance-500 transition"
                      >
                        Simulate Mitigation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
