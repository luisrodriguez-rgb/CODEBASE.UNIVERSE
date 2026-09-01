/**
 * Procedural Quest Generator for CODEBASE.UNIVERSE.
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
      code: 'QST #01',
      category: 'onboarding',
      title: 'THE GENESIS POINT',
      title_es: 'EL PUNTO DE GÉNESIS',
      description: 'Locate the primary application bootstrap entry point.',
      description_es: 'Localiza el punto de entrada principal del arranque de la aplicación.',
      hint: `Search in the ${entryCandidate.biome.toUpperCase()} sector for the main startup sequence.`,
      hint_es: `Busca en el sector ${entryCandidate.biome.toUpperCase()} la secuencia de inicio principal.`,
      targetId: entryCandidate.id,
      targetNodeId: entryCandidate.id,
      rewardXP: 400,
      rewardXp: 400,
      completed: false,
      difficulty: '1/5'
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
      code: 'QST #02',
      category: 'onboarding',
      title: 'THE ARCHITECTURAL HEART',
      title_es: 'EL CORAZÓN ARQUITECTÓNICO',
      description: 'Find the entity with the highest betweenness centrality in the entire system.',
      description_es: 'Encuentra la entidad con la mayor centralidad de intermediación de todo el sistema.',
      hint: 'It controls more execution paths than 95% of the repository. Look for a Legendary entity.',
      hint_es: 'Controla más rutas de ejecución que el 95% del repositorio. Busca una entidad Legendaria.',
      targetId: highestCentrality.id,
      targetNodeId: highestCentrality.id,
      rewardXP: 750,
      rewardXp: 750,
      completed: false,
      difficulty: '3/5'
    });
  }

  // 3. Onboarding Quest 3: Subterranean Bunker / Database Layer
  const dbCandidate = Array.from(nodeStats.values()).find(
    n => n.biome === 'bunker' || n.name.toLowerCase().includes('store') || n.name.toLowerCase().includes('db') || n.name.toLowerCase().includes('cache')
  );
  if (dbCandidate) {
    quests.push({
      id: 'quest_persistence_vault',
      code: 'QST #03',
      category: 'onboarding',
      title: 'THE MEMORY VAULT',
      title_es: 'LA BÓVEDA DE PERSISTENCIA',
      description: 'Discover the state persistence and database foundation layer.',
      description_es: 'Descubre la capa de base de datos y persistencia del estado.',
      hint: 'Inspect the Subterranean Bunker sector.',
      hint_es: 'Inspecciona el sector del Búnker Subterráneo.',
      targetId: dbCandidate.id,
      targetNodeId: dbCandidate.id,
      rewardXP: 500,
      rewardXp: 500,
      completed: false,
      difficulty: '2/5'
    });
  }

  // 4. Detective Quest: Circular Dependency Wormhole
  const cyclicNodes = Array.from(analysis.cycleData.cyclicalNodes);
  if (cyclicNodes.length > 0) {
    const cycleTargetId = cyclicNodes[0];
    quests.push({
      id: 'quest_circular_anomaly',
      code: 'DET #01',
      category: 'detective',
      title: 'ANOMALY DETECTIVE: CIRCULAR FEEDBACK',
      title_es: 'DETECTIVE DE ANOMALÍAS: BUCLE CIRCULAR',
      description: 'An architectural cycle exists where modules depend mutually on each other. Identify the anomaly.',
      description_es: 'Existe un ciclo arquitectónico donde los módulos dependen mutuamente entre sí. Identifica la anomalía.',
      hint: 'Filter the radar by ANOMALIES (CYCLES) to pinpoint entangled red nodes.',
      hint_es: 'Filtra el radar por ANOMALÍAS (CICLOS) para localizar los nodos rojos entrelazados.',
      targetId: cycleTargetId,
      targetNodeId: cycleTargetId,
      rewardXP: 1200,
      rewardXp: 1200,
      completed: false,
      difficulty: '4/5'
    });
  }

  // 5. Detective Quest: The Death Star Monolith
  if (analysis.threats.length > 0) {
    const topThreat = analysis.threats[0];
    quests.push({
      id: 'quest_threat_boss',
      code: 'DET #02',
      category: 'detective',
      title: 'THE ARCHITECTURAL THREAT',
      title_es: 'LA AMENAZA ARQUITECTÓNICA',
      description: `Investigate the highest risk hotspot in the system (${topThreat.name}) and review its refactor strategy.`,
      description_es: `Investiga el punto crítico de mayor riesgo del sistema (${topThreat.name}) y revisa su estrategia de refactor.`,
      hint: `Risk rating is ${topThreat.riskScore}%. It has ${topThreat.fanIn} dependent modules.`,
      hint_es: `El nivel de riesgo es del ${topThreat.riskScore}%. Tiene ${topThreat.fanIn} módulos dependientes.`,
      targetId: topThreat.id,
      targetNodeId: topThreat.id,
      rewardXP: 1500,
      rewardXp: 1500,
      completed: false,
      difficulty: '5/5'
    });
  }

  // 6. Daily Challenge: Trace Critical Path
  quests.push({
    id: 'quest_daily_critical_path',
    code: 'DLY #01',
    category: 'daily',
    title: 'DAILY ARCHITECT: TRACE DATA FLOW',
    title_es: 'DESAFÍO DIARIO: TRAZAR FLUJO DE DATOS',
    description: 'Trace an end-to-end execution pipeline from the Metropolis Grid (UI) to the Subterranean Bunker.',
    description_es: 'Traza un flujo completo desde la Metrópolis UI hasta el Búnker Subterráneo.',
    hint: 'Select an interface or component and follow its outgoing dependency chain.',
    hint_es: 'Selecciona una interfaz o componente y sigue su cadena de dependencias salientes.',
    targetId: entryCandidate?.id || '',
    targetNodeId: entryCandidate?.id || '',
    rewardXP: 600,
    rewardXp: 600,
    completed: false,
    difficulty: '3/5'
  });

  return quests;
}
