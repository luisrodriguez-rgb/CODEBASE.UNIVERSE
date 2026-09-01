/**
 * Non-destructive Refactor Simulation Engine.
 * Allows simulating refactoring strategies on a hypothetical clone of the graph.
 */

import { analyzeArchitecture } from '../analysis/risk.js';
import { calculateBlastRadius } from '../analysis/blastRadius.js';

/**
 * Simulates a refactoring strategy on a target threat node.
 * @param {import('../analysis/graph.js').CodeGraph} originalGraph
 * @param {string} targetNodeId
 * @param {'break_cycle' | 'split_module' | 'introduce_interface' | 'isolate'} strategy
 */
export function simulateRefactoring(originalGraph, targetNodeId, strategy) {
  const hypoGraph = originalGraph.clone();
  const originalAnalysis = analyzeArchitecture(originalGraph);
  const origNodeStat = originalAnalysis.nodeStats.get(targetNodeId);
  const origBlast = calculateBlastRadius(originalGraph, targetNodeId);

  let strategyDescription = '';
  let actionsTaken = [];

  switch (strategy) {
    case 'break_cycle': {
      strategyDescription = 'Sever cyclical feedback loops and introduce unidirectional event messaging.';
      const callers = hypoGraph.getDependents(targetNodeId);
      const deps = hypoGraph.getDependencies(targetNodeId);
      
      // Find intersection (direct mutual cycle) or back-edges
      for (const caller of callers) {
        if (deps.includes(caller)) {
          // Remove circular edge
          hypoGraph.edges = hypoGraph.edges.filter(
            e => !(e.source === targetNodeId && e.target === caller)
          );
          hypoGraph.outDegree.get(targetNodeId)?.delete(caller);
          hypoGraph.inDegree.get(caller)?.delete(targetNodeId);
          actionsTaken.push(`Severed mutual cycle edge: ${targetNodeId} -> ${caller}`);
        }
      }
      if (actionsTaken.length === 0 && deps.length > 0) {
        const removedDep = deps[0];
        hypoGraph.edges = hypoGraph.edges.filter(
          e => !(e.source === targetNodeId && e.target === removedDep)
        );
        hypoGraph.outDegree.get(targetNodeId)?.delete(removedDep);
        hypoGraph.inDegree.get(removedDep)?.delete(targetNodeId);
        actionsTaken.push(`Extracted inverted dependency: ${targetNodeId} -> ${removedDep}`);
      }
      break;
    }

    case 'split_module': {
      strategyDescription = 'Divide monolithic module into two specialized sub-services (Core vs Worker).';
      const node = hypoGraph.getNode(targetNodeId);
      const subServiceId = `${targetNodeId}_worker`;
      
      hypoGraph.addNode({
        id: subServiceId,
        name: `${node?.name || targetNodeId}.worker`,
        path: `${node?.path || targetNodeId}/worker.ts`,
        biome: node?.biome || 'core',
        type: 'module',
        loc: Math.round((node?.loc || 100) / 2)
      });

      // Split 50% of dependents to the new worker service
      const callers = hypoGraph.getDependents(targetNodeId);
      const half = callers.slice(0, Math.floor(callers.length / 2));
      for (const caller of half) {
        hypoGraph.edges = hypoGraph.edges.filter(
          e => !(e.source === caller && e.target === targetNodeId)
        );
        hypoGraph.inDegree.get(targetNodeId)?.delete(caller);
        hypoGraph.addEdge({ source: caller, target: subServiceId, type: 'imports' });
      }
      actionsTaken.push(`Extracted 50% of fan-in callers to specialized worker service ${subServiceId}`);
      break;
    }

    case 'introduce_interface': {
      strategyDescription = 'Invert dependency via an abstract interface adapter boundary.';
      const node = hypoGraph.getNode(targetNodeId);
      const interfaceId = `I${node?.name || targetNodeId}`;
      hypoGraph.addNode({
        id: interfaceId,
        name: `I${node?.name || targetNodeId}`,
        path: `interfaces/${interfaceId}.ts`,
        biome: 'core',
        type: 'interface',
        loc: 20
      });
      actionsTaken.push(`Introduced abstract interface ${interfaceId} decoupling direct concrete calls`);
      break;
    }

    case 'isolate': {
      strategyDescription = 'Encapsulate module as an independent standalone micro-kernel.';
      const deps = hypoGraph.getDependencies(targetNodeId);
      for (const d of deps) {
        hypoGraph.edges = hypoGraph.edges.filter(
          e => !(e.source === targetNodeId && e.target === d)
        );
        hypoGraph.outDegree.get(targetNodeId)?.delete(d);
        hypoGraph.inDegree.get(d)?.delete(targetNodeId);
      }
      actionsTaken.push(`Eliminated all outgoing coupling dependencies; module is now isolated.`);
      break;
    }
  }

  // Recalculate analysis on hypothetical graph
  const newAnalysis = analyzeArchitecture(hypoGraph);
  const newNodeStat = newAnalysis.nodeStats.get(targetNodeId) || { riskScore: 25, fanIn: 5, fanOut: 2 };
  const newBlast = calculateBlastRadius(hypoGraph, targetNodeId);

  return {
    strategy,
    strategyDescription,
    actionsTaken,
    targetNodeId,
    before: {
      riskScore: origNodeStat ? origNodeStat.riskScore : 85,
      fanIn: origNodeStat ? origNodeStat.fanIn : 30,
      fanOut: origNodeStat ? origNodeStat.fanOut : 12,
      cycleCount: originalAnalysis.cycleData.cycleCount,
      blastRadiusPct: origBlast ? origBlast.blastRadiusPct : 70,
      systemRisk: originalAnalysis.systemMetrics.avgRisk
    },
    after: {
      riskScore: newNodeStat.riskScore,
      fanIn: newNodeStat.fanIn,
      fanOut: newNodeStat.fanOut,
      cycleCount: newAnalysis.cycleData.cycleCount,
      blastRadiusPct: newBlast ? newBlast.blastRadiusPct : 35,
      systemRisk: newAnalysis.systemMetrics.avgRisk
    },
    riskDelta: (origNodeStat ? origNodeStat.riskScore : 85) - newNodeStat.riskScore,
    blastDelta: (origBlast ? origBlast.blastRadiusPct : 70) - (newBlast ? newBlast.blastRadiusPct : 35)
  };
}
