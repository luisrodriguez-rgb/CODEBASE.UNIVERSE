/**
 * High-Performance Centrality Calculation Algorithms: PageRank, Betweenness Centrality, and Percentile rankings.
 * Optimized for 60 FPS and instant analysis on large repositories (React, Vue, Linux Kernel).
 * ZERO EMOJIS.
 */

/**
 * Computes PageRank for all nodes in the graph with early convergence.
 */
export function computePageRank(graph, dampingFactor = 0.85, maxIterations = 30, tolerance = 1e-4) {
  const nodeIds = Array.from(graph.nodes.keys());
  const N = nodeIds.length;
  if (N === 0) return new Map();

  const rank = new Map();
  const nextRank = new Map();
  const initialValue = 1 / N;

  for (const id of nodeIds) {
    rank.set(id, initialValue);
  }

  for (let iter = 0; iter < maxIterations; iter++) {
    let diff = 0;
    const baseRank = (1 - dampingFactor) / N;

    for (const id of nodeIds) {
      let sum = 0;
      const inbound = graph.getDependents(id);
      for (const callerId of inbound) {
        const outDeg = graph.getDependencies(callerId).length;
        if (outDeg > 0) {
          sum += rank.get(callerId) / outDeg;
        }
      }
      const newScore = baseRank + dampingFactor * sum;
      nextRank.set(id, newScore);
      diff += Math.abs(newScore - (rank.get(id) || 0));
    }

    for (const id of nodeIds) {
      rank.set(id, nextRank.get(id));
    }

    if (diff < tolerance) break;
  }

  return rank;
}

/**
 * Computes fast approximate Betweenness Centrality using O(1) queue pointers and landmark sampling.
 */
export function computeBetweennessCentrality(graph, sampleLimit = 40) {
  const nodeIds = Array.from(graph.nodes.keys());
  const N = nodeIds.length;
  const betweenness = new Map();
  for (const id of nodeIds) betweenness.set(id, 0);

  if (N === 0) return betweenness;

  // Sample landmark nodes based on degree
  let sampleNodes = nodeIds;
  if (N > sampleLimit) {
    sampleNodes = nodeIds
      .slice()
      .sort((a, b) => (graph.getDependencies(b).length + graph.getDependents(b).length) - (graph.getDependencies(a).length + graph.getDependents(a).length))
      .slice(0, sampleLimit);
  }

  for (const s of sampleNodes) {
    const stack = [];
    const pred = new Map();
    const sigma = new Map();
    const d = new Map();

    for (const id of nodeIds) {
      pred.set(id, []);
      sigma.set(id, 0);
      d.set(id, -1);
    }

    sigma.set(s, 1);
    d.set(s, 0);

    const queue = [s];
    let qHead = 0;

    while (qHead < queue.length) {
      const v = queue[qHead++];
      stack.push(v);

      const neighbors = graph.getDependencies(v);
      for (const w of neighbors) {
        if (d.get(w) < 0) {
          queue.push(w);
          d.set(w, d.get(v) + 1);
        }
        if (d.get(w) === d.get(v) + 1) {
          sigma.set(w, sigma.get(w) + sigma.get(v));
          pred.get(w).push(v);
        }
      }
    }

    const delta = new Map();
    for (const id of nodeIds) delta.set(id, 0);

    while (stack.length > 0) {
      const w = stack.pop();
      for (const v of pred.get(w)) {
        const c = (sigma.get(v) / sigma.get(w)) * (1 + delta.get(w));
        delta.set(v, delta.get(v) + c);
      }
      if (w !== s) {
        betweenness.set(w, betweenness.get(w) + delta.get(w));
      }
    }
  }

  // Safe Max Normalization without spreading huge arrays
  let maxB = 1;
  for (const b of betweenness.values()) {
    if (b > maxB) maxB = b;
  }

  for (const [id, b] of betweenness.entries()) {
    betweenness.set(id, b / maxB);
  }

  return betweenness;
}

/**
 * Calculates dynamic percentiles for any metric map across nodes without stack overflow.
 */
export function calculatePercentiles(metricMap) {
  const sorted = Array.from(metricMap.entries()).sort((a, b) => a[1] - b[1]);
  const percentiles = new Map();
  const N = sorted.length;

  if (N <= 1) {
    for (const [id] of sorted) percentiles.set(id, 50);
    return percentiles;
  }

  for (let i = 0; i < N; i++) {
    const pct = Math.round((i / (N - 1)) * 100);
    percentiles.set(sorted[i][0], pct);
  }

  return percentiles;
}
