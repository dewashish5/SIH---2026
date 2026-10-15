import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { api } from '../services/api';
import {
  Network,
  Share2,
  Terminal,
  Database,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  Building2,
  GraduationCap,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  properties: Record<string, any>;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  properties: Record<string, any>;
}

export const KnowledgeGraphScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visual' | 'pathways' | 'cypher'>('visual');
  const [status, setStatus] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [selectedTrade, setSelectedTrade] = useState('7421.0301');
  const [selectedDistrict, setSelectedDistrict] = useState('091');
  const [subgraph, setSubgraph] = useState<{ nodes: GraphNode[]; edges: GraphEdge[]; focus?: any }>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [pathways, setPathways] = useState<any>(null);
  const [cypherQuery, setCypherQuery] = useState('MATCH (t:Trade)-[:REQUIRES_SKILL]->(s:Skill) RETURN t, s');
  const [cypherResult, setCypherResult] = useState<any>(null);
  const [isRunningCypher, setIsRunningCypher] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch initial graph status & overview
  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        const [st, ov] = await Promise.all([
          api.getGraphStatus(),
          api.getGraphOverview()
        ]);
        setStatus(st);
        setOverview(ov);
      } catch (err) {
        console.error('Failed to fetch graph status', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  // Fetch sub-graph when trade or district changes
  useEffect(() => {
    async function loadLineage() {
      try {
        const line = await api.getGraphLineage(selectedTrade, selectedDistrict);
        setSubgraph(line);
        if (line.nodes && line.nodes.length > 0) {
          setSelectedNode(line.nodes[0]);
        }
      } catch (err) {
        console.error('Failed to load graph lineage', err);
      }
    }
    loadLineage();
  }, [selectedTrade, selectedDistrict]);

  // Fetch career pathways
  useEffect(() => {
    async function loadPathways() {
      try {
        const p = await api.getCareerPathways(selectedTrade);
        setPathways(p);
      } catch (err) {
        console.error('Failed to load career pathways', err);
      }
    }
    loadPathways();
  }, [selectedTrade]);

  // Execute Cypher
  const handleRunCypher = async (queryToRun?: string) => {
    const q = queryToRun || cypherQuery;
    setIsRunningCypher(true);
    try {
      const res = await api.runCypher(q);
      setCypherResult(res);
    } catch (err: any) {
      setCypherResult({ status: 'ERROR', error: err.message || 'Execution error' });
    } finally {
      setIsRunningCypher(false);
    }
  };

  const getNodeColor = (label: string) => {
    switch (label) {
      case 'Trade': return 'bg-blue-100 border-blue-600 text-blue-950';
      case 'Skill': return 'bg-emerald-100 border-emerald-600 text-emerald-950';
      case 'District': return 'bg-amber-100 border-amber-600 text-amber-950';
      case 'Employer': return 'bg-purple-100 border-purple-600 text-purple-950';
      case 'Institute': return 'bg-cyan-100 border-cyan-600 text-cyan-950';
      case 'Sector': return 'bg-slate-200 border-slate-700 text-slate-900';
      default: return 'bg-gray-100 border-gray-600 text-gray-900';
    }
  };

  const getNodeIcon = (label: string) => {
    switch (label) {
      case 'Trade': return <Cpu className="w-4 h-4 text-blue-700" />;
      case 'Skill': return <Sparkles className="w-4 h-4 text-emerald-700" />;
      case 'District': return <MapPin className="w-4 h-4 text-amber-700" />;
      case 'Employer': return <Building2 className="w-4 h-4 text-purple-700" />;
      case 'Institute': return <GraduationCap className="w-4 h-4 text-cyan-700" />;
      case 'Sector': return <Layers className="w-4 h-4 text-slate-700" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Header
        breadcrumbs={['NATIONAL', 'NEO4J KNOWLEDGE GRAPH']}
        titleEn="Neo4j Labour Market Knowledge Graph"
        titleHi="नियो4जे श्रम बाज़ार ज्ञान आरेख"
        badgeText="GRAPH DATABASE · BOLT PROTOCOL"
      />

      {/* Top Banner: Neo4j Server & Engine Status */}
      <div className="border border-black bg-white p-4 shadow-[1px_1px_0px_0px_#000000] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black text-white">
            <Network className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm uppercase tracking-tight text-black">
                Neo4j Graph Topology Engine
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold border border-black uppercase ${
                status?.connection_mode === 'NEO4J_BOLT_CONNECTED'
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-yellow-100 text-yellow-900'
              }`}>
                {status?.connection_mode || 'GRAPH ENGINE ACTIVE'}
              </span>
            </div>
            <div className="text-xs font-mono text-slate-600 mt-0.5 flex flex-wrap items-center gap-3">
              <span>Bolt URI: <strong>{status?.bolt_uri || 'bolt://localhost:7687'}</strong></span>
              <span>•</span>
              <span>Nodes: <strong>{status?.total_nodes || 39}</strong></span>
              <span>•</span>
              <span>Relationships: <strong>{status?.total_edges || 57}</strong></span>
              <span>•</span>
              <span>Database: <strong>{status?.database || 'neo4j'}</strong></span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center border border-black p-0.5 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1 font-bold uppercase transition-colors ${
              activeTab === 'visual' ? 'bg-black text-white' : 'text-black hover:bg-slate-100'
            }`}
          >
            Visual Lineage
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pathways')}
            className={`px-3 py-1 font-bold uppercase transition-colors ${
              activeTab === 'pathways' ? 'bg-black text-white' : 'text-black hover:bg-slate-100'
            }`}
          >
            Career Pathways
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cypher')}
            className={`px-3 py-1 font-bold uppercase transition-colors ${
              activeTab === 'cypher' ? 'bg-black text-white' : 'text-black hover:bg-slate-100'
            }`}
          >
            Cypher Console
          </button>
        </div>
      </div>

      {/* TAB 1: Visual Subgraph Explorer */}
      {activeTab === 'visual' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="border border-black bg-slate-50 p-3 shadow-[1px_1px_0px_0px_#000000] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-black uppercase">Focus Trade:</span>
              <button
                type="button"
                onClick={() => setSelectedTrade('7421.0301')}
                className={`px-2.5 py-1 border border-black font-bold uppercase ${
                  selectedTrade === '7421.0301' ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                Solar PV Tech (7421.0301)
              </button>
              <button
                type="button"
                onClick={() => setSelectedTrade('7231.0102')}
                className={`px-2.5 py-1 border border-black font-bold uppercase ${
                  selectedTrade === '7231.0102' ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                EV Tech (7231.0102)
              </button>
              <button
                type="button"
                onClick={() => setSelectedTrade('7411.0100')}
                className={`px-2.5 py-1 border border-black font-bold uppercase ${
                  selectedTrade === '7411.0100' ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                Electrician (7411.0100)
              </button>
              <button
                type="button"
                onClick={() => setSelectedTrade('2519.0301')}
                className={`px-2.5 py-1 border border-black font-bold uppercase ${
                  selectedTrade === '2519.0301' ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                AI Annotator (2519.0301)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-white border border-black px-2 py-1 font-mono text-xs"
              >
                <option value="091">Jaipur (091)</option>
                <option value="088">Bhilwara (088)</option>
                <option value="094">Jodhpur (094)</option>
                <option value="521">Pune (521)</option>
                <option value="554">Bengaluru Urban (554)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Graph Topology Canvas */}
            <div className="lg:col-span-2 border border-black bg-white p-4 shadow-[1px_1px_0px_0px_#000000]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-black">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-black" />
                  <h3 className="font-extrabold text-sm uppercase tracking-tight text-black">
                    Lineage Sub-Graph Topology ({subgraph.nodes.length} Nodes · {subgraph.edges.length} Edges)
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Click any node to inspect properties
                </span>
              </div>

              {/* Node Chips Canvas */}
              <div className="bg-slate-50 border border-slate-300 p-4 min-h-[360px] flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-mono text-slate-600 uppercase font-bold mb-2">
                    Active Graph Nodes:
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {subgraph.nodes.map((node) => {
                      const isSelected = selectedNode?.id === node.id;
                      return (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => setSelectedNode(node)}
                          className={`border px-3 py-2 text-xs font-mono flex items-center gap-2 transition-all shadow-[1px_1px_0px_0px_#000000] ${
                            getNodeColor(node.label)
                          } ${isSelected ? 'ring-2 ring-black font-extrabold scale-105' : 'hover:scale-102'}`}
                        >
                          {getNodeIcon(node.label)}
                          <div className="text-left">
                            <div className="text-[10px] uppercase font-bold text-slate-600">{node.label}</div>
                            <div className="font-bold">{node.properties.name || node.id}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Relationships Feed */}
                <div className="mt-6 pt-4 border-t border-slate-300">
                  <div className="text-[11px] font-mono text-slate-600 uppercase font-bold mb-2">
                    Traversed Knowledge Graph Relationships:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto font-mono text-[11px]">
                    {subgraph.edges.map((e) => {
                      const srcNode = subgraph.nodes.find((n) => n.id === e.source);
                      const tgtNode = subgraph.nodes.find((n) => n.id === e.target);
                      return (
                        <div key={e.id} className="p-1.5 bg-white border border-slate-300 flex items-center justify-between">
                          <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                            {srcNode?.properties.name || e.source}
                          </span>
                          <span className="px-1.5 py-0.5 bg-black text-white text-[9px] uppercase font-bold">
                            -[:{e.type}]-&gt;
                          </span>
                          <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                            {tgtNode?.properties.name || e.target}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-slate-200 text-xs font-mono">
                <span className="font-bold text-slate-700">Nodes:</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-900 border border-blue-400 font-bold">Trade</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-400 font-bold">Skill</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-400 font-bold">District</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-900 border border-purple-400 font-bold">Employer</span>
                <span className="px-2 py-0.5 bg-cyan-100 text-cyan-900 border border-cyan-400 font-bold">Institute</span>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-900 border border-slate-400 font-bold">Sector</span>
              </div>
            </div>

            {/* Right Col: Node Inspector Panel */}
            <div className="border border-black bg-white p-4 shadow-[1px_1px_0px_0px_#000000]">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-black">
                <Database className="w-4 h-4 text-black" />
                <h3 className="font-extrabold text-sm uppercase tracking-tight text-black">
                  Node Property Inspector
                </h3>
              </div>

              {selectedNode ? (
                <div className="space-y-4 font-mono text-xs">
                  <div className={`p-3 border ${getNodeColor(selectedNode.label)}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {selectedNode.label} Node
                      </span>
                      <span className="text-[10px] bg-black text-white px-1.5 py-0.5">
                        {selectedNode.id}
                      </span>
                    </div>
                    <div className="text-base font-extrabold mt-1">
                      {selectedNode.properties.name || selectedNode.id}
                    </div>
                  </div>

                  <div className="border border-slate-300 p-3 bg-slate-50 space-y-2">
                    <div className="font-bold uppercase text-[11px] text-slate-700 border-b pb-1">
                      Properties & Provenance
                    </div>
                    {Object.entries(selectedNode.properties).map(([key, val]) => (
                      <div key={key} className="flex items-start justify-between gap-2 border-b border-slate-200 pb-1">
                        <span className="text-slate-500 font-semibold">{key}:</span>
                        <span className="font-bold text-black text-right max-w-[160px] truncate">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border border-slate-300 p-3 bg-white space-y-1.5">
                    <div className="font-bold uppercase text-[11px] text-slate-700">
                      Connected Relationships
                    </div>
                    <div className="text-[11px] text-slate-600">
                      In-degree: <strong>{subgraph.edges.filter((e) => e.target === selectedNode.id).length}</strong>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Out-degree: <strong>{subgraph.edges.filter((e) => e.source === selectedNode.id).length}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-mono text-slate-500 p-6 text-center">
                  Select a node from the canvas to inspect Neo4j graph properties.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Career Pathways & Skill Adjacency */}
      {activeTab === 'pathways' && (
        <div className="border border-black bg-white p-5 shadow-[1px_1px_0px_0px_#000000] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-black">
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-tight text-black">
                Vocational Mobility & Skill Adjacency Engine (:Trade -[:ADJACENT_TO]-&gt; :Trade)
              </h3>
              <p className="text-xs font-mono text-slate-600 mt-0.5">
                Calculates shortest skill transition pathways, reusable competencies, and upskilling lag time.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-900 px-2.5 py-1 border border-black">
              TRANSITION MODEL ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pathways?.adjacent_pathways?.map((item: any, idx: number) => {
              const rel = item.relationship;
              const target = item.target_trade?.properties;
              return (
                <div
                  key={idx}
                  className="border border-black bg-slate-50 p-4 shadow-[1px_1px_0px_0px_#000000] flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold">
                        PATHWAY #{idx + 1}
                      </span>
                      <span className="font-bold text-blue-700">
                        {Math.round(rel.similarity * 100)}% Match
                      </span>
                    </div>

                    <div className="font-extrabold text-sm text-black mb-1">
                      {target?.name}
                    </div>
                    <div className="text-xs font-mono text-slate-600 mb-3">
                      Code: {target?.code} · NSQF Level {target?.nsqf}
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="bg-emerald-50 border border-emerald-300 p-2">
                        <div className="font-bold text-emerald-900 text-[11px] uppercase mb-1">
                          Transferable Competencies:
                        </div>
                        <ul className="list-disc pl-4 text-[11px] text-emerald-800 space-y-0.5">
                          {rel.shared_skills?.map((sk: string, sIdx: number) => (
                            <li key={sIdx}>{sk}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-amber-50 border border-amber-300 p-2">
                        <div className="font-bold text-amber-900 text-[11px] uppercase mb-1">
                          Bridge Upskilling Gap:
                        </div>
                        <ul className="list-disc pl-4 text-[11px] text-amber-800 space-y-0.5">
                          {rel.gap_skills?.map((sk: string, sIdx: number) => (
                            <li key={sIdx}>{sk}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-300 pt-3 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600">
                      Duration: <strong>{rel.upskill_weeks} Weeks</strong>
                    </span>
                    <span className="font-bold text-black uppercase">
                      {rel.readiness}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Interactive Cypher Console */}
      {activeTab === 'cypher' && (
        <div className="border border-black bg-white p-5 shadow-[1px_1px_0px_0px_#000000] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-black">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-black" />
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-tight text-black">
                  Interactive Cypher Query Console
                </h3>
                <div className="text-xs font-mono text-slate-600">
                  Execute live Cypher queries against Neo4j Bolt graph endpoint with guardrails.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleRunCypher()}
              disabled={isRunningCypher}
              className="px-4 py-2 bg-black text-white font-mono text-xs font-bold uppercase border border-black hover:bg-slate-800 disabled:opacity-50"
            >
              {isRunningCypher ? 'Executing...' : 'Run Cypher Query'}
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="font-bold text-black uppercase">Preset Cypher Queries:</span>
            <button
              type="button"
              onClick={() => {
                const q = 'MATCH (t:Trade)-[:REQUIRES_SKILL]->(s:Skill) RETURN t, s';
                setCypherQuery(q);
                handleRunCypher(q);
              }}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-black font-semibold"
            >
              1. Trade Skill Dependencies
            </button>
            <button
              type="button"
              onClick={() => {
                const q = 'MATCH (a:Trade)-[r:ADJACENT_TO]->(b:Trade) RETURN a, r, b';
                setCypherQuery(q);
                handleRunCypher(q);
              }}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-black font-semibold"
            >
              2. Career Transition Pathways
            </button>
            <button
              type="button"
              onClick={() => {
                const q = 'MATCH (e:Employer)-[:HIRING_FOR]->(t:Trade) RETURN e, t';
                setCypherQuery(q);
                handleRunCypher(q);
              }}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-black font-semibold"
            >
              3. Employer Hiring Requisitions
            </button>
            <button
              type="button"
              onClick={() => {
                const q = 'MATCH (d:District)-[r:DEMANDS]->(t:Trade) RETURN d, r, t';
                setCypherQuery(q);
                handleRunCypher(q);
              }}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-black font-semibold"
            >
              4. District Demand Severity Links
            </button>
          </div>

          {/* Textarea */}
          <textarea
            value={cypherQuery}
            onChange={(e) => setCypherQuery(e.target.value)}
            rows={4}
            className="w-full p-3 font-mono text-xs bg-slate-900 text-green-400 border border-black focus:outline-none"
            placeholder="MATCH (n) RETURN n LIMIT 25"
          />

          {/* Results Display */}
          {cypherResult && (
            <div className="border border-slate-300 p-4 bg-slate-50 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-300">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-black uppercase">Execution Response:</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold ${
                    cypherResult.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                  }`}>
                    {cypherResult.status} ({cypherResult.mode})
                  </span>
                </div>
                <span className="text-slate-500">
                  Records: {cypherResult.records_count ?? 0}
                </span>
              </div>

              {cypherResult.error ? (
                <div className="text-red-600 font-bold p-3 bg-red-50 border border-red-300">
                  {cypherResult.error}
                </div>
              ) : cypherResult.records && cypherResult.records.length > 0 ? (
                <div className="overflow-x-auto max-h-[300px] border border-slate-300 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-300">
                      <tr>
                        {Object.keys(cypherResult.records[0]).map((col) => (
                          <th key={col} className="p-2 uppercase font-bold text-slate-700">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cypherResult.records.map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="border-b border-slate-200 hover:bg-slate-50">
                          {Object.values(row).map((val: any, vIdx: number) => (
                            <td key={vIdx} className="p-2 font-mono">
                              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-slate-500 p-3 text-center">
                  Query returned 0 records.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
