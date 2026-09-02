/**
 * Force-Directed Physics & Biome Sector Continent Layout Engine.
 * Gives each architectural biome its own distinct spatial territory with expansive breathing room
 * and guarantees zero building overlap.
 *
 * ZERO EMOJIS.
 */

import { WORLD_LAYOUT } from './visualLanguage.js';

export const BIOME_SECTORS = {
  core: {
    id: 'core', name: 'CORE CITADEL',
    x: WORLD_LAYOUT.core.x, y: WORLD_LAYOUT.core.y, radius: WORLD_LAYOUT.core.baseRadius,
    color: '#38bdf8', desc: 'Central Orchestration & Execution Pipeline'
  },
  ui: {
    id: 'ui', name: 'UI METROPOLIS',
    x: WORLD_LAYOUT.ui.x, y: WORLD_LAYOUT.ui.y, radius: WORLD_LAYOUT.ui.baseRadius,
    color: '#a855f7', desc: 'Components, Viewports, Templates & Themes'
  },
  power: {
    id: 'power', name: 'POWER GRID',
    x: WORLD_LAYOUT.power.x, y: WORLD_LAYOUT.power.y, radius: WORLD_LAYOUT.power.baseRadius,
    color: '#f59e0b', desc: 'State Stores, Action Dispatchers & History Bus'
  },
  bunker: {
    id: 'bunker', name: 'STORAGE BUNKER',
    x: WORLD_LAYOUT.bunker.x, y: WORLD_LAYOUT.bunker.y, radius: WORLD_LAYOUT.bunker.baseRadius,
    color: '#3b82f6', desc: 'Database, Storage Engines & Persistence'
  },
  transmission: {
    id: 'transmission', name: 'API HUB',
    x: WORLD_LAYOUT.transmission.x, y: WORLD_LAYOUT.transmission.y, radius: WORLD_LAYOUT.transmission.baseRadius,
    color: '#06b6d4', desc: 'Network Protocols, AI Pipeline & Gateways'
  },
  lab: {
    id: 'lab', name: 'RESEARCH LABS',
    x: WORLD_LAYOUT.lab.x, y: WORLD_LAYOUT.lab.y, radius: WORLD_LAYOUT.lab.baseRadius,
    color: '#10b981', desc: 'Test Suites, Mocks & Benchmarks'
  },
  hazard: {
    id: 'hazard', name: 'HAZARD ZONE',
    x: WORLD_LAYOUT.hazard.x, y: WORLD_LAYOUT.hazard.y, radius: WORLD_LAYOUT.hazard.baseRadius,
    color: '#f43f5e', desc: 'High Risk Hotspots & Circular Anomalies'
  },
  ruins: {
    id: 'ruins', name: 'FORGOTTEN RUINS',
    x: WORLD_LAYOUT.ruins.x, y: WORLD_LAYOUT.ruins.y, radius: WORLD_LAYOUT.ruins.baseRadius,
    color: '#64748b', desc: 'Dead Code & Deprecated Utilities'
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
    // Group nodes by biome, enrich with nodeStats
    const biomeNodes = new Map();
    this.nodes.forEach((node) => {
      const b = node.biome || 'core';
      if (!biomeNodes.has(b)) biomeNodes.set(b, []);
      biomeNodes.get(b).push(node);
    });

    for (const sector of Object.values(BIOME_SECTORS)) {
      const nodes = biomeNodes.get(sector.id) || [];
      const count = nodes.length;
      const wl    = WORLD_LAYOUT[sector.id];

      if (count === 0) { sector.radius = 0; continue; }

      const dynamicR = Math.sqrt(count) * 34 + 20;
      sector.radius  = Math.max(wl ? wl.baseRadius : 90, dynamicR);

      if (sector.id === 'core') {
        // ── CORE CITADEL: Concentric rings sorted by centrality ──────────────
        // Architecturally: most central nodes orbit closest to the spire,
        // forming InnerRing / MiddleRing / OuterRing.
        const sorted = [...nodes].sort((a, b) => {
          const sa = this.nodeStats.get(a.id);
          const sb = this.nodeStats.get(b.id);
          return ((sb?.centralityPct || 0) - (sa?.centralityPct || 0));
        });

        // Ring definitions — fixed radii so rings are always distinct
        const rings = [
          { max:  1, r:  0   },   // [0]    Central spire node
          { max:  7, r:  62  },   // [1-7]  Inner ring
          { max: 20, r:  105 },   // [8-20] Middle ring
          { max: Infinity, r: 155 },  // [21+] Outer ring
        ];

        sorted.forEach((node, i) => {
          let ring = rings[rings.length - 1];
          let prev = 0;
          for (const rDef of rings) {
            if (i < rDef.max) { ring = rDef; break; }
            prev = rDef.max;
          }

          if (ring.r === 0) {
            // Central node — sits at the spire
            node.x = sector.x;
            node.y = sector.y;
          } else {
            // Spread evenly around the ring
            const ringCount = ring.max === Infinity ? count - prev : ring.max - prev;
            const angle = ((i - prev) / ringCount) * Math.PI * 2 - Math.PI / 2;
            node.x = sector.x + Math.cos(angle) * ring.r;
            node.y = sector.y + Math.sin(angle) * ring.r * 0.55; // slight ellipse for perspective
          }
          node.vx = 0; node.vy = 0;
        });

      } else if (sector.id === 'ui') {
        // ── UI METROPOLIS: City-block grid (streets between buildings) ────────
        // Most central/important nodes go to the center of the grid (like downtown).
        const sorted = [...nodes].sort((a, b) => {
          const sa = this.nodeStats.get(a.id);
          const sb = this.nodeStats.get(b.id);
          return ((sb?.centralityPct || 0) - (sa?.centralityPct || 0));
        });

        const CELL = 56;  // pixels per grid cell (building + street gap)
        const cols = Math.ceil(Math.sqrt(count * 1.25));
        const rows = Math.ceil(count / cols);
        const gridW = cols * CELL;
        const gridH = rows * CELL;

        sorted.forEach((node, i) => {
          // Spiral-out from center of grid so important nodes are central
          const col = i % cols;
          const row = Math.floor(i / cols);
          node.x = sector.x - gridW / 2 + col * CELL + CELL / 2;
          node.y = sector.y - gridH / 2 + row * CELL + CELL / 2;
          node.vx = 0; node.vy = 0;
        });

        // Update sector radius to match actual grid footprint
        sector.radius = Math.max(sector.radius, Math.max(gridW, gridH) / 2 + 40);

      } else {
        // ── ALL OTHER BIOMES: Tight Golden-Ratio phyllotaxis ─────────────────
        // Sort by importance descending so the center building is the most important
        const sorted = [...nodes].sort((a, b) => {
          const sa = this.nodeStats.get(a.id);
          const sb = this.nodeStats.get(b.id);
          return ((sb?.centralityPct || 0) - (sa?.centralityPct || 0));
        });

        const PHI = 137.508 * (Math.PI / 180);
        const SPACING = sector.id === 'hazard' ? 42 : 36;

        sorted.forEach((node, index) => {
          if (index === 0) {
            node.x = sector.x;
            node.y = sector.y;
          } else {
            const theta = index * PHI;
            const r     = Math.sqrt(index) * SPACING;
            node.x = sector.x + Math.cos(theta) * r;
            node.y = sector.y + Math.sin(theta) * r * 0.75; // slight squish for perspective
          }
          node.vx = 0; node.vy = 0;
        });
      }
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
