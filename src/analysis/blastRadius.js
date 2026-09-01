/**
 * Blast Radius Simulation Engine.
 * Quantifies collateral damage and cascading failure propagation.
 */

export function calculateBlastRadius(graph, targetNodeId, scenario = 'failure') {
  if (!graph.nodes.has(targetNodeId)) {
    return null;
  }

  const targetNode = graph.getNode(targetNodeId);
  const cascade = graph.getDownstreamCascade(targetNodeId);
  const totalNodes = graph.nodes.size;

  const affectedCount = cascade.affectedNodes.length;
  const directCount = cascade.directCount;
  const indirectCount = cascade.indirectCount;

  // Blast Radius Percentage relative to repository size
  const blastRadiusPct = Math.min(100, Math.round((affectedCount / Math.max(totalNodes, 1)) * 100));

  // Critical paths quantification
  const criticalPaths = Math.max(1, Math.min(24, Math.round(directCount * 1.5) + Math.round(indirectCount * 0.4)));

  // Categorize affected entities
  const affectedDetails = cascade.affectedNodes.map(id => {
    const node = graph.getNode(id);
    return {
      id,
      name: node.name,
      type: node.type,
      biome: node.biome,
      isDirect: graph.getDependents(targetNodeId).includes(id)
    };
  });

  return {
    targetId: targetNodeId,
    targetName: targetNode.name,
    scenario,
    totalNodes,
    affectedCount,
    directCount,
    indirectCount,
    blastRadiusPct,
    criticalPaths,
    cascadeLevels: Object.fromEntries(cascade.cascadeLevels),
    affectedDetails
  };
}
