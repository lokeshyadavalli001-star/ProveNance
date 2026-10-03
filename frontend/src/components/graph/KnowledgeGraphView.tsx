import React, { useState, useEffect } from 'react';
import { Share2, Database, Shield, AlertTriangle, Layers, ArrowRight } from 'lucide-react';
import { apiService } from '../../services/api.js';
import { GraphNode, GraphEdge } from '../../types/index.js';

export const KnowledgeGraphView: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [rippleData, setRippleData] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGraph() {
      try {
        const data = await apiService.getGraph();
        setNodes(data?.nodes || []);
        setEdges(data?.edges || []);
        if (data?.nodes?.length > 0) {
          setSelectedNode(data.nodes[0]);
        }
      } catch (e) {
        console.error('Failed to load graph', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGraph();
  }, []);

  const handleSelectNode = async (node: GraphNode) => {
    setSelectedNode(node);
    if (node.type === 'Supplier') {
      try {
        const ripple = await apiService.traceDisruptions(node.id);
        setRippleData(ripple);
      } catch (e) {
        setRippleData(null);
      }
    } else {
      setRippleData(null);
    }
  };

  const filteredNodes = (nodes || []).filter(n => filterType === 'ALL' || n.type === filterType);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'Supplier': return 'bg-provenance-600/30 border-provenance-500 text-provenance-300';
      case 'Warehouse': return 'bg-emerald-600/30 border-emerald-500 text-emerald-300';
      case 'Product': return 'bg-amber-600/30 border-amber-500 text-amber-300';
      case 'Shipment': return 'bg-purple-600/30 border-purple-500 text-purple-300';
      default: return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading Knowledge Graph Index...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
          <Share2 className="h-5 w-5 text-provenance-400" />
          <span>Enterprise Supply Chain Knowledge Graph</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Multi-hop relational topology linking Suppliers, Shipments, BOM Products, and Warehouses. Every entity and relationship carries cryptographic provenance metadata from source ERP and TMS feeds.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        {['ALL', 'Supplier', 'Warehouse', 'Product', 'Shipment'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filterType === t
                ? 'bg-provenance-600 text-white shadow-md shadow-provenance-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            {t === 'ALL' ? 'All Entities' : `${t}s`}
          </button>
        ))}
      </div>

      {/* Visual Canvas & Entity Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entity Nodes Canvas */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Indexed Entity Topology ({filteredNodes.length} Nodes • {edges.length} Semantic Edges)
            </span>
            <span className="text-[11px] text-slate-400">Click any entity to inspect provenance & ripple effects</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
            {filteredNodes.map((n) => {
              const isSelected = selectedNode?.id === n.id;
              return (
                <div
                  key={n.id}
                  onClick={() => handleSelectNode(n)}
                  className={`rounded-xl border p-4 cursor-pointer transition ${
                    isSelected
                      ? 'border-provenance-400 bg-slate-900 shadow-lg shadow-provenance-500/10'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${getNodeColor(n.type)}`}>
                      {n.type}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">{n.geography}</span>
                  </div>

                  <h4 className="text-xs font-bold text-white truncate">{n.label}</h4>

                  <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span>Source: {n.provenance.sourceSystem.split(' ')[0]}</span>
                    <span className="text-emerald-400 font-semibold">{Math.round(n.provenance.confidenceScore * 100)}% Conf</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Entity & Disruption Ripple Inspector */}
        <div className="space-y-4">
          {selectedNode ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-provenance-400 block">
                    {selectedNode.type} Entity
                  </span>
                  <h3 className="text-sm font-bold text-white">{selectedNode.label}</h3>
                </div>
                <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-800">
                  {selectedNode.id}
                </span>
              </div>

              {/* Provenance Metadata */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Provenance Metadata
                </span>
                <div className="rounded-xl bg-slate-900 p-3.5 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Master Record:</span>
                    <span className="font-semibold text-white">{selectedNode.provenance.sourceSystem}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confidence Rating:</span>
                    <span className="font-semibold text-emerald-400">{Math.round(selectedNode.provenance.confidenceScore * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Sync:</span>
                    <span className="text-slate-300">{selectedNode.provenance.lastSyncTimestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Record Steward:</span>
                    <span className="text-slate-300">{selectedNode.provenance.recordOwner}</span>
                  </div>
                </div>
              </div>

              {/* Entity Properties */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Operational Attributes
                </span>
                <div className="rounded-xl bg-slate-900 p-3.5 border border-slate-800 text-xs space-y-1">
                  {Object.entries(selectedNode.properties).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[11px]">
                      <span className="text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-semibold text-slate-200">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disruption Ripple Analysis */}
              {rippleData && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-bold">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Disruption Propagation Ripple</span>
                  </div>
                  <div className="rounded-xl bg-amber-950/30 p-3.5 border border-amber-800/40 text-xs space-y-2 text-slate-300">
                    <p className="text-[11px] leading-relaxed">{rippleData.downstreamExposureSummary}</p>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-300 block">Impacted Warehouses:</span>
                      {rippleData.affectedWarehouses.map((w: any) => (
                        <div key={w.id} className="rounded bg-slate-950 px-2 py-1 text-[11px] text-white border border-slate-800">
                          {w.label} ({w.geography})
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center text-xs text-slate-500">
              Select an entity node from the topology to inspect lineage.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
