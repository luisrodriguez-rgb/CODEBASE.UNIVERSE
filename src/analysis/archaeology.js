/**
 * Code Archaeology & Relic Analyzer for CODEBASE.UNIVERSE.
 * Classifies historic relics, abandoned APIs, historical foundations, and fossilized dead code.
 * ZERO EMOJIS.
 */

export function analyzeArchaeology(graph, analysis) {
  const relics = [];
  const nodeStats = analysis.nodeStats;

  for (const [id, node] of graph.nodes.entries()) {
    const stat = nodeStats.get(id);
    if (!stat) continue;

    const fanIn = stat.fanIn;
    const fanOut = stat.fanOut;
    const totalConnections = fanIn + fanOut;

    // Relic Category 1: Dead Code / Abandoned Monolith (Zero incoming & outgoing calls)
    if (totalConnections === 0) {
      relics.push({
        id,
        name: node.name,
        path: node.path,
        biome: node.biome,
        category: 'DEAD_CODE',
        title: 'ABANDONED ORPHAN CODE',
        title_es: 'CÓDIGO HUÉRFANO ABANDONADO',
        description: 'Module is completely decoupled from active execution pipelines.',
        description_es: 'El módulo está totalmente desacoplado de las tuberías de ejecución.',
        ageMonths: 18,
        riskScore: 20,
        relicBadge: '[DEAD CODE]'
      });
      continue;
    }

    // Relic Category 2: Abandoned API (Outbound calls exist, but no incoming callers)
    if (fanIn === 0 && fanOut > 0 && node.type !== 'project') {
      relics.push({
        id,
        name: node.name,
        path: node.path,
        biome: node.biome,
        category: 'ABANDONED_API',
        title: 'UNUSED ENTRYPOINT / ABANDONED API',
        title_es: 'PUNTO DE ENTRADA OBSOLETO / API ABANDONADA',
        description: 'Module consumes dependencies but is never called by other subsystems.',
        description_es: 'El módulo consume dependencias pero ningún subsistema lo invoca.',
        ageMonths: 14,
        riskScore: 40,
        relicBadge: '[ABANDONED API]'
      });
      continue;
    }

    // Relic Category 3: Historical Core (Very high centrality, low change frequency, foundational)
    if (stat.centralityPct >= 92 && stat.rarityScore >= 88) {
      relics.push({
        id,
        name: node.name,
        path: node.path,
        biome: node.biome,
        category: 'HISTORICAL_CORE',
        title: 'FOUNDATIONAL ARCHITECTURAL MONOLITH',
        title_es: 'MONOLITO ARQUITECTÓNICO FUNDACIONAL',
        description: 'Pillar module that has formed the backbone of the repository across generations.',
        description_es: 'Módulo pilar que ha formado la columna vertebral del repositorio a través de generaciones.',
        ageMonths: 24,
        riskScore: stat.riskScore,
        relicBadge: '[HISTORICAL CORE]'
      });
      continue;
    }

    // Relic Category 4: Remnant Cyclic Dependency
    if (stat.isCyclic && fanIn > 5) {
      relics.push({
        id,
        name: node.name,
        path: node.path,
        biome: node.biome,
        category: 'REMNANT_FEEDBACK',
        title: 'HISTORICAL CYCLIC REMNANT',
        title_es: 'VESTIGIO DE BUCLE HISTÓRICO',
        description: 'Legacy circular feedback entanglement carried over across releases.',
        description_es: 'Acoplamiento circular heredado a lo largo de múltiples versiones.',
        ageMonths: 11,
        riskScore: 78,
        relicBadge: '[CYCLIC REMNANT]'
      });
    }
  }

  return {
    relics,
    deadCodeCount: relics.filter(r => r.category === 'DEAD_CODE').length,
    abandonedApiCount: relics.filter(r => r.category === 'ABANDONED_API').length,
    historicalCoreCount: relics.filter(r => r.category === 'HISTORICAL_CORE').length,
    cyclicRemnantCount: relics.filter(r => r.category === 'REMNANT_FEEDBACK').length
  };
}
