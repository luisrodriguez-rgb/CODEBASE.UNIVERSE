/**
 * Force-Directed Physics & Biome Sector Continent Layout Engine.
 * Gives each architectural biome its own distinct spatial territory with strong containment
 * and prevents messy central clustering.
 */

export const BIOME_SECTORS = {
  core: {
    id: 'core',
    name: 'CORE CITADEL',
    x: 0,
    y: 0,
    radius: 200,
    color: '#38bdf8',
    desc: 'Central Orchestration & Execution Pipeline'
  },
  ui: {
    id: 'ui',
    name: 'METROPOLIS GRID (UI)',
    x: 650,
    y: -380,
    radius: 260,
    color: '#a855f7',
    desc: 'Components, Viewports, Templates & Themes'
  },
  power: {
    id: 'power',
    name: 'POWER GRID (STATE)',
    x: -650,
    y: -340,
    radius: 230,
    color: '#f59e0b',
    desc: 'State Stores, Action Dispatchers & History Bus'
  },
  bunker: {
    id: 'bunker',
    name: 'SUBTERRANEAN BUNKER',
    x: -600,
    y: 460,
    radius: 240,
    color: '#3b82f6',
    desc: 'Database, Storage Engines & Persistence'
  },
  network: {
    id: 'network',
    name: 'TRANSMISSION HUB (API)',
    x: 620,
    y: 440,
    radius: 240,
    color: '#06b6d4',
    desc: 'Network Protocols, AI Pipeline & Gateways'
  },
  lab: {
    id: 'lab',
    name: 'RESEARCH LABS',
    x: 0,
    y: 680,
    radius: 210,
    color: '#10b981',
    desc: 'Test Suites, Mocks & Benchmarks'
  },
  hazard: {
    id: 'hazard',
    name: 'HAZARD SECTOR',
    x: -220,
    y: -680,
    radius: 190,
    color: '#f43f5e',
    desc: 'High Risk Hotspots & Circular Anomalies'
  },
  ruins: {
    id: 'ruins',
    name: 'FORGOTTEN RUINS',
    x: 320,
    y: -680,
    radius: 180,
    color: '#64748b',
    desc: 'Dead Code & Deprecated Utilities'
  }
};

export class WorldLayout {
  constructor(graph, nodeStats) {
    this.graph = graph;
    this.nodeStats = nodeStats;
    this.nodes = Array.from(graph.nodes.values());
    this.edges = graph.edges;
    this.initPositions();
  }

  initPositions() {
    // Distribute nodes evenly in golden ratio spirals inside their designated biome island
    const biomeCounts = {};

    this.nodes.forEach((node) => {
      const biome = node.biome || 'core';
      const sector = BIOME_SECTORS[biome] || BIOME_SECTORS.core;
      
      biomeCounts[biome] = (biomeCounts[biome] || 0) + 1;
      const index = biomeCounts[biome];

      // Golden ratio phyllotaxis inside sector circle
      const phi = 137.508 * (Math.PI / 180);
      const theta = index * phi;
      const maxR = sector.radius * 0.85;
      const r = Math.sqrt(index / 100) * maxR;

      node.x = sector.x + Math.cos(theta) * Math.min(r, maxR);
      node.y = sector.y + Math.sin(theta) * Math.min(r, maxR);
      node.vx = 0;
      node.vy = 0;
    });
  }

  step(alpha = 0.04) {
    const kRepel = 1800;
    const kAttractSame = 0.015;
    const kAttractDiff = 0.002; // Very weak inter-biome pull so biomes don't collapse into center!
    const kSectorAnchor = 0.12;  // Strong containment inside own sector territory

    // 1. Strong Centroid Gravity to Sector Territory
    for (const node of this.nodes) {
      const biome = node.biome || 'core';
      const sector = BIOME_SECTORS[biome] || BIOME_SECTORS.core;
      
      const dx = sector.x - node.x;
      const dy = sector.y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Pull toward sector center
      node.vx += dx * kSectorAnchor * alpha;
      node.vy += dy * kSectorAnchor * alpha;

      // Hard sector boundary containment
      if (dist > sector.radius) {
        const overflow = dist - sector.radius;
        node.vx += (dx / dist) * overflow * 0.3;
        node.vy += (dy / dist) * overflow * 0.3;
      }
    }

    // 2. Intra-Sector & Inter-Sector Edge Tension
    for (const edge of this.edges) {
      const source = this.graph.getNode(edge.source);
      const target = this.graph.getNode(edge.target);
      if (!source || !target) continue;

      const isSameBiome = source.biome === target.biome;
      const kAttract = isSameBiome ? kAttractSame : kAttractDiff;
      const targetDist = isSameBiome ? 45 : 280;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - targetDist) * kAttract * alpha;

      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      source.vx += fx;
      source.vy += fy;
      target.vx -= fx;
      target.vy -= fy;
    }

    // 3. Node-to-Node Repulsion (Local spatial collision avoidance)
    const N = this.nodes.length;
    for (let i = 0; i < N; i++) {
      const n1 = this.nodes[i];
      for (let j = i + 1; j < N; j++) {
        const n2 = this.nodes[j];
        if (n1.biome !== n2.biome) continue; // Only repulse within same biome

        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const distSq = dx * dx + dy * dy + 36;
        if (distSq < 1600) { // Local 40px radius
          const dist = Math.sqrt(distSq);
          const force = (kRepel / distSq) * alpha;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          n1.vx -= fx;
          n1.vy -= fy;
          n2.vx += fx;
          n2.vy += fy;
        }
      }
    }

    // 4. Velocity integration & high damping for stability
    const damping = 0.82;
    for (const node of this.nodes) {
      node.x += node.vx;
      node.y += node.vy;
      node.vx *= damping;
      node.vy *= damping;
    }
  }
}
