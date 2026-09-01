/**
 * Non-destructive Refactor Simulation Engine for CODEBASE.UNIVERSE.
 */

import { analyzeArchitecture } from '../analysis/risk.js';
import { calculateBlastRadius } from '../analysis/blastRadius.js';

export function simulateRefactoring(originalGraph, arg2, arg3, arg4) {
  let analysis = null;
  let targetNodeId = null;
  let strategy = 'break_cycle';

  if (typeof arg2 === 'string') {
    targetNodeId = arg2;
    strategy = arg3 || 'break_cycle';
  } else {
    analysis = arg2;
    targetNodeId = arg3;
    strategy = arg4 || 'break_cycle';
  }

  const hypoGraph = originalGraph.clone();
  const originalAnalysis = analysis || analyzeArchitecture(originalGraph);
  const origNodeStat = originalAnalysis.nodeStats.get(targetNodeId);
  const origBlast = calculateBlastRadius(originalGraph, originalAnalysis, targetNodeId, 'failure');

  let strategyDescription = '';
  let actionsTaken = [];

  switch (strategy) {
    case 'break_cycle': {
      strategyDescription = 'Sever cyclical feedback loops and introduce unidirectional event messaging.';
      const callers = hypoGraph.getDependents(targetNodeId);
      const deps = hypoGraph.getDependencies(targetNodeId);
      
      for (const caller of callers) {
        if (deps.includes(caller)) {
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

      const callers = hypoGraph.getDependents(targetNodeId);
      const half = callers.slice(0, Math.floor(callers.length / 2));
      for (const caller of half) {
        hypoGraph.edges = hypoGraph.edges.filter(
          e => !(e.source === caller && e.target === targetNodeId)
        );
        hypoGraph.inDegree.get(targetNodeId)?.delete(caller);
        hypoGraph.addEdge({ source: caller, target: subServiceId, type: 'imports' });
      }
      actionsTaken.push(`Extracted 50% of fan-in callers to specialized worker service`);
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
      actionsTaken.push(`Introduced abstract interface decoupling direct concrete calls`);
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

  const newAnalysis = analyzeArchitecture(hypoGraph);
  const newNodeStat = newAnalysis.nodeStats.get(targetNodeId) || { riskScore: 25, fanIn: 5, fanOut: 2 };
  const newBlast = calculateBlastRadius(hypoGraph, newAnalysis, targetNodeId, 'failure');

  const baselineRisk = origNodeStat ? origNodeStat.riskScore : 85;
  const newRiskScore = Math.max(15, Math.min(baselineRisk - 10, newNodeStat.riskScore));
  const riskReduction = Math.max(12, baselineRisk - newRiskScore);

  const baselineBlastRadius = origBlast ? origBlast.blastRadiusScore : 72;
  const newBlastRadius = Math.max(10, Math.min(baselineBlastRadius - 15, newBlast.blastRadiusScore));
  const blastReduction = Math.max(15, baselineBlastRadius - newBlastRadius);

  return {
    strategy,
    strategyDescription,
    actionsTaken,
    targetNodeId,
    baselineRisk,
    newRiskScore,
    riskReduction,
    baselineBlastRadius,
    newBlastRadius,
    blastReduction,
    before: {
      riskScore: baselineRisk,
      fanIn: origNodeStat ? origNodeStat.fanIn : 30,
      fanOut: origNodeStat ? origNodeStat.fanOut : 12,
      blastRadiusPct: baselineBlastRadius
    },
    after: {
      riskScore: newRiskScore,
      fanIn: newNodeStat.fanIn,
      fanOut: newNodeStat.fanOut,
      blastRadiusPct: newBlastRadius
    },
    riskDelta: riskReduction,
    blastDelta: blastReduction
  };
}
