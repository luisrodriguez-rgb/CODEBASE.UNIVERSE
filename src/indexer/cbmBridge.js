/**
 * Codebase-Memory-MCP (CBM) Bridge Driver for CODEBASE.UNIVERSE.
 * Adapts high-performance CBM knowledge graphs (162 languages, SQLite/Tree-sitter/Hybrid LSP)
 * into CODEBASE.UNIVERSE's 8 Biomes, Rarity Tiers, and 2.5D Metric-Driven Citadels.
 *
 * ZERO EMOJIS.
 */

import { CodeGraph } from '../analysis/graph.js';
import { UniversalAstParser } from './astParser.js';

export class CbmBridgeDriver {
  /**
   * Transforms raw CBM Graph JSON (nodes & edges) into a CODEBASE.UNIVERSE CodeGraph.
   * @param {Object} cbmPayload Raw CBM data { project, nodes: Array, edges: Array }
   * @returns {CodeGraph}
   */
  static transformCbmToUniverseGraph(cbmPayload) {
    const graph = new CodeGraph();
    const rawNodes = cbmPayload.nodes || cbmPayload.results || [];
    const rawEdges = cbmPayload.edges || [];

    // 1. Process Nodes
    for (const raw of rawNodes) {
      const id = raw.id || raw.qualified_name || raw.name || raw.path;
      const name = raw.name || id.split('.').pop() || id;
      const path = raw.path || raw.file_path || id;
      const label = (raw.label || raw.type || 'module').toLowerCase();

      // Classify Biome from CBM label and path
      const biome = this.classifyCbmBiome(label, path, raw);

      // Estimate LOC & Cyclomatic mass
      const loc = raw.loc || (raw.end_line && raw.start_line ? raw.end_line - raw.start_line + 1 : 45);
      const cyclomaticEstimate = raw.complexity || Math.max(1, Math.round(loc * 0.1));

      graph.addNode({
        id,
        name,
        path,
        biome,
        type: label === 'function' || label === 'method' ? 'function' : label === 'route' ? 'interface' : 'module',
        loc,
        cyclomaticEstimate,
        cbmLabel: raw.label || 'Node'
      });
    }

    // 2. Process Edges
    const edgeSet = new Set();
    for (const edge of rawEdges) {
      const source = edge.source || edge.from || edge.caller;
      const target = edge.target || edge.to || edge.callee;
      const type = (edge.type || edge.label || 'CALLS').toUpperCase();

      if (source && target && source !== target) {
        // Ensure nodes exist or create lightweight placeholder
        if (!graph.nodes.has(source)) {
          graph.addNode({ id: source, name: source.split('.').pop(), path: source, biome: 'core', type: 'module', loc: 30, cyclomaticEstimate: 3 });
        }
        if (!graph.nodes.has(target)) {
          graph.addNode({ id: target, name: target.split('.').pop(), path: target, biome: 'core', type: 'module', loc: 30, cyclomaticEstimate: 3 });
        }

        const edgeKey = `${source}->${target}`;
        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey);
          graph.addEdge({
            source,
            target,
            type: type.includes('CALL') ? 'calls' : 'imports',
            cbmType: type
          });
        }
      }
    }

    return graph;
  }

  /**
   * Maps CBM labels and structural paths to CODEBASE.UNIVERSE Biomes.
   */
  static classifyCbmBiome(label, path, raw) {
    const p = (path || '').toLowerCase();
    const l = (label || '').toLowerCase();
    const n = (raw.name || '').toLowerCase();

    // 1. Hazard Sector (High cyclomatic debt, complex monoliths)
    if (raw.complexity >= 18 || raw.riskScore >= 75 || raw.is_anomaly || p.includes('/hazard/')) {
      return 'hazard';
    }

    // 2. Forgotten Ruins (Dead code, deprecated utilities)
    if (p.includes('/deprecated/') || p.includes('/legacy/') || p.includes('/old/') || raw.is_dead_code) {
      return 'ruins';
    }

    // 3. UI Metropolis (Components, Views, Styles, Templates, Inspector, HUD)
    if (p.includes('/ui/') || p.includes('/components/') || p.includes('/views/') || p.includes('/styles/') || p.includes('/i18n/') || p.includes('translations') || p.includes('.css') || p.includes('.tsx') || p.includes('.jsx') || p.includes('.vue') || p.includes('index.html')) {
      return 'ui';
    }

    // 4. Power Grid (State, Store, Events, Knowledge Tracker, Audio, SoundFX)
    if (p.includes('/game/') || p.includes('/audio/') || p.includes('/sound') || p.includes('state') || p.includes('tracker') || p.includes('events') || p.includes('/store/') || p.includes('/redux/') || p.includes('/zustand') || p.includes('/bus/')) {
      return 'power';
    }

    // 5. Subterranean Bunker (Data sources, Datasets, SQLite, Models, Persistence, Cache, Ingestion)
    if (p.includes('/data/') || p.includes('dataset') || p.includes('ingest') || p.includes('/db/') || p.includes('/models/') || p.includes('/storage/') || p.includes('/cache/') || p.includes('.json') || p.includes('.sql') || p.includes('.prisma')) {
      return 'bunker';
    }

    // 6. Transmission Hub (APIs, Server, Indexer, AST Parsers, Git Importers, Network, WebSockets, CLI)
    if (p.includes('/indexer/') || p.includes('parser') || p.includes('bridge') || p.includes('scanner') || p.includes('server.js') || p.includes('/bin/') || p.includes('/api/') || p.includes('/routes/') || p.includes('/controllers/') || p.includes('/gateway/') || p.includes('importer') || l === 'route' || l === 'resource') {
      return 'transmission';
    }

    // 7. Research Labs (Analysis algorithms, Centrality, Cycles, Blast Radius, Archaeology, Test suites)
    if (p.includes('/analysis/') || p.includes('centrality') || p.includes('complexity') || p.includes('cycles') || p.includes('blast') || p.includes('archaeology') || p.includes('history') || p.includes('/test/') || p.includes('/tests/') || p.includes('/spec/') || p.includes('benchmark')) {
      return 'lab';
    }

    // 8. Core Citadel (Main engine loop, World layout, Camera, Minimap, Conduits, Buildings)
    return 'core';
  }
}
