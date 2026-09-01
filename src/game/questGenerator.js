/**
 * Procedural Quest Generator.
 * Generates project-specific architectural challenges, onboarding questlines, and detective cases.
 */

export function generateProjectQuests(graph, analysis) {
  const quests = [];
  const nodeStats = analysis.nodeStats;

  // 1. Onboarding Quest 1: Entry Point
  const entryCandidate = Array.from(nodeStats.values()).find(
    n => n.type === 'project' || n.name.toLowerCase().includes('main') || n.name.toLowerCase().includes('index') || n.name.toLowerCase().includes('app')
  ) || Array.from(nodeStats.values())[0];

  if (entryCandidate) {
    quests.push({
      id: 'quest_entry_point',
      category: 'onboarding',
      title: 'THE GENESIS POINT',
      description: 'Locate the primary application bootstrap entry point.',
      hint: `Search in the ${entryCandidate.biome.toUpperCase()} sector for the main startup sequence.`,
      targetId: entryCandidate.id,
      rewardXp: 400,
      completed: false,
      difficulty: '★☆☆☆☆'
    });
  }

  // 2. Onboarding Quest 2: Highest Centrality Nexus
  let highestCentrality = null;
  let maxCent = -1;
  for (const stat of nodeStats.values()) {
    if (stat.centralityPct > maxCent) {
      maxCent = stat.centralityPct;
      highestCentrality = stat;
    }
  }

  if (highestCentrality) {
    quests.push({
      id: 'quest_central_nexus',
      category: 'onboarding',
      title: 'THE ARCHITECTURAL HEART',
      description: 'Find the entity with the highest betweenness centrality in the entire system.',
      hint: `It controls more execution paths than 95% of the repository. Look for a Legendary entity.`,
      targetId: highestCentrality.id,
      rewardXp: 750,
      completed: false,
      difficulty: '★★★☆☆'
    });
  }

  // 3. Onboarding Quest 3: Subterranean Bunker / Database Layer
  const dbCandidate = Array.from(nodeStats.values()).find(
    n => n.biome === 'bunker' || n.name.toLowerCase().includes('store') || n.name.toLowerCase().includes('db') || n.name.toLowerCase().includes('cache')
  );
  if (dbCandidate) {
    quests.push({
      id: 'quest_persistence_vault',
      category: 'onboarding',
      title: 'THE MEMORY VAULT',
      description: 'Discover the state persistence and database foundation layer.',
      hint: `Inspect the Subterranean Bunker sector.`,
      targetId: dbCandidate.id,
      rewardXp: 500,
      completed: false,
      difficulty: '★★☆☆☆'
    });
  }

  // 4. Detective Quest: Circular Dependency Wormhole
  const cyclicNodes = Array.from(analysis.cycleData.cyclicalNodes);
  if (cyclicNodes.length > 0) {
    const cycleTargetId = cyclicNodes[0];
    const cycleTarget = nodeStats.get(cycleTargetId);
    quests.push({
      id: 'quest_circular_anomaly',
      category: 'detective',
      title: 'ANOMALY DETECTIVE: CIRCULAR FEEDBACK',
      description: 'An architectural cycle exists where modules depend mutually on each other. Identify the anomaly.',
      hint: `Filter the radar by ANOMALIES (CYCLES) to pinpoint entangled red nodes.`,
      targetId: cycleTargetId,
      rewardXp: 1200,
      completed: false,
      difficulty: '★★★★☆'
    });
  }

  // 5. Detective Quest: The Death Star Monolith
  if (analysis.threats.length > 0) {
    const topThreat = analysis.threats[0];
    quests.push({
      id: 'quest_threat_boss',
      category: 'detective',
      title: 'THE ARCHITECTURAL THREAT',
      description: `Investigate the highest risk hotspot in the system (${topThreat.name}) and review its refactor strategy.`,
      hint: `Risk rating is ${topThreat.riskScore}%. It has ${topThreat.fanIn} dependent modules.`,
      targetId: topThreat.id,
      rewardXp: 1500,
      completed: false,
      difficulty: '★★★★★'
    });
  }

  // 6. Daily Challenge: Trace Critical Path
  quests.push({
    id: 'quest_daily_critical_path',
    category: 'daily',
    title: 'DAILY ARCHITECT: TRACE DATA FLOW',
    description: 'Trace an end-to-end execution pipeline from the Metropolis Grid (UI) to the Subterranean Bunker.',
    hint: 'Select an interface or component and follow its outgoing dependency chain.',
    targetId: entryCandidate?.id || '',
    rewardXp: 600,
    completed: false,
    difficulty: '★★★☆☆'
  });

  return quests;
}
