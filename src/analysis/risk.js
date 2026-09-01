/**
 * Risk Assessment, Threat Detection, and Dynamic Rarity Score.
 * Decouples Importance (Centrality) from Risk (Instability, Circularity, Churn).
 */

import { computePageRank, computeBetweennessCentrality, calculatePercentiles } from './centrality.js';
import { detectCircularDependencies } from './cycles.js';
import { calculateNodeComplexity } from './complexity.js';

export function analyzeArchitecture(graph) {
  const pageRank = computePageRank(graph);
  const betweenness = computeBetweennessCentrality(graph);
  const cycleData = detectCircularDependencies(graph);

  // Percentiles for relative normalization
  const prPercentiles = calculatePercentiles(pageRank);
  const betPercentiles = calculatePercentiles(betweenness);

  const nodeStats = new Map();
  let totalRisk = 0;
  const threats = [];

  for (const [id, node] of graph.nodes.entries()) {
    const prPct = prPercentiles.get(id) || 0;
    const betPct = betPercentiles.get(id) || 0;
    
    // Centrality percentile composite
    const centralityPct = Math.round(0.6 * betPct + 0.4 * prPct);
    
    const complexityInfo = calculateNodeComplexity(node, graph);
    const { fanIn, fanOut, loc, cyclomaticEstimate } = complexityInfo;
    
    // Total connections
    const totalConnections = fanIn + fanOut;
    const isCyclic = cycleData.cyclicalNodes.has(id);

    // Martin's Instability Metric: I = Ce / (Ca + Ce)
    const instability = totalConnections > 0 ? fanOut / totalConnections : 0;

    // Rarity Score calculation (0 - 100)
    // Rarity Score = 0.35 * centrality + 0.25 * dependency_influence + 0.20 * complexity + 0.20 * coupling
    const depInfluence = Math.min(100, Math.round((fanIn / Math.max(graph.nodes.size * 0.1, 1)) * 100));
    const complexityScore = Math.min(100, Math.round((loc / 300) * 50 + (cyclomaticEstimate / 30) * 50));
    const couplingScore = Math.min(100, Math.round((totalConnections / 20) * 100));

    const rarityScore = Math.min(100, Math.round(
      0.35 * centralityPct +
      0.25 * depInfluence +
      0.20 * complexityScore +
      0.20 * couplingScore
    ));

    // Rarity Tier classification
    let rarity = 'common';
    if (rarityScore >= 97) rarity = 'mythic';
    else if (rarityScore >= 90) rarity = 'legendary';
    else if (rarityScore >= 75) rarity = 'epic';
    else if (rarityScore >= 60) rarity = 'rare';
    else if (rarityScore >= 40) rarity = 'uncommon';

    // Architectural Risk Score calculation (0 - 100)
    // Risk = Concentration of dependents + circularity penalty + high instability on large fanIn + churn
    let riskScore = Math.round(
      (fanIn > 15 ? 30 : fanIn * 2) +
      (isCyclic ? 25 : 0) +
      (cyclomaticEstimate > 20 ? 20 : cyclomaticEstimate) +
      (instability > 0.8 && fanIn > 10 ? 15 : 5) +
      (node.churn ? Math.min(15, node.churn * 2) : 5)
    );
    riskScore = Math.min(98, Math.max(8, riskScore));
    totalRisk += riskScore;

    // Importance vs Risk Categorization
    let archetype = 'standard';
    if (centralityPct > 80 && riskScore < 40) {
      archetype = 'healthy_core'; // Stable pillar (e.g. well-designed engine, router)
    } else if (centralityPct > 80 && riskScore >= 70) {
      archetype = 'threat_boss'; // True Architectural Boss (The Death Star)
    } else if (isCyclic) {
      archetype = 'cyclic_anomaly';
    } else if (fanIn === 0 && fanOut === 0) {
      archetype = 'dead_code';
    }

    const stats = {
      id,
      name: node.name,
      path: node.path || node.name,
      type: node.type || 'module',
      biome: node.biome || 'core',
      centralityPct,
      pageRank: pageRank.get(id) || 0,
      betweenness: betweenness.get(id) || 0,
      fanIn,
      fanOut,
      totalConnections,
      isCyclic,
      instability: Math.round(instability * 100),
      loc,
      cyclomatic: cyclomaticEstimate,
      rarityScore,
      rarity,
      riskScore,
      archetype,
      churn: node.churn || 1
    };

    nodeStats.set(id, stats);

    if (archetype === 'threat_boss' || riskScore >= 75) {
      threats.push({
        id,
        name: node.name,
        alias: generateThreatAlias(node.name, isCyclic, fanIn),
        riskScore,
        fanIn,
        fanOut,
        isCyclic,
        cyclomatic: cyclomaticEstimate,
        criticalPaths: Math.min(12, Math.round(fanIn / 3) + (isCyclic ? 3 : 0)),
        reasons: [
          fanIn > 20 ? `High dependency concentration (${fanIn} dependents)` : `Moderate blast footprint (${fanIn} dependents)`,
          isCyclic ? 'Entangled in circular dependency cycles' : 'High fan-in structural coupling',
          cyclomaticEstimate > 20 ? `High cyclomatic complexity (${cyclomaticEstimate})` : `Complex branching logic (${cyclomaticEstimate})`,
          `Instability coefficient: ${Math.round(instability * 100)}%`
        ]
      });
    }
  }

  threats.sort((a, b) => b.riskScore - a.riskScore);

  const avgRisk = graph.nodes.size > 0 ? Math.round(totalRisk / graph.nodes.size) : 0;

  return {
    nodeStats,
    cycleData,
    threats,
    systemMetrics: {
      totalEntities: graph.nodes.size,
      totalEdges: graph.edges.length,
      avgRisk,
      healthStatus: avgRisk > 60 ? 'CRITICAL' : avgRisk > 35 ? 'DEVELOPING' : 'STABLE',
      cycleCount: cycleData.cycleCount,
      threatCount: threats.length
    }
  };
}

function generateThreatAlias(name, isCyclic, fanIn) {
  if (isCyclic) return `THE CYCLIC WORMHOLE (${name})`;
  if (fanIn > 30) return `THE DEATH STAR MONOLITH (${name})`;
  if (fanIn > 15) return `THE ENTANGLED NEXUS (${name})`;
  return `THE HIGH-RISK BOTTLENECK (${name})`;
}
