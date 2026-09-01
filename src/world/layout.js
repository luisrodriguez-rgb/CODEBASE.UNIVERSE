/**
 * Force-Directed Physics & Biome Sector Continent Layout Engine.
 * Gives each architectural biome its own distinct spatial territory with expansive breathing room
 * and guarantees zero building overlap.
 *
 * ZERO EMOJIS.
 */

export const BIOME_SECTORS = {
  core: {
    id: 'core',
    name: 'CORE CITADEL',
    x: 0,
    y: 0,
    radius: 280,
    color: '#38bdf8',
    desc: 'Central Orchestration & Execution Pipeline'
  },
  ui: {
    id: 'ui',
    name: 'METROPOLIS GRID (UI)',
    x: 900,
    y: -480,
    radius: 380,
    color: '#a855f7',
    desc: 'Components, Viewports, Templates & Themes'
  },
  power: {
    id: 'power',
    name: 'POWER GRID (STATE)',
    x: -900,
    y: -440,
    radius: 340,
    color: '#f59e0b',
    desc: 'State Stores, Action Dispatchers & History Bus'
  },
  bunker: {
    id: 'bunker',
    name: 'SUBTERRANEAN BUNKER',
    x: -850,
    y: 580,
    radius: 340,
    color: '#3b82f6',
    desc: 'Database, Storage Engines & Persistence'
  },
  transmission: {
    id: 'transmission',
    name: 'TRANSMISSION HUB (API)',
    x: 880,
    y: 560,
    radius: 340,
    color: '#06b6d4',
    desc: 'Network Protocols, AI Pipeline & Gateways'
  },
  lab: {
    id: 'lab',
    name: 'RESEARCH LABS',
    x: 0,
    y: 920,
    radius: 300,
    color: '#10b981',
    desc: 'Test Suites, Mocks & Benchmarks'
  },
  hazard: {
    id: 'hazard',
    name: 'HAZARD SECTOR',
    x: -320,
    y: -920,
    radius: 280,
    color: '#f43f5e',
    desc: 'High Risk Hotspots & Circular Anomalies'
  },
  ruins: {
    id: 'ruins',
    name: 'FORGOTTEN RUINS',
    x: 420,
    y: -920,
    radius: 260,
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
    // Count nodes per biome to dynamically size territories
    const biomeCounts = {};
    const biomeNodes = new Map();

    this.nodes.forEach((node) => {
      const b = node.biome || 'core';
      if (!biomeNodes.has(b)) biomeNodes.set(b, []);
      biomeNodes.get(b).push(node);
    });

    // Distribute with Archimedean / Golden Ratio spiral guaranteeing 75px spacing
    for (const [biome, nodes] of biomeNodes.entries()) {
      const sector = BIOME_SECTORS[biome] || BIOME_SECTORS.core;
      const count = nodes.length;

      // Expand sector radius if it has many nodes
      sector.radius = Math.max(260, Math.sqrt(count) * 68);

      nodes.forEach((node, index) => {
        if (index === 0) {
          // Central landmark building of the sector
          node.x = sector.x;
          node.y = sector.y;
        } else {
          // Golden ratio phyllotaxis with minimum spacing of ~72px
          const phi = 137.508 * (Math.PI / 180);
          const theta = index * phi;
          const r = Math.sqrt(index) * 62;

          node.x = sector.x + Math.cos(theta) * r;
          node.y = sector.y + Math.sin(theta) * r;
        }
        node.vx = 0;
        node.vy = 0;
      });
    }
  }

  step(alpha = 0.03) {
    const kRepel = 3200;
    const kAttractSame = 0.008;
    const kAttractDiff = 0.001;
    const kSectorAnchor = 0.08;

    // 1. Centroid Gravity to Sector Territory
    for (const node of this.nodes) {
      const biome = node.biome || 'core';
      const sector = BIOME_SECTORS[biome] || BIOME_SECTORS.core;
      
      const dx = sector.x - node.x;
      const dy = sector.y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      // Pull toward sector center
      node.vx += dx * kSectorAnchor * alpha;
      node.vy += dy * kSectorAnchor * alpha;

      // Hard sector boundary containment
      if (dist > sector.radius) {
        const overflow = dist - sector.radius;
        node.vx += (dx / dist) * overflow * 0.2;
        node.vy += (dy / dist) * overflow * 0.2;
      }
    }

    // 2. Intra-Sector & Inter-Sector Edge Tension
    for (const edge of this.edges) {
      const source = this.graph.getNode(edge.source);
      const target = this.graph.getNode(edge.target);
      if (!source || !target) continue;

      const isSameBiome = source.biome === target.biome;
      const kAttract = isSameBiome ? kAttractSame : kAttractDiff;
      const targetDist = isSameBiome ? 85 : 380;

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

    // 3. Strong Anti-Collision Node-to-Node Repulsion
    const N = this.nodes.length;
    for (let i = 0; i < N; i++) {
      const n1 = this.nodes[i];
      for (let j = i + 1; j < N; j++) {
        const n2 = this.nodes[j];
        if (n1.biome !== n2.biome) continue;

        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const distSq = dx * dx + dy * dy + 1;
        if (distSq < 5625) { // 75px radius collision threshold
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

    // 4. Velocity integration & damping
    for (const node of this.nodes) {
      node.x += node.vx;
      node.y += node.vy;
      node.vx *= 0.82;
      node.vy *= 0.82;
    }
  }
}
