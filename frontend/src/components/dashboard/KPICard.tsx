import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { KPICardData } from '../../types/index.js';
import { TiltCard } from '../common/TiltCard.js';
import { AnimatedCounter } from '../common/AnimatedCounter.js';

interface KPICardProps {
  kpi: KPICardData;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({ kpi, onClick }) => {
  const severityBorders = {
    normal: 'border-slate-800 bg-slate-900/90 hover:border-provenance-500/50 hover:shadow-lg hover:shadow-provenance-500/10',
    warning: 'border-amber-900/60 bg-amber-950/20 hover:border-amber-600/80 hover:shadow-lg hover:shadow-amber-500/10',
    critical: 'border-red-900/60 bg-red-950/20 hover:border-red-600/80 hover:shadow-lg hover:shadow-red-500/10'
  };

  const severityBadges = {
    normal: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40',
    warning: 'bg-amber-950/80 text-amber-400 border border-amber-800/40',
    critical: 'bg-red-950/80 text-red-400 border border-red-800/40 animate-pulse'
  };

  return (
    <TiltCard
      onClick={onClick}
      maxTilt={10}
      glareOpacity={0.16}
      className={`rounded-2xl border p-5 shadow-sm transition-colors duration-200 cursor-pointer ${
        severityBorders[kpi.severity || 'normal']
      }`}
    >
      <div className="flex items-center justify-between translate-z-10">
        <span className="text-xs font-semibold text-slate-400 tracking-wide">{kpi.label}</span>
        {kpi.severity && kpi.severity !== 'normal' && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${severityBadges[kpi.severity]}`}>
            {kpi.severity}
          </span>
        )}
      </div>

      <div className="mt-3.5 flex items-baseline space-x-2 translate-z-20">
        <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm font-sans">
          <AnimatedCounter value={kpi.value} />
        </span>
        {kpi.unit && <span className="text-sm font-semibold text-slate-400">{kpi.unit}</span>}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs translate-z-10">
        {kpi.trend && (
          <div className={`flex items-center font-bold px-1.5 py-0.5 rounded ${
            kpi.trend.direction === 'up'
              ? 'text-emerald-400 bg-emerald-950/40'
              : 'text-provenance-400 bg-provenance-950/40'
          }`}>
            {kpi.trend.direction === 'up' ? (
              <ArrowUpRight className="h-4 w-4 mr-0.5" />
            ) : (
              <ArrowDownRight className="h-4 w-4 mr-0.5" />
            )}
            <span>{kpi.trend.percentage}%</span>
          </div>
        )}
        {kpi.subtext && (
          <span className="text-[11px] text-slate-400 font-medium truncate ml-2">
            {kpi.subtext}
          </span>
        )}
      </div>
    </TiltCard>
  );
};
