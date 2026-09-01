/**
 * Custom Codebase Graph Ingestor.
 * Parses custom JSON graphs, codebase dumps, or AST schemas into a CodeGraph.
 */

import { CodeGraph } from '../analysis/graph.js';

export function parseCustomGraphJSON(jsonData) {
  const graph = new CodeGraph();

  if (!jsonData || typeof jsonData !== 'object') {
    throw new Error('Invalid JSON format for codebase graph.');
  }

  const nodes = jsonData.nodes || jsonData.entities || [];
  const edges = jsonData.edges || jsonData.links || jsonData.relations || [];

  for (const n of nodes) {
    graph.addNode({
      id: String(n.id || n.name),
      name: String(n.name || n.id),
      path: n.path || n.name || n.id,
      type: n.type || 'module',
      biome: n.biome || 'core',
      loc: Number(n.loc || n.size || 80),
      cyclomatic: Number(n.cyclomatic || n.complexity || 5),
      churn: Number(n.churn || 1)
    });
  }

  for (const e of edges) {
    const source = String(e.source || e.from || e.caller);
    const target = String(e.target || e.to || e.callee);
    if (source && target) {
      graph.addEdge({
        source,
        target,
        type: e.type || e.label || 'imports'
      });
    }
  }

  return graph;
}
