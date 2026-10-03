import React, { useState, useEffect } from 'react';
import { Navbar, MainNavTab } from './components/common/Navbar.js';
import { DashboardView } from './components/dashboard/DashboardView.js';
import { QueryBuilder } from './components/query/QueryBuilder.js';
import { ResultsView } from './components/results/ResultsView.js';
import { SupplyNetworkView } from './components/network/SupplyNetworkView.js';
import { SimulationSandbox } from './components/simulation/SimulationSandbox.js';
import { SecurityCenter } from './components/admin/SecurityCenter.js';
import { LoginModal } from './components/auth/LoginModal.js';
import { MFAModal } from './components/auth/MFAModal.js';
import { ExplorationGuide } from './components/common/ExplorationGuide.js';
import { apiService, setAuthToken, setDemoPersona } from './services/api.js';
import { UserPersona, GovernedQueryResult, KPICardData, DisruptionAlert } from './types/index.js';

const DEMO_PERSONAS: UserPersona[] = [
  {
    id: 'usr_admin',
    name: 'CSCO (Global Admin)',
    email: 'admin@provenance.io',
    role: 'ADMIN',
    businessUnits: ['ALL', 'EMEA', 'APAC', 'AMER'],
    description: 'Full unmasked access across all global business units and restricted columns.'
  },
  {
    id: 'usr_analyst_emea',
    name: 'Elena Rostova (EMEA Lead)',
    email: 'analyst.emea@provenance.io',
    role: 'ANALYST',
    businessUnits: ['EMEA'],
    description: 'Scoped to EMEA region only. Sensitive bank & pricing columns masked by Policy Guard.'
  },
  {
    id: 'usr_analyst_apac',
    name: 'Kenji Sato (APAC Lead)',
    email: 'analyst.apac@provenance.io',
    role: 'ANALYST',
    businessUnits: ['APAC'],
    description: 'Scoped to APAC region only. Sensitive financial exposure columns masked.'
  },
  {
    id: 'usr_operator',
    name: 'Marcus Vance (Rotterdam Operator)',
    email: 'operator@provenance.io',
    role: 'OPERATOR',
    businessUnits: ['EMEA'],
    description: 'Operational execution rights for shipment tracking and stock rebalances.'
  },
  {
    id: 'usr_viewer',
    name: 'Audrey Chen (Executive Viewer)',
    email: 'viewer@provenance.io',
    role: 'VIEWER',
    businessUnits: ['AMER'],
    description: 'Read-only access to high-level aggregate metrics.'
  }
];

export function App() {
  const [currentTab, setCurrentTab] = useState<MainNavTab>('dashboard');
  const [currentPersona, setCurrentPersona] = useState<UserPersona>(DEMO_PERSONAS[0]);
  const [latestResult, setLatestResult] = useState<GovernedQueryResult | null>(null);
  const [kpis, setKpis] = useState<KPICardData[]>([]);
  const [historicalTrends, setHistoricalTrends] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<DisruptionAlert[]>([]);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [mfaModalOpen, setMfaModalOpen] = useState(false);
  const [mfaTempToken, setMfaTempToken] = useState('');
  const [mfaUser, setMfaUser] = useState<any>(null);

  // Synchronize persona with API client
  useEffect(() => {
    setDemoPersona(currentPersona.role, currentPersona.businessUnits);
    loadDashboardData();
  }, [currentPersona]);

  async function loadDashboardData() {
    try {
      const summary = await apiService.getDashboardSummary();
      setKpis(summary.kpis);
      setHistoricalTrends(summary.historicalTrends);
      setAlerts(summary.alerts);
    } catch (e) {
      console.error('Failed to load dashboard', e);
    }
  }

  const handleQueryExecuted = (result: GovernedQueryResult) => {
    setLatestResult(result);
    setCurrentTab('results');
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await apiService.acknowledgeAlert(alertId);
      loadDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoginSuccess = (authData: any) => {
    if (authData.accessToken) {
      setAuthToken(authData.accessToken);
    }
    const matchingPersona = DEMO_PERSONAS.find(p => p.email.toLowerCase() === authData.user?.email.toLowerCase());
    if (matchingPersona) {
      setCurrentPersona(matchingPersona);
    }
  };

  const handleRequireMfa = (tempToken: string, user: any) => {
    setLoginModalOpen(false);
    setMfaTempToken(tempToken);
    setMfaUser(user);
    setMfaModalOpen(true);
  };

  const unresolvedAlertCount = alerts.filter(a => a.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-provenance-500 selection:text-white">
      {/* Sleek Top Navigation Bar with Primary Tabs */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentPersona={currentPersona}
        personas={DEMO_PERSONAS}
        onSelectPersona={setCurrentPersona}
        unresolvedAlertCount={unresolvedAlertCount}
        onOpenLogin={() => setLoginModalOpen(true)}
      />

      {/* Main Workspace Container with Generous Breathing Room */}
      <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              kpis={kpis}
              historicalTrends={historicalTrends}
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onNavigateToQuery={() => setCurrentTab('query')}
              onNavigateToSimulation={() => setCurrentTab('simulation')}
            />
          )}

          {currentTab === 'query' && (
            <QueryBuilder
              onQueryExecuted={handleQueryExecuted}
              activeBusinessUnits={currentPersona.businessUnits}
              activeRole={currentPersona.role}
            />
          )}

          {currentTab === 'results' && (
            <ResultsView
              result={latestResult}
              onNewQuery={() => setCurrentTab('query')}
            />
          )}

          {currentTab === 'network' && <SupplyNetworkView />}

          {currentTab === 'simulation' && (
            <SimulationSandbox approverEmail={currentPersona.email} />
          )}

          {currentTab === 'security' && <SecurityCenter />}
        </div>
      </main>

      {/* Organic Platform Exploration Guide */}
      <ExplorationGuide
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      {/* Authentication Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onRequireMfa={handleRequireMfa}
      />

      <MFAModal
        isOpen={mfaModalOpen}
        tempToken={mfaTempToken}
        user={mfaUser}
        onSuccess={(authData) => {
          setMfaModalOpen(false);
          handleLoginSuccess(authData);
        }}
        onCancel={() => setMfaModalOpen(false)}
      />
    </div>
  );
}

export default App;
