import React, { useState, useEffect } from 'react';
import {
  Share2,
  BookOpen,
  AlertTriangle,
  Building2,
  Package,
  Truck,
  Shield,
  Layers,
  Search,
  CheckCircle2,
  ChevronRight,
  Globe,
  Map as MapIcon
} from 'lucide-react';
import { apiService } from '../../services/api.js';
import { GraphNode, GraphEdge, MetricDefinition } from '../../types/index.js';
import { DigitalTwinGlobe } from './DigitalTwinGlobe.js';
import { RealWorldMap } from './RealWorldMap.js';

export const SupplyNetworkView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'globe' | 'realmap' | 'topology' | 'ripple' | 'metrics'>('globe');
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [metrics, setMetrics] = useState<MetricDefinition[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [rippleTarget, setRippleTarget] = useState<string>('sup_foxconn_01');
  const [rippleResult, setRippleResult] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [graphData, metricsData] = await Promise.all([
          apiService.getGraph(),
          apiService.getMetrics()
        ]);
        setNodes(graphData?.nodes || []);
        setEdges(graphData?.edges || []);
        setMetrics(metricsData?.registry || []);
        if (graphData?.nodes?.length > 0) {
          setSelectedNode(graphData.nodes[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Fetch disruption ripple when target changes
  useEffect(() => {
    if (rippleTarget) {
      apiService.traceDisruptions(rippleTarget).then(res => setRippleResult(res)).catch(() => {});
    }
  }, [rippleTarget]);

  const filteredNodes = (nodes || []).filter((n) => {
    const matchesType = selectedType === 'ALL' || n.type === selectedType;
    const matchesSearch = !searchQuery || n.label.toLowerCase().includes(searchQuery.toLowerCase()) || n.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const suppliers = (nodes || []).filter(n => n.type === 'Supplier');

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading Supply Network Topology...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <Share2 className="h-6 w-6 text-provenance-400" />
          <span>Supply Network & Knowledge Graph</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Multi-hop relational topology linking Vendors, Warehouses, Products, and In-Transit Shipments. Grounded in source ERP and TMS records.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800">
        <div className="flex space-x-6 text-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('globe')}
            className={`flex items-center space-x-2 pb-3 font-semibold transition border-b-2 whitespace-nowrap ${
              activeTab === 'globe'
                ? 'border-provenance-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="h-4 w-4 text-provenance-400" />
            <span>3D Digital Twin Globe</span>
            <span className="rounded-full bg-provenance-950 px-1.5 py-0.2 text-[9px] font-bold text-provenance-300 border border-provenance-800">
              WEBGL
            </span>
          </button>

          <button
            onClick={() => setActiveTab('realmap')}
            className={`flex items-center space-x-2 pb-3 font-semibold transition border-b-2 whitespace-nowrap ${
              activeTab === 'realmap'
                ? 'border-provenance-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapIcon className="h-4 w-4 text-emerald-400" />
            <span>Real-World Geographic Map</span>
            <span className="rounded-full bg-emerald-950 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-800">
              HD TILES
            </span>
          </button>

          <button
            onClick={() => setActiveTab('topology')}
            className={`flex items-center space-x-2 pb-3 font-semibold transition border-b-2 whitespace-nowrap ${
              activeTab === 'topology'
                ? 'border-provenance-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="h-4 w-4" />
            <span>Entity Topology ({nodes.length} Nodes)</span>
          </button>

          <button
            onClick={() => setActiveTab('ripple')}
            className={`flex items-center space-x-2 pb-3 font-semibold transition border-b-2 whitespace-nowrap ${
              activeTab === 'ripple'
                ? 'border-provenance-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Disruption Ripple Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center space-x-2 pb-3 font-semibold transition border-b-2 whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'border-provenance-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Approved Metric Dictionary ({metrics.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 0: 3D Digital Twin Globe */}
      {activeTab === 'globe' && (
        <div className="space-y-4 animate-fade-in">
          <DigitalTwinGlobe />
        </div>
      )}

      {/* Tab 0.5: Real-World Geographic Map */}
      {activeTab === 'realmap' && (
        <div className="space-y-4 animate-fade-in">
          <RealWorldMap />
        </div>
      )}

      {/* Tab 1: Topology Explorer */}
      {activeTab === 'topology' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
              {['ALL', 'Supplier', 'Warehouse', 'Product', 'Shipment'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                    selectedType === type
                      ? 'bg-provenance-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                  }`}
                >
                  {type === 'ALL' ? 'All Entities' : `${type}s`}
                </button>
              ))}
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search entities..."
                className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-provenance-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Grid Layout: Left Cards & Right Detail Drawer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
              {filteredNodes.map((n) => {
                const isSelected = selectedNode?.id === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    className={`rounded-xl border p-4 cursor-pointer transition ${
                      isSelected
                        ? 'border-provenance-400 bg-slate-900 shadow-lg shadow-provenance-500/10'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-provenance-400">
                        {n.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{n.geography}</span>
                    </div>

                    <h4 className="text-xs font-bold text-white truncate">{n.label}</h4>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <span>Source: {n.provenance.sourceSystem.split(' ')[0]}</span>
                      <span className="text-emerald-400 font-semibold">{Math.round(n.provenance.confidenceScore * 100)}% Conf</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Node Details */}
            <div className="space-y-4">
              {selectedNode ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-provenance-400 block">
                      {selectedNode.type} Entity
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">{selectedNode.label}</h3>
                    <span className="text-[10px] text-slate-500 font-mono">{selectedNode.id}</span>
                  </div>

                  {/* Provenance Card */}
                  <div className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-800 space-y-2 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Source Lineage
                    </span>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Record System:</span>
                      <span className="text-white font-medium">{selectedNode.provenance.sourceSystem}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Confidence:</span>
                      <span className="text-emerald-400 font-bold">{Math.round(selectedNode.provenance.confidenceScore * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Owner:</span>
                      <span className="text-slate-300">{selectedNode.provenance.recordOwner}</span>
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="space-y-2 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Attributes
                    </span>
                    <div className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-800 space-y-1.5">
                      {Object.entries(selectedNode.properties).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="text-slate-200 font-medium">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">Select an entity to view details.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Disruption Ripple Simulator */}
      {activeTab === 'ripple' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6 animate-fade-in">
          <div>
            <h3 className="text-sm font-bold text-white">Disruption Propagation Ripple Simulator</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select a primary tier-1 vendor to trace how a supply bottleneck propagates across in-transit freight into regional distribution hubs.
            </p>
          </div>

          <div className="max-w-md">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Vulnerable Vendor:</label>
            <select
              value={rippleTarget}
              onChange={(e) => setRippleTarget(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-provenance-500 focus:outline-none"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} ({s.geography}) - [OTIF: {s.properties.otifRate}%]
                </option>
              ))}
            </select>
          </div>

          {rippleResult && (
            <div className="space-y-4 pt-2">
              <div className="rounded-xl bg-amber-950/30 p-4 border border-amber-800/40 text-xs text-amber-200 leading-relaxed">
                <strong>Propagation Summary: </strong>
                {rippleResult.downstreamExposureSummary}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-900/60 p-4 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-white block">
                    Impacted Shipments ({rippleResult.affectedShipments.length})
                  </span>
                  <div className="space-y-2">
                    {rippleResult.affectedShipments.length === 0 ? (
                      <p className="text-xs text-slate-500">No active shipments in transit.</p>
                    ) : (
                      rippleResult.affectedShipments.map((s: any) => (
                        <div key={s.id} className="rounded-lg bg-slate-950 p-3 border border-slate-800 text-xs flex justify-between">
                          <span className="font-semibold text-white">{s.label}</span>
                          <span className="text-red-400 font-bold">{s.properties.delayDays}d Delay</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-slate-900/60 p-4 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-white block">
                    Impacted Fulfillment Hubs ({rippleResult.affectedWarehouses.length})
                  </span>
                  <div className="space-y-2">
                    {rippleResult.affectedWarehouses.map((w: any) => (
                      <div key={w.id} className="rounded-lg bg-slate-950 p-3 border border-slate-800 text-xs flex justify-between">
                        <span className="font-semibold text-white">{w.label}</span>
                        <span className="text-amber-300 font-semibold">{w.properties.safetyStockDays}d Buffer</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Approved Metric Dictionary */}
      {activeTab === 'metrics' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4 animate-fade-in">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Centralized Metric Registry (Single Source of Truth)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Approved formulas ratified by the Enterprise Data Governance Council. Guarantees zero synthetic invention by the LLM.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Metric Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Approved Business Formula</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {metrics.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-bold text-white">{m.name}</td>
                    <td className="px-4 py-3 font-mono text-provenance-400">{m.code}</td>
                    <td className="px-4 py-3 font-mono text-emerald-300 text-[11px]">{m.formula}</td>
                    <td className="px-4 py-3 text-slate-400">{m.owner}</td>
                    <td className="px-4 py-3 font-semibold text-slate-200">{m.targetBenchmark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
