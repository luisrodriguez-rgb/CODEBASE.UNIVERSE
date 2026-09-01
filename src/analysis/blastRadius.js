/**
 * Blast Radius Simulation Engine for CODEBASE.UNIVERSE.
 * Quantifies collateral damage, casualty pipelines, and cascading failure propagation.
 * ZERO EMOJIS.
 */

export function calculateBlastRadius(graph, arg2, arg3, arg4) {
  let targetNodeId = typeof arg2 === 'string' ? arg2 : arg3;
  let scenario = typeof arg3 === 'string' && typeof arg2 === 'string' ? arg3 : arg4 || 'failure';

  if (!graph || !graph.nodes || !graph.nodes.has(targetNodeId)) {
    return {
      targetId: targetNodeId || '',
      targetName: targetNodeId || '',
      scenario,
      totalNodes: graph?.nodes?.size || 0,
      affectedCount: 0,
      directCount: 0,
      indirectCount: 0,
      directDependents: [],
      indirectDependents: [],
      blastRadiusScore: 10,
      blastRadiusPct: 10,
      criticalPathsCount: 1,
      criticalPaths: 1,
      affectedDetails: []
    };
  }

  const targetNode = graph.getNode(targetNodeId);
  const cascade = graph.getDownstreamCascade(targetNodeId);
  const totalNodes = graph.nodes.size;

  const directDependents = graph.getDependents(targetNodeId);
  const directSet = new Set(directDependents);
  const indirectDependents = cascade.affectedNodes.filter(id => !directSet.has(id));

  const affectedCount = cascade.affectedNodes.length;
  const directCount = directDependents.length;
  const indirectCount = indirectDependents.length;

  const blastRadiusPct = Math.min(100, Math.round((affectedCount / Math.max(totalNodes, 1)) * 100));
  const criticalPaths = Math.max(1, Math.min(24, Math.round(directCount * 1.5) + Math.round(indirectCount * 0.4)));

  const affectedDetails = cascade.affectedNodes.map(id => {
    const node = graph.getNode(id);
    return {
      id,
      name: node?.name || id,
      type: node?.type || 'module',
      biome: node?.biome || 'core',
      isDirect: directSet.has(id)
    };
  });

  return {
    targetId: targetNodeId,
    targetName: targetNode?.name || targetNodeId,
    scenario,
    totalNodes,
    affectedCount,
    directCount,
    indirectCount,
    directDependents,
    indirectDependents,
    blastRadiusScore: Math.max(10, blastRadiusPct),
    blastRadiusPct: Math.max(10, blastRadiusPct),
    criticalPathsCount: criticalPaths,
    criticalPaths,
    affectedDetails
  };
}
