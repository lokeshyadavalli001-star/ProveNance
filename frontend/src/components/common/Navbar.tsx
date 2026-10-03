import React from 'react';
import {
  ShieldCheck,
  User,
  Bell,
  Lock,
  LayoutDashboard,
  MessageSquareCode,
  FileSpreadsheet,
  Share2,
  SlidersHorizontal,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { UserPersona } from '../../types/index.js';

export type MainNavTab =
  | 'dashboard'
  | 'query'
  | 'results'
  | 'network'
  | 'simulation'
  | 'security';

interface NavbarProps {
  currentTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  currentPersona: UserPersona;
  personas: UserPersona[];
  onSelectPersona: (persona: UserPersona) => void;
  unresolvedAlertCount: number;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentPersona,
  personas,
  onSelectPersona,
  unresolvedAlertCount,
  onOpenLogin
}) => {
  const navTabs = [
    { id: 'dashboard' as MainNavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'query' as MainNavTab, label: 'AI Assistant', icon: MessageSquareCode },
    { id: 'results' as MainNavTab, label: 'Evidence & Results', icon: FileSpreadsheet },
    { id: 'network' as MainNavTab, label: 'Supply Network', icon: Share2, badge: '3D' },
    { id: 'simulation' as MainNavTab, label: 'Scenarios', icon: SlidersHorizontal },
    { id: 'security' as MainNavTab, label: 'Security & Trust', icon: ShieldAlert, badge: unresolvedAlertCount > 0 ? `${unresolvedAlertCount}` : undefined }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      {/* Top Brand & Profile Bar */}
      <div className="flex h-16 items-center justify-between px-6 lg:px-8 border-b border-slate-850/60">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-provenance-600 text-white shadow-md shadow-provenance-600/30">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white">ProveNance™</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Governed Supply Chain Decision Intelligence</p>
          </div>
        </div>

        {/* Right Controls: Persona Switcher & User Profile */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Persona Switcher Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
            <span className="text-[11px] text-slate-400 hidden md:inline">Viewing as:</span>
            <select
              value={currentPersona.id}
              onChange={(e) => {
                const selected = personas.find((p) => p.id === e.target.value);
                if (selected) onSelectPersona(selected);
              }}
              className="bg-transparent text-xs font-semibold text-provenance-300 focus:outline-none cursor-pointer pr-1"
            >
              {personas.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.name} ({p.role}) - [{p.businessUnits.join(', ')}]
                </option>
              ))}
            </select>
          </div>

          {/* Alert Notification Bell */}
          <button
            onClick={() => onSelectTab('security')}
            className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition"
            title="View Security & Disruption Alerts"
          >
            <Bell className="h-4 w-4" />
            {unresolvedAlertCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                {unresolvedAlertCount}
              </span>
            )}
          </button>

          {/* Switch User Modal Trigger */}
          <button
            onClick={onOpenLogin}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <User className="h-3.5 w-3.5 text-provenance-400" />
            <span className="hidden sm:inline">Sign In / Switch</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs Bar */}
      <div className="flex items-center px-6 lg:px-8 overflow-x-auto scrollbar-none bg-slate-950">
        <nav className="flex space-x-1 sm:space-x-2 py-2">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center space-x-2 rounded-lg px-3.5 py-2 text-xs font-medium transition whitespace-nowrap ${
                  isActive
                    ? 'bg-provenance-600 text-white shadow-sm shadow-provenance-600/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.2 text-[9px] font-bold tracking-wider ${
                      tab.badge === '3D'
                        ? isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-provenance-950 text-provenance-300 border border-provenance-700'
                        : isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
