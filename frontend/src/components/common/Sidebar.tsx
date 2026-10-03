import React from 'react';
import {
  LayoutDashboard,
  MessageSquareCode,
  FileSpreadsheet,
  Network,
  Share2,
  SlidersHorizontal,
  ShieldAlert,
  BookOpen,
  CheckCircle2
} from 'lucide-react';

export type NavigationTab =
  | 'dashboard'
  | 'query'
  | 'results'
  | 'ontology'
  | 'graph'
  | 'simulation'
  | 'security';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  unresolvedAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, unresolvedAlertCount }) => {
  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Executive Summary',
      icon: LayoutDashboard,
      badge: 'KPIs'
    },
    {
      id: 'query' as NavigationTab,
      label: 'Governed Analytics',
      icon: MessageSquareCode,
      badge: 'AI Planner'
    },
    {
      id: 'results' as NavigationTab,
      label: 'Evidence & Results',
      icon: FileSpreadsheet,
      badge: 'Audit Trail'
    },
    {
      id: 'ontology' as NavigationTab,
      label: 'Ontology & Metrics',
      icon: BookOpen,
      badge: 'Single Source'
    },
    {
      id: 'graph' as NavigationTab,
      label: 'Knowledge Graph',
      icon: Share2,
      badge: 'Lineage'
    },
    {
      id: 'simulation' as NavigationTab,
      label: 'What-If Simulation',
      icon: SlidersHorizontal,
      badge: 'HMAC Gate'
    },
    {
      id: 'security' as NavigationTab,
      label: 'Security & Governance',
      icon: ShieldAlert,
      badge: unresolvedAlertCount > 0 ? `${unresolvedAlertCount} Alert` : '10 Domains'
    }
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-950 p-4 justify-between">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Operational Workspaces
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition ${
                    isActive
                      ? 'bg-provenance-600 text-white shadow-md shadow-provenance-600/30'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.id === 'security' && unresolvedAlertCount > 0
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 8-Layer Separation Summary Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs">
          <div className="flex items-center space-x-1.5 text-provenance-400 font-semibold mb-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>8-Layer Defense Mandate</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Operational truth lives in ERP/TMS. Ontology defines meaning. Knowledge graph captures relationships. Policy Guard blocks unauthorized data. LLM grounds evidence.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-800/80 pt-3 text-[11px] text-slate-500">
        <div className="flex items-center justify-between">
          <span>OWASP Top 10</span>
          <span className="font-semibold text-emerald-400">Compliant</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span>AES-256 / SHA-256</span>
          <span className="font-semibold text-slate-400">Active</span>
        </div>
      </div>
    </aside>
  );
};
