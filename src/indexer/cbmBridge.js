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

    if (l === 'route' || l === 'resource' || p.includes('/api/') || p.includes('/routes/') || p.includes('/controllers/') || p.includes('/gateway/')) {
      return 'transmission';
    }
    if (p.includes('/ui/') || p.includes('/components/') || p.includes('/views/') || p.includes('.tsx') || p.includes('.jsx') || p.includes('.vue')) {
      return 'ui';
    }
    if (p.includes('/store/') || p.includes('/state/') || p.includes('/events/') || p.includes('/redux/') || p.includes('/emitter/')) {
      return 'power';
    }
    if (p.includes('/db/') || p.includes('/models/') || p.includes('/storage/') || p.includes('/cache/') || p.includes('/repository/')) {
      return 'bunker';
    }
    if (p.includes('/test/') || p.includes('/spec/') || p.includes('test.') || p.includes('/benchmark/')) {
      return 'lab';
    }
    if (p.includes('/deprecated/') || p.includes('/legacy/') || raw.is_dead_code) {
      return 'ruins';
    }
    return 'core';
  }
}
