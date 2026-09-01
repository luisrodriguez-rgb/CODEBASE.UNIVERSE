/**
 * Structural mass and complexity metrics.
 */

export function calculateNodeComplexity(node, graph) {
  const fanIn = graph.getDependents(node.id).length;
  const fanOut = graph.getDependencies(node.id).length;
  const loc = node.loc || 50;
  
  // Henry-Kafura Information Flow Complexity approximation: LOC * (fanIn * fanOut)^2
  const structuralMass = loc * Math.log2(Math.max(fanIn + fanOut, 2));
  
  // Cyclomatic estimate
  const cyclomaticEstimate = Math.max(1, Math.round(loc / 12) + (node.cyclomatic || 0));

  return {
    fanIn,
    fanOut,
    loc,
    structuralMass,
    cyclomaticEstimate
  };
}
