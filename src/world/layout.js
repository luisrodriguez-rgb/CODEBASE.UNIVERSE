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

      if (sector.id === 'core') {
        // ── CORE CITADEL: Concentric rings sorted by centrality ──────────────
        const sorted = [...nodes].sort((a, b) => {
          const sa = this.nodeStats.get(a.id);
          const sb = this.nodeStats.get(b.id);
          return ((sb?.centralityPct || 0) - (sa?.centralityPct || 0));
        });

        // Ring definitions — spacious radii so buildings on different rings never collide
        const rings = [
          { max:  1, r:  0   },   // [0]    Central spire node
          { max:  7, r:  85  },   // [1-7]  Inner ring (generous 85px radius)
          { max: 20, r: 145 },   // [8-20] Middle ring (145px radius)
          { max: Infinity, r: 205 },  // [21+] Outer ring (205px radius)
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
            node.y = sector.y + Math.sin(angle) * ring.r * 0.58; // perspective ellipse
          }
          node.anchorX = node.x;
          node.anchorY = node.y;
          node.vx = 0; node.vy = 0;
        });

        sector.radius = Math.max(wl ? wl.baseRadius : 160, count > 20 ? 230 : count > 7 ? 170 : 130);

      } else if (sector.id === 'ui') {
        // ── UI METROPOLIS: City-block grid with distinct street gaps ──────────
        const sorted = [...nodes].sort((a, b) => {
          const sa = this.nodeStats.get(a.id);
          const sb = this.nodeStats.get(b.id);
          return ((sb?.centralityPct || 0) - (sa?.centralityPct || 0));
        });

        const CELL = 64;  // pixels per grid cell (generous street gap between buildings)
        const cols = Math.max(3, Math.ceil(Math.sqrt(count * 1.3)));
        const rows = Math.ceil(count / cols);
        const gridW = cols * CELL;
        const gridH = rows * CELL;

        sorted.forEach((node, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          node.x = sector.x - gridW / 2 + col * CELL + CELL / 2;
          node.y = sector.y - gridH / 2 + row * CELL + CELL / 2;
          node.anchorX = node.x;
          node.anchorY = node.y;
          node.vx = 0; node.vy = 0;
        });

        sector.radius = Math.max(wl ? wl.baseRadius : 200, Math.sqrt(gridW * gridW + gridH * gridH) / 2 + 45);

      } else {
        // ── ALL OTHER BIOMES: Golden-Ratio phyllotaxis with generous spacing ──
        const sorted = [...nodes].sort((a, b) => {
          const sa = this.nodeStats.get(a.id);
          const sb = this.nodeStats.get(b.id);
          return ((sb?.centralityPct || 0) - (sa?.centralityPct || 0));
        });

        const PHI = 137.508 * (Math.PI / 180);
        const SPACING = sector.id === 'hazard' ? 52 : 46;

        sorted.forEach((node, index) => {
          if (index === 0) {
            node.x = sector.x;
            node.y = sector.y;
          } else {
            const theta = index * PHI;
            const r     = Math.sqrt(index) * SPACING + 24; // +24 gives clearance from center spire
            node.x = sector.x + Math.cos(theta) * r;
            node.y = sector.y + Math.sin(theta) * r * 0.72; // perspective squish
          }
          node.anchorX = node.x;
          node.anchorY = node.y;
          node.vx = 0; node.vy = 0;
        });

        const dynamicR = Math.sqrt(count) * SPACING + 50;
        sector.radius = Math.max(wl ? wl.baseRadius : 140, dynamicR);
      }
    }
  }

  step(alpha = 0.03) {
    const kAnchor = 0.22;
    const kRepel = 2800;
    const kAttractSame = 0.002;

    // 1. Anchor Restoration & Sector Gravity
    for (const node of this.nodes) {
      const biome = node.biome || 'core';
      const sector = BIOME_SECTORS[biome] || BIOME_SECTORS.core;
      
      // Pull toward designated procedural anchor
      if (node.anchorX !== undefined && node.anchorY !== undefined) {
        node.vx += (node.anchorX - node.x) * kAnchor * alpha;
        node.vy += (node.anchorY - node.y) * kAnchor * alpha;
      }

      // Hard sector boundary containment
      const dx = node.x - sector.x;
      const dy = node.y - sector.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const maxR = sector.radius - 12;
      if (dist > maxR && maxR > 0) {
        const overflow = dist - maxR;
        node.vx -= (dx / dist) * overflow * 0.25;
        node.vy -= (dy / dist) * overflow * 0.25;
      }
    }

    // 2. Intra-Sector Soft Edge Tension (Same biome only — NEVER drag across biomes)
    for (const edge of this.edges) {
      const source = this.graph.getNode(edge.source);
      const target = this.graph.getNode(edge.target);
      if (!source || !target) continue;

      if (source.biome === target.biome) {
        const targetDist = 95;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - targetDist) * kAttractSame * alpha;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        source.vx += fx;
        source.vy += fy;
        target.vx -= fx;
        target.vy -= fy;
      }
    }

    // 3. Strict Universal Anti-Collision Repulsion (Across all nodes and biomes)
    const N = this.nodes.length;
    for (let i = 0; i < N; i++) {
      const n1 = this.nodes[i];
      for (let j = i + 1; j < N; j++) {
        const n2 = this.nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const distSq = dx * dx + dy * dy + 0.1;
        const minDist = (n1.biome === n2.biome) ? 48 : 72;
        const minDistSq = minDist * minDist;

        if (distSq < minDistSq) {
          const dist = Math.sqrt(distSq);
          const overlap = minDist - dist;
          const force = (overlap / dist) * 1.8 * alpha * 10;
          const fx = dx * force;
          const fy = dy * force;

          n1.vx -= fx;
          n1.vy -= fy;
          n2.vx += fx;
          n2.vy += fy;
        }
      }
    }

    // 4. Velocity integration, damping & hard position clamping
    for (const node of this.nodes) {
      node.x += node.vx;
      node.y += node.vy;
      node.vx *= 0.75;
      node.vy *= 0.75;

      // Hard containment clamping to sector disk
      const biome = node.biome || 'core';
      const sector = BIOME_SECTORS[biome] || BIOME_SECTORS.core;
      const dx = node.x - sector.x;
      const dy = node.y - sector.y;
      const maxR = sector.radius - 10;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxR && maxR > 0) {
        node.x = sector.x + (dx / dist) * maxR;
        node.y = sector.y + (dy / dist) * maxR;
        node.vx = 0;
        node.vy = 0;
      }
    }
  }
}

