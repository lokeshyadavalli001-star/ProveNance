import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  User,
  Bell,
  LayoutDashboard,
  MessageSquareCode,
  FileSpreadsheet,
  Share2,
  SlidersHorizontal,
  ShieldAlert,
  ChevronDown,
  Check,
  Building,
  KeyRound
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
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const personaRef = useRef<HTMLDivElement>(null);

  // Close persona dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (personaRef.current && !personaRef.current.contains(event.target as Node)) {
        setPersonaMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navTabs = [
    { id: 'dashboard' as MainNavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'query' as MainNavTab, label: 'AI Assistant', icon: MessageSquareCode },
    { id: 'results' as MainNavTab, label: 'Evidence & Results', icon: FileSpreadsheet },
    { id: 'network' as MainNavTab, label: 'Supply Network', icon: Share2, badge: '3D' },
    { id: 'simulation' as MainNavTab, label: 'Scenarios', icon: SlidersHorizontal },
    { id: 'security' as MainNavTab, label: 'Security & Trust', icon: ShieldAlert, badge: unresolvedAlertCount > 0 ? `${unresolvedAlertCount}` : undefined }
  ];

  const roleColors: Record<string, { bg: string; text: string; border: string }> = {
    ADMIN: { bg: 'bg-purple-950/70', text: 'text-purple-300', border: 'border-purple-700/50' },
    ANALYST: { bg: 'bg-blue-950/70', text: 'text-blue-300', border: 'border-blue-700/50' },
    OPERATOR: { bg: 'bg-amber-950/70', text: 'text-amber-300', border: 'border-amber-700/50' },
    VIEWER: { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' }
  };

  const currentRoleStyle = roleColors[currentPersona.role] || roleColors.VIEWER;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md">
      {/* Top Brand & Profile Bar */}
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-800/40">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
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
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Custom Sleek Persona Switcher */}
          <div className="relative" ref={personaRef}>
            <button
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              className="flex items-center space-x-2 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-1.5 transition text-left shadow-sm"
              title="Switch user role & business unit scope"
            >
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[140px] sm:max-w-[180px]">
                  {currentPersona.name.split(' (')[0]}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center justify-end space-x-1">
                  <span>Scope:</span>
                  <strong className="text-provenance-300">{currentPersona.businessUnits.join(', ')}</strong>
                </span>
              </div>

              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${currentRoleStyle.bg} ${currentRoleStyle.text} ${currentRoleStyle.border}`}>
                {currentPersona.role}
              </span>

              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${personaMenuOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            {/* Persona Dropdown Menu */}
            {personaMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-750 shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                <div className="px-3 py-2 border-b border-slate-800">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                    Select Active Persona & Access Scope
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Controls Row-Level Security (RLS) & Column Masking.
                  </p>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-1 py-1">
                  {personas.map((p) => {
                    const isSelected = p.id === currentPersona.id;
                    const pRoleStyle = roleColors[p.role] || roleColors.VIEWER;

                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectPersona(p);
                          setPersonaMenuOpen(false);
                        }}
                        className={`w-full flex items-start justify-between p-2.5 rounded-xl text-left transition ${
                          isSelected
                            ? 'bg-provenance-600/20 border border-provenance-500/40 text-white'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="space-y-0.5 pr-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-white">{p.name}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${pRoleStyle.bg} ${pRoleStyle.text} ${pRoleStyle.border}`}>
                              {p.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{p.description}</p>
                          <div className="flex items-center space-x-1 text-[10px] text-slate-400 pt-0.5 font-mono">
                            <Building className="h-3 w-3 text-slate-500" />
                            <span>Region: <strong className="text-slate-300">{p.businessUnits.join(', ')}</strong></span>
                          </div>
                        </div>

                        {isSelected && (
                          <Check className="h-4 w-4 text-provenance-400 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Alert Notification Bell */}
          <button
            onClick={() => onSelectTab('security')}
            className="relative rounded-xl p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition border border-slate-800/80"
            title="View Security & Disruption Alerts"
          >
            <Bell className="h-4 w-4" />
            {unresolvedAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm">
                {unresolvedAlertCount}
              </span>
            )}
          </button>

          {/* Switch User Modal Trigger */}
          <button
            onClick={onOpenLogin}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition shadow-sm"
          >
            <KeyRound className="h-3.5 w-3.5 text-provenance-400" />
            <span className="hidden sm:inline">Sign In / MFA</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs Bar */}
      <div className="flex items-center px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none bg-slate-950/70 border-t border-slate-900">
        <nav className="flex space-x-1 sm:space-x-2 py-2">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center space-x-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition whitespace-nowrap ${
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
