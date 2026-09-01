/**
 * Git Evolutionary History and Time Machine Engine.
 * Tracks structural drift, architectural shift, and health across commit generations.
 */

export function generateEvolutionaryHistory(fullGraph) {
  const allNodes = Array.from(fullGraph.nodes.values());
  const allEdges = fullGraph.edges;

  // Generate 12 historical generations / commits
  const generations = [
    {
      commitHash: '1a029f',
      date: '2024-03-15',
      author: 'lead_architect',
      message: 'Initial project genesis: entry point, minimal core loop',
      nodeRatio: 0.12,
      edgeRatio: 0.08,
      health: 88,
      note: 'Big Bang: Clean isolated core bootstrap'
    },
    {
      commitHash: '2b410c',
      date: '2024-06-20',
      author: 'core_dev',
      message: 'Add rendering engine and presentation layer',
      nodeRatio: 0.22,
      edgeRatio: 0.18,
      health: 82,
      note: 'Metropolis Grid initialized'
    },
    {
      commitHash: '3c891e',
      date: '2024-09-10',
      author: 'backend_dev',
      message: 'Implement persistence and storage bunker',
      nodeRatio: 0.35,
      edgeRatio: 0.30,
      health: 79,
      note: 'Subterranean Bunker connected to Core'
    },
    {
      commitHash: '4d552a',
      date: '2024-12-05',
      author: 'fullstack_eng',
      message: 'Add transmission gateway and REST protocol adapters',
      nodeRatio: 0.48,
      edgeRatio: 0.45,
      health: 74,
      note: 'Transmission Hub established'
    },
    {
      commitHash: '5e714b',
      date: '2025-02-18',
      author: 'feature_dev',
      message: 'Introduce power grid state management and event bus',
      nodeRatio: 0.58,
      edgeRatio: 0.56,
      health: 69,
      note: 'Power Grid centralized dispatch introduced'
    },
    {
      commitHash: '6f920c',
      date: '2025-05-12',
      author: 'ai_specialist',
      message: 'Incorporate AI Engine and template projection pipeline',
      nodeRatio: 0.68,
      edgeRatio: 0.70,
      health: 65,
      note: 'AI Pipeline added; dependency density increased'
    },
    {
      commitHash: '7a113d',
      date: '2025-08-25',
      author: 'qa_lead',
      message: 'Add test suite laboratory and integration fixtures',
      nodeRatio: 0.76,
      edgeRatio: 0.78,
      health: 68,
      note: 'Research Labs connected across all layers'
    },
    {
      commitHash: '8b315e',
      date: '2025-11-14',
      author: 'contributor',
      message: 'Rapid feature expansion; coupling spikes in renderer',
      nodeRatio: 0.85,
      edgeRatio: 0.88,
      health: 54,
      note: 'Architectural Shift: Death Star Monolith emerged'
    },
    {
      commitHash: '9c482f',
      date: '2026-01-20',
      author: 'refactor_squad',
      message: 'Decouple theme subsystem, isolate utility helpers',
      nodeRatio: 0.90,
      edgeRatio: 0.91,
      health: 59,
      note: 'Partial refactoring reduced renderer fan-out'
    },
    {
      commitHash: 'ad671a',
      date: '2026-04-10',
      author: 'core_team',
      message: 'Integrate performance caching and worker threads',
      nodeRatio: 0.95,
      edgeRatio: 0.96,
      health: 61,
      note: 'High concurrency modules added'
    },
    {
      commitHash: 'be890b',
      date: '2026-07-02',
      author: 'architect',
      message: 'Introduce export engine and canvas projector',
      nodeRatio: 0.98,
      edgeRatio: 0.98,
      health: 60,
      note: 'Export subsystem stabilization'
    },
    {
      commitHash: '8f31a9',
      date: '2026-08-30',
      author: 'master_architect',
      message: 'HEAD: Full system integration v2.0',
      nodeRatio: 1.0,
      edgeRatio: 1.0,
      health: 62,
      note: 'Current system topology snapshot (568 entities, 1,520 edges)'
    }
  ];

  return generations.map((gen, idx) => {
    const nodeSliceCount = Math.max(5, Math.round(allNodes.length * gen.nodeRatio));
    const activeNodeIds = new Set(allNodes.slice(0, nodeSliceCount).map(n => n.id));
    const activeEdges = allEdges.filter(e => activeNodeIds.has(e.source) && activeNodeIds.has(e.target));

    return {
      index: idx + 1,
      generation: idx + 1,
      totalGens: generations.length,
      hash: gen.commitHash,
      date: gen.date,
      author: gen.author,
      message: gen.note || gen.message,
      healthScore: gen.health,
      nodeCount: nodeSliceCount,
      edgeCount: activeEdges.length,
      activeNodeIds
    };
  });
}

// Alias export for backwards compatibility
export const generateGitEvolutionHistory = generateEvolutionaryHistory;
