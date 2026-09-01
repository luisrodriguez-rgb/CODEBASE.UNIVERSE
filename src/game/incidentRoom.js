/**
 * Procedural Detective Incident Engine for CODEBASE.UNIVERSE.
 * Generates architectural investigation cases and debugging bounties from real repository topology.
 */

export function generateIncidentCases(graph, analysis) {
  const cases = [];
  const nodeStats = analysis.nodeStats;

  // Case 1: High Latency Cascading Failure in Core / UI
  const boss = analysis.threats[0] || Array.from(nodeStats.values())[0];
  const callers = graph.getDependents(boss.id);
  const suspectIds = [boss.id, ...callers.slice(0, 2)];

  cases.push({
    id: 'case_001',
    code: 'CASE #014',
    title: 'CASCADE LATENCY SURGE',
    title_es: 'SOBRECARGA DE LATENCIA EN CASCADA',
    description: `A sudden response spike is propagating through the Metropolis Grid. Over 30 dependent modules are throttled. Pinpoint the root bottleneck.`,
    description_es: `Un pico repentino de latencia se propaga por la Metrópolis Grid. Más de 30 módulos dependientes están saturados. Localiza el cuello de botella raíz.`,
    clues: [
      'Clue 1: The culprit controls more execution paths than 90% of the repository.',
      'Clue 2: High fan-in dependency concentration (>25 dependents).',
      'Clue 3: Structural risk rating exceeds 75%.'
    ],
    clues_es: [
      'Pista 1: El culpable controla más rutas de ejecución que el 90% del repositorio.',
      'Pista 2: Alta concentración de dependencias de entrada (>25 dependientes).',
      'Pista 3: El índice de riesgo estructural supera el 75%.'
    ],
    suspects: suspectIds.map(id => {
      const n = graph.getNode(id);
      return { id, name: n?.name || id, biome: n?.biome || 'core' };
    }),
    culpritId: boss.id,
    rewardXp: 850,
    solved: false
  });

  // Case 2: Memory Leak Wormhole (Circular Dependency)
  const cyclicNodes = Array.from(analysis.cycleData.cyclicalNodes);
  if (cyclicNodes.length > 0) {
    const cycleCulprit = cyclicNodes[0];
    const nonCyclicSuspects = Array.from(nodeStats.values()).filter(n => !n.isCyclic).slice(0, 2);
    const suspectList = [cycleCulprit, ...nonCyclicSuspects.map(s => s.id)];

    cases.push({
      id: 'case_002',
      code: 'CASE #027',
      title: 'CYCLIC MEMORY ANOMALY',
      title_es: 'ANOMALÍA DE MEMORIA CIRCULAR',
      description: `Garbage collection failure detected. Two or more modules are trapped in an infinite dependency loop. Identify the cyclical anchor.`,
      description_es: `Detectado fallo de recolección de basura. Dos o más módulos están atrapados en un bucle infinito de dependencias. Identifica el anclaje circular.`,
      clues: [
        'Clue 1: Module calls another service that indirectly imports it back.',
        'Clue 2: Marked with a flashing red anomaly indicator on the world map.',
        'Clue 3: Located in the Core Citadel or Metropolis subsystem.'
      ],
      clues_es: [
        'Pista 1: El módulo llama a otro servicio que indirectamente lo vuelve a importar.',
        'Pista 2: Marcado con un indicador de anomalía rojo en el mapa del mundo.',
        'Pista 3: Ubicado en la Ciudadela Central o subsistema Metrópolis.'
      ],
      suspects: suspectList.map(id => {
        const n = graph.getNode(id);
        return { id, name: n?.name || id, biome: n?.biome || 'core' };
      }),
      culpritId: cycleCulprit,
      rewardXp: 1200,
      solved: false
    });
  }

  // Case 3: Phantom Dead Code in Abandoned Sector
  const leafNodes = Array.from(nodeStats.values()).filter(n => n.fanIn === 0);
  if (leafNodes.length > 0) {
    const phantom = leafNodes[leafNodes.length - 1];
    cases.push({
      id: 'case_003',
      code: 'CASE #039',
      title: 'PHANTOM ORPHAN MODULE',
      title_es: 'MÓDULO HUÉRFANO FANTASMA',
      description: `Telemetry reports unreferenced source files adding dead weight to bundle size. Track down the uncalled utility.`,
      description_es: `La telemetría reporta archivos no referenciados que añaden peso muerto al bundle. Localiza la utilidad sin llamadas entrantes.`,
      clues: [
        'Clue 1: Total inbound dependents (Fan-In) equals 0.',
        'Clue 2: Low cyclomatic mass, isolated from the active execution pipeline.'
      ],
      clues_es: [
        'Pista 1: El total de dependientes entrantes (Fan-In) es exactamente 0.',
        'Pista 2: Baja masa ciclomática, aislado del flujo de ejecución activo.'
      ],
      suspects: [phantom.id, ...(leafNodes.slice(0, 2).map(l => l.id))].map(id => {
        const n = graph.getNode(id);
        return { id, name: n?.name || id, biome: n?.biome || 'core' };
      }),
      culpritId: phantom.id,
      rewardXp: 650,
      solved: false
    });
  }

  return cases;
}
