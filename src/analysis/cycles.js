/**
 * Tarjan's algorithm for Strongly Connected Components (SCC) to detect circular dependency anomalies.
 */

export function detectCircularDependencies(graph) {
  let index = 0;
  const stack = [];
  const indices = new Map();
  const lowlinks = new Map();
  const onStack = new Map();
  const sccs = [];

  function strongConnect(nodeId) {
    indices.set(nodeId, index);
    lowlinks.set(nodeId, index);
    index++;
    stack.push(nodeId);
    onStack.set(nodeId, true);

    const neighbors = graph.getDependencies(nodeId);
    for (const targetId of neighbors) {
      if (!indices.has(targetId)) {
        strongConnect(targetId);
        lowlinks.set(nodeId, Math.min(lowlinks.get(nodeId), lowlinks.get(targetId)));
      } else if (onStack.get(targetId)) {
        lowlinks.set(nodeId, Math.min(lowlinks.get(nodeId), indices.get(targetId)));
      }
    }

    if (lowlinks.get(nodeId) === indices.get(nodeId)) {
      const scc = [];
      let w;
      do {
        w = stack.pop();
        onStack.set(w, false);
        scc.push(w);
      } while (w !== nodeId);

      if (scc.length > 1) {
        sccs.push(scc);
      }
    }
  }

  for (const nodeId of graph.nodes.keys()) {
    if (!indices.has(nodeId)) {
      strongConnect(nodeId);
    }
  }

  // Build cycle anomaly metadata
  return {
    cycles: sccs,
    cycleCount: sccs.length,
    cyclicalNodes: new Set(sccs.flat())
  };
}
