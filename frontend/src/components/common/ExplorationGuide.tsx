import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Share2,
  SlidersHorizontal,
  ShieldCheck,
  LayoutDashboard,
  MessageSquareCode,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { MainNavTab } from './Navbar.js';
import { TiltCard } from './TiltCard.js';

interface ExplorationGuideProps {
  currentTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
}

interface WorkspaceStep {
  id: MainNavTab;
  label: string;
  shortHint: string;
  icon: any;
}

const WORKSPACE_STEPS: WorkspaceStep[] = [
  {
    id: 'dashboard',
    label: 'Overview',
    shortHint: 'Executive KPIs & trend velocity',
    icon: LayoutDashboard
  },
  {
    id: 'network',
    label: 'Supply Network',
    shortHint: '3D Globe & real-world port map',
    icon: Share2
  },
  {
    id: 'query',
    label: 'AI Assistant',
    shortHint: 'Conversational governed queries',
    icon: MessageSquareCode
  },
  {
    id: 'results',
    label: 'Evidence & Results',
    shortHint: 'Zero-hallucination calculation trail',
    icon: FileSpreadsheet
  },
  {
    id: 'simulation',
    label: 'Scenarios',
    shortHint: 'What-If disruption sandbox',
    icon: SlidersHorizontal
  },
  {
    id: 'security',
    label: 'Security & Trust',
    shortHint: '3D Cryptographic audit vault',
    icon: ShieldCheck
  }
];

export const ExplorationGuide: React.FC<ExplorationGuideProps> = ({
  currentTab,
  onSelectTab
}) => {
  const [visitedTabs, setVisitedTabs] = useState<Set<MainNavTab>>(() => new Set([currentTab]));
  const [isMinimized, setIsMinimized] = useState(true);

  useEffect(() => {
    setVisitedTabs((prev) => {
      const next = new Set(prev);
      next.add(currentTab);
      return next;
    });
  }, [currentTab]);

  // Find next unvisited step
  const nextUnvisited = WORKSPACE_STEPS.find((s) => !visitedTabs.has(s.id));
  const progressPercent = Math.round((visitedTabs.size / WORKSPACE_STEPS.length) * 100);

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 flex items-center space-x-2 rounded-full bg-slate-900/90 border border-provenance-500/40 px-3.5 py-2 text-xs font-semibold text-slate-200 shadow-xl backdrop-blur-md hover:border-provenance-400 hover:text-white hover:bg-slate-850 hover:shadow-provenance-500/20 transition group"
        title="Open interactive platform tour guide"
      >
        <Compass className="h-4 w-4 text-provenance-400 group-hover:rotate-45 transition-transform duration-300" />
        <span>Platform Tour ({visitedTabs.size}/{WORKSPACE_STEPS.length})</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full animate-fade-in pointer-events-auto">
      <TiltCard
        maxTilt={6}
        scale={1.01}
        className="rounded-2xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-xl p-4 shadow-2xl space-y-3"
      >
        {/* Header Strip */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 translate-z-10">
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-provenance-600/20 text-provenance-400 border border-provenance-500/30">
              <Compass className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide">
              Platform Journey Guide
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono text-provenance-300 bg-provenance-950/80 px-2 py-0.5 rounded border border-provenance-800/40 font-bold">
              {visitedTabs.size} of {WORKSPACE_STEPS.length} Explored
            </span>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-slate-400 hover:text-white text-xs p-1"
              title="Minimize guide"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 translate-z-10">
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-provenance-600 via-provenance-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Workspace Quick-Access Pill Dots */}
        <div className="flex items-center justify-between gap-1 pt-0.5 translate-z-10">
          {WORKSPACE_STEPS.map((step) => {
            const isVisited = visitedTabs.has(step.id);
            const isCurrent = currentTab === step.id;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => onSelectTab(step.id)}
                title={`${step.label}: ${step.shortHint}`}
                className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-lg border transition ${
                  isCurrent
                    ? 'border-provenance-500 bg-provenance-600/20 text-white shadow-sm'
                    : isVisited
                    ? 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    : 'border-slate-800/60 bg-slate-950/30 text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isCurrent ? 'text-provenance-400' : isVisited ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="text-[9px] truncate mt-0.5 max-w-[42px]">{step.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Next Suggested Exploration Step Invitation */}
        {nextUnvisited ? (
          <div
            onClick={() => onSelectTab(nextUnvisited.id)}
            className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/90 flex items-center justify-between cursor-pointer hover:border-provenance-500 hover:bg-slate-900 transition group translate-z-10"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="h-3.5 w-3.5 text-provenance-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-[10px] text-slate-400 block">Suggested next exploration:</span>
                <span className="text-xs font-semibold text-white group-hover:text-provenance-300 transition">
                  {nextUnvisited.label} — {nextUnvisited.shortHint}
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-white transition-all shrink-0 ml-2" />
          </div>
        ) : (
          <div className="rounded-xl bg-emerald-950/40 p-2.5 border border-emerald-800/60 flex items-center space-x-2 text-xs text-emerald-300 translate-z-10">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Complete tour finished! All core workspaces validated.</span>
          </div>
        )}
      </TiltCard>
    </div>
  );
};
