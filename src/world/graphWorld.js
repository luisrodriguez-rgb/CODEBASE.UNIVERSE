/**
 * High-Performance Visual Graph World Renderer for CODEBASE.UNIVERSE.
 * - Screen-space anti-collision label rendering (FIXES GIANT TEXT BUG)
 * - Hierarchical Edge Bundling (FIXES LASER FLOODLIGHT BUG)
 * - Procedural metric-driven 2.5D building silhouettes
 * - 4-Tier Semantic Zoom into code
 * - ZERO EMOJIS.
 */

import { WorldCamera } from './camera.js';
import { WorldLayout, BIOME_SECTORS } from './layout.js';
import { WorldEffects } from './effects.js';
import { ProceduralBuildingRenderer } from './proceduralBuildings.js';
import { PathFollower } from './pathFollower.js';
import { BIOME_CONFIG, RARITY_CONFIG } from '../analysis/types.js';
import { i18n } from '../i18n/translations.js';
import { BIOME_VISUAL } from './visualLanguage.js';

export class GraphWorld {
  constructor(canvas, minimapCanvas, graph, analysis, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.minimapCanvas = minimapCanvas;
    this.miniCtx = minimapCanvas.getContext('2d');
    
    this.graph = graph;
    this.analysis = analysis;
    this.state = state;

    this.camera = new WorldCamera(canvas);
    this.layout = new WorldLayout(graph, analysis.nodeStats);
    this.effects = new WorldEffects();
    this.buildings = new ProceduralBuildingRenderer();
    this.pathFollower = new PathFollower(graph, this.camera, state);

    this.hoveredNodeId = null;
    this.mouseScreenX = 0;
    this.mouseScreenY = 0;
    this.animFrameId = null;
    this.time = 0;

    this.activeMode = 'world'; // 'world', 'threats', 'quests', 'simulation'

    // Star field seeds (deterministic procedural, stable across frames)
    this._starsFar  = this._buildStarField(220, 2687);
    this._starsNear = this._buildStarField(80, 5231);

    this.initCanvasSize();
    this.initInteractions();
  }

  initCanvasSize() {
    const resize = () => {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      this.displayWidth = rect.width;
      this.displayHeight = rect.height;
    };
    window.addEventListener('resize', resize);
    resize();
  }

  initInteractions() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseScreenX = e.clientX - rect.left;
      this.mouseScreenY = e.clientY - rect.top;

      if (this.camera.isDragging) return;

      const worldPos = this.camera.screenToWorld(this.mouseScreenX, this.mouseScreenY);
      const hitNode = this.hitTest(worldPos.x, worldPos.y);
      this.hoveredNodeId = hitNode ? hitNode.id : null;
      this.canvas.style.cursor = hitNode ? 'pointer' : 'crosshair';
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const worldPos = this.camera.screenToWorld(clickX, clickY);
      const hitNode = this.hitTest(worldPos.x, worldPos.y);
      if (hitNode) {
        this.state.setSelectedNode(hitNode.id);
      }
    });

    this.canvas.addEventListener('dblclick', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const worldPos = this.camera.screenToWorld(clickX, clickY);
      const hitNode = this.hitTest(worldPos.x, worldPos.y);
      if (hitNode) {
        this.state.setSelectedNode(hitNode.id);
        this.camera.centerOn(hitNode.x, hitNode.y, 3.8);
      } else {
        this.camera.centerOn(worldPos.x, worldPos.y, this.camera.zoom * 2.0);
      }
    });
  }

  hitTest(x, y) {
    let closestNode = null;
    let closestDistSq = Infinity;

    for (const node of this.graph.nodes.values()) {
      const radius = 22;
      const dx = node.x - x;
      const dy = node.y - y;
      const distSq = dx * dx + dy * dy;

      if (distSq <= radius * radius) {
        if (distSq < closestDistSq) {
          closestDistSq = distSq;
          closestNode = node;
        }
      }
    }
    return closestNode;
  }

  start() {
    let lastTime = performance.now();
    let pulseTimer = 0;

    const loop = (currentTime) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      this.time += dt;

      this.layout.step(0.04);
      this.camera.update();
      this.effects.update();
      this.buildings.update(dt);
      this.pathFollower.update(dt);

      // Energy pulse emissions
      pulseTimer += dt;
      if (pulseTimer > 0.35 && this.graph.edges.length > 0) {
        pulseTimer = 0;
        const randomEdge = this.graph.edges[Math.floor(Math.random() * this.graph.edges.length)];
        const src = this.graph.getNode(randomEdge.source);
        const tgt = this.graph.getNode(randomEdge.target);
        if (src && tgt) {
          const color = BIOME_CONFIG[src.biome]?.color || '#38bdf8';
          this.effects.triggerEnergyPulse(src.x, src.y, tgt.x, tgt.y, color);
        }
      }

      this.render();
      this.renderMinimap();

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  render() {
    const { ctx, camera, graph, analysis, state, effects } = this;
    const width = this.displayWidth || this.canvas.width;
    const height = this.displayHeight || this.canvas.height;

    // 1. Deep Space Holographic Grid Background
    this.renderSpaceBackground(ctx, width, height, camera);

    ctx.save();
    ctx.translate(width / 2 + camera.x * camera.zoom, height / 2 + camera.y * camera.zoom);
    ctx.scale(camera.zoom, camera.zoom);

    // 2. Biome Sector Platforms & Concentric Range Circles
    this.renderBiomeTerritories(ctx);

    // 3. Hierarchical Bundled Energy Conduits
    this.renderEnergyConduits(ctx, graph, analysis, state, effects);

    // 4. Procedural Metric-Driven Architectural Buildings
    this.renderProceduralArchitectures(ctx, graph, analysis, state, effects, camera);

    // 5. Active FX (Shockwaves, Pulses)
    effects.render(ctx);

    ctx.restore();

    // 6. Screen-Space Anti-Collision Label Badges (FIXES GIANT TEXT BUG)
    this.renderScreenSpaceLabels(ctx, width, height);

    // 7. Tactical Hover Tooltip
    this.renderScreenSpaceHUD(ctx, width, height);
  }

  // ─── Star field seed builder ──────────────────────────────────────────────
  _buildStarField(count, seed) {
    const stars = [];
    let s = seed;
    const rng = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
    for (let i = 0; i < count; i++) {
      stars.push({
        nx: rng(),         // normalised [0,1] screen position
        ny: rng(),
        r:  0.5 + rng() * 1.2,
        a:  0.3 + rng() * 0.6,
        tw: rng() * Math.PI * 2,  // twinkle phase
        ts: 0.6 + rng() * 1.6,   // twinkle speed
      });
    }
    return stars;
  }

  renderSpaceBackground(ctx, width, height, camera) {
    // 1. Deep-space gradient base
    const bg = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, Math.max(width, height) * 0.75);
    bg.addColorStop(0,   '#060c1e');
    bg.addColorStop(0.5, '#040a18');
    bg.addColorStop(1,   '#020609');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // 2. Nebula cloud (two offset radial gradients, very subtle)
    const nbX = width * 0.35 + camera.x * 0.02;
    const nbY = height * 0.42 + camera.y * 0.02;
    const neb = ctx.createRadialGradient(nbX, nbY, 0, nbX, nbY, width * 0.55);
    neb.addColorStop(0,   'rgba(56,28,120,0.10)');
    neb.addColorStop(0.4, 'rgba(14,50,100,0.08)');
    neb.addColorStop(1,   'transparent');
    ctx.fillStyle = neb;
    ctx.fillRect(0, 0, width, height);

    const nb2X = width * 0.68 + camera.x * 0.03;
    const nb2Y = height * 0.60 + camera.y * 0.03;
    const neb2 = ctx.createRadialGradient(nb2X, nb2Y, 0, nb2X, nb2Y, width * 0.40);
    neb2.addColorStop(0,   'rgba(5,80,90,0.07)');
    neb2.addColorStop(1,   'transparent');
    ctx.fillStyle = neb2;
    ctx.fillRect(0, 0, width, height);

    // 3. Far star field — slow parallax 0.04x
    for (const st of this._starsFar) {
      const px = (st.nx * width  + camera.x * 0.04) % width;
      const py = (st.ny * height + camera.y * 0.04) % height;
      const twinkle = 0.7 + 0.3 * Math.sin(this.time * st.ts + st.tw);
      ctx.fillStyle = `rgba(180,210,255,${st.a * twinkle})`;
      ctx.beginPath();
      ctx.arc(px < 0 ? px + width : px, py < 0 ? py + height : py, st.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Near star field — medium parallax 0.10x
    for (const st of this._starsNear) {
      const px = (st.nx * width  + camera.x * 0.10) % width;
      const py = (st.ny * height + camera.y * 0.10) % height;
      const twinkle = 0.6 + 0.4 * Math.sin(this.time * st.ts * 1.4 + st.tw);
      ctx.fillStyle = `rgba(220,235,255,${st.a * twinkle})`;
      ctx.beginPath();
      ctx.arc(px < 0 ? px + width : px, py < 0 ? py + height : py, st.r * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Holographic grid — world-space (parallax 1.0x), very subtle at edges
    ctx.save();
    const gridSize = 68 * camera.zoom;
    const offsetX = (width / 2 + camera.x * camera.zoom) % gridSize;
    const offsetY = (height / 2 + camera.y * camera.zoom) % gridSize;
    const cx = width / 2, cy = height / 2;

    ctx.strokeStyle = 'rgba(30,50,80,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = offsetX; x < width; x += gridSize) {
      const d = Math.abs(x - cx) / (width * 0.5);
      ctx.globalAlpha = Math.max(0, 0.20 - d * 0.18);
      ctx.moveTo(x, 0); ctx.lineTo(x, height);
    }
    for (let y = offsetY; y < height; y += gridSize) {
      const d = Math.abs(y - cy) / (height * 0.5);
      ctx.globalAlpha = Math.max(0, 0.20 - d * 0.18);
      ctx.moveTo(0, y); ctx.lineTo(width, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  renderBiomeTerritories(ctx) {
    ctx.save();

    // ─── CORE CITADEL — Hero Monument (Sprint 1) ───────────────────────────
    const t = this.time;
    const pulse  = Math.sin(t * 2.2);
    const pulse2 = Math.sin(t * 1.6 + 1.2);

    // Layer 1: Deep radial glow — fills the core territory
    const outerGlow = ctx.createRadialGradient(0, 0, 20, 0, 0, 260);
    outerGlow.addColorStop(0,   'rgba(251,191,36,0.28)');
    outerGlow.addColorStop(0.3, 'rgba(56,189,248,0.14)');
    outerGlow.addColorStop(0.7, 'rgba(56,189,248,0.04)');
    outerGlow.addColorStop(1,   'transparent');
    ctx.fillStyle = outerGlow;
    ctx.beginPath(); ctx.arc(0, 0, 260, 0, Math.PI * 2); ctx.fill();

    // Layer 2: Ground platform — octagonal illuminated pad
    ctx.save();
    ctx.fillStyle   = 'rgba(14,22,50,0.88)';
    ctx.strokeStyle = 'rgba(251,191,36,0.50)';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 8;
      const r = 52 + pulse * 1.5;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else         ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();

    // Layer 3: Three rotating energy rings
    const ringData = [
      { r: 68,  speed: 0.30, dash: [5,9],  color: 'rgba(251,191,36,0.35)' },
      { r: 88,  speed: -0.20, dash: [8,12], color: 'rgba(56,189,248,0.25)' },
      { r: 112, speed: 0.12, dash: [3,14], color: 'rgba(168,85,247,0.18)' },
    ];
    for (const ring of ringData) {
      ctx.save();
      ctx.rotate(t * ring.speed);
      ctx.strokeStyle = ring.color;
      ctx.lineWidth   = 1;
      ctx.setLineDash(ring.dash);
      ctx.beginPath();
      ctx.ellipse(0, 0, ring.r, ring.r * 0.52, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Layer 4: Four orbiting satellite structures at r=130
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + t * 0.14;
      const sx = Math.cos(angle) * 130;
      const sy = Math.sin(angle) * 130 * 0.52;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.fillStyle   = 'rgba(56,189,248,0.80)';
      ctx.strokeStyle = 'rgba(56,189,248,0.40)';
      ctx.lineWidth   = 0.8;
      // Diamond satellite
      ctx.beginPath();
      ctx.moveTo(0, -5); ctx.lineTo(4, 0); ctx.lineTo(0, 5); ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Connector line to center
      ctx.strokeStyle = 'rgba(56,189,248,0.15)';
      ctx.lineWidth   = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(-sx, -sy);
      ctx.stroke();
      ctx.restore();
    }

    // Layer 5: Central Tower — stepped golden spire
    // Base tier
    ctx.save();
    ctx.fillStyle   = 'rgba(251,191,36,0.20)';
    ctx.strokeStyle = 'rgba(251,191,36,0.80)';
    ctx.lineWidth   = 1.2;
    // Left face
    ctx.beginPath();
    ctx.moveTo(-18, 0); ctx.lineTo(0, 8); ctx.lineTo(0, -22); ctx.lineTo(-18, -22);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // Right face
    ctx.fillStyle = 'rgba(251,191,36,0.12)';
    ctx.beginPath();
    ctx.moveTo(0, 8); ctx.lineTo(18, 0); ctx.lineTo(18, -22); ctx.lineTo(0, -22);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // Mid tier
    ctx.fillStyle   = 'rgba(56,189,248,0.22)';
    ctx.strokeStyle = 'rgba(56,189,248,0.70)';
    ctx.beginPath();
    ctx.moveTo(-11, -22); ctx.lineTo(0, -17); ctx.lineTo(0, -52); ctx.lineTo(-11, -52);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(56,189,248,0.12)';
    ctx.beginPath();
    ctx.moveTo(0, -17); ctx.lineTo(11, -22); ctx.lineTo(11, -52); ctx.lineTo(0, -52);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // Spire
    ctx.strokeStyle = 'rgba(255,255,255,0.90)';
    ctx.lineWidth   = 2;
    ctx.beginPath(); ctx.moveTo(0, -52); ctx.lineTo(0, -90); ctx.stroke();
    // Vertical light beam
    const beam = ctx.createLinearGradient(0, -90, 0, -260);
    beam.addColorStop(0,   'rgba(251,191,36,0.55)');
    beam.addColorStop(0.5, 'rgba(56,189,248,0.15)');
    beam.addColorStop(1,   'transparent');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(-3, -90); ctx.lineTo(3, -90);
    ctx.lineTo(10, -260); ctx.lineTo(-10, -260);
    ctx.closePath(); ctx.fill();
    // Pulsing tip beacon
    const bPulse = 1 + Math.sin(t * 5.0) * 0.4;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0, -90, 3.5 * bPulse, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Layer 6: Radial starburst lines from origin
    ctx.save();
    ctx.strokeStyle = 'rgba(251,191,36,0.12)';
    ctx.lineWidth   = 1;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + t * 0.04;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 55, Math.sin(a) * 55);
      ctx.lineTo(Math.cos(a) * 200, Math.sin(a) * 200);
      ctx.stroke();
    }
    ctx.restore();



    // Pre-calculate node counts per biome
    const biomeNodeCounts = new Map();
    if (this.graph && this.graph.nodes) {
      for (const node of this.graph.nodes.values()) {
        const b = node.biome || 'core';
        biomeNodeCounts.set(b, (biomeNodeCounts.get(b) || 0) + 1);
      }
    }

    // Radial Constellation Highway Lines to each ACTIVE Biome
    for (const sector of Object.values(BIOME_SECTORS)) {
      const nodeCount = biomeNodeCounts.get(sector.id) || 0;
      
      // If the sector has NO nodes, skip rendering completely (Zero ghost empty circles!)
      if (nodeCount === 0) {
        continue;
      }

      const conf = BIOME_CONFIG[sector.id] || BIOME_CONFIG.core;
      const sectorRadius = sector.radius;

      
      // Radial highway conduit
      if (sector.id !== 'core') {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.18)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(sector.x, sector.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Moving solar packet
        const t = (this.time * 0.4 + (sector.x * 0.001)) % 1;
        const px = sector.x * t;
        const py = sector.y * t;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Soft Nebula Territory Glow
      const glow = ctx.createRadialGradient(sector.x, sector.y, 10, sector.x, sector.y, sectorRadius + 50);
      glow.addColorStop(0, `${conf.color}25`);
      glow.addColorStop(0.6, `${conf.color}08`);
      glow.addColorStop(1, 'transparent');

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sector.x, sector.y, sectorRadius + 50, 0, Math.PI * 2);
      ctx.fill();

      // Outer Range Ring
      ctx.strokeStyle = `${conf.color}45`;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.arc(sector.x, sector.y, sectorRadius + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Calculate sector metrics: connections and avg risk
      let sectorEdges = 0;
      let sectorRiskSum = 0;
      if (this.graph && this.analysis) {
        for (const node of this.graph.nodes.values()) {
          if ((node.biome || 'core') === sector.id) {
            sectorEdges += (this.graph.getDependencies(node.id).length + this.graph.getDependents(node.id).length);
            const st = this.analysis.nodeStats.get(node.id);
            if (st) sectorRiskSum += st.riskScore;
          }
        }
      }
      const avgSectorRisk = nodeCount > 0 ? Math.round(sectorRiskSum / nodeCount) : 0;

      // Tactical Holographic Multi-Line Biome Card (Matching Concept Art)
      const rawName = i18n.t(`biome_${sector.id}`) || sector.name;
      const subtitle = i18n.t(`biome_${sector.id}_desc`) || sector.desc;
      const isEs = i18n.currentLang === 'es';
      
      const metricsText = sector.id === 'hazard' 
        ? `${isEs ? 'Riesgo Crítico' : 'High Risk'}: ${avgSectorRisk}%`
        : `${nodeCount} ${isEs ? 'entidades' : 'entities'} · ${sectorEdges} ${isEs ? 'conexiones' : 'links'}`;

      ctx.save();
      ctx.translate(sector.x, sector.y - sectorRadius - 28);

      // Invariant scale compensation so cards NEVER shrink into unreadable micro-dots when zoomed out!
      const zoomCompensation = Math.min(2.2, Math.max(1.0, 0.75 / this.camera.zoom));
      ctx.scale(zoomCompensation, zoomCompensation);

      // Measure exact text widths to dynamically size the card (No text cutoff or overflow!)
      ctx.font = '800 11px JetBrains Mono';
      const titleW = ctx.measureText(`[ ${rawName.toUpperCase()} ]`).width;
      ctx.font = '500 9.5px Inter, sans-serif';
      const subW = ctx.measureText(subtitle).width;
      ctx.font = '700 9.5px JetBrains Mono';
      const metW = ctx.measureText(metricsText).width;

      const cardW = Math.max(240, Math.max(titleW, Math.max(subW, metW)) + 38);
      const cardH = 58;
      const x0 = -cardW / 2;
      const y0 = -cardH / 2;

      // Outer Glow & Shadow
      ctx.shadowColor = conf.color;
      ctx.shadowBlur = 16;

      // Card Background Glass with Cyber Chamfered Corners
      const grad = ctx.createLinearGradient(x0, y0, x0 + cardW, y0 + cardH);
      grad.addColorStop(0, 'rgba(6, 11, 22, 0.96)');
      grad.addColorStop(1, 'rgba(12, 20, 36, 0.96)');
      ctx.fillStyle = grad;
      ctx.strokeStyle = `${conf.color}bb`;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      const ch = 9; // Chamfer cut
      ctx.moveTo(x0 + ch, y0);
      ctx.lineTo(x0 + cardW - ch, y0);
      ctx.lineTo(x0 + cardW, y0 + ch);
      ctx.lineTo(x0 + cardW, y0 + cardH - ch);
      ctx.lineTo(x0 + cardW - ch, y0 + cardH);
      ctx.lineTo(x0 + ch, y0 + cardH);
      ctx.lineTo(x0, y0 + cardH - ch);
      ctx.lineTo(x0, y0 + ch);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cyber Corner Brackets (HUD Reticle styling)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      const bLen = 5;
      // Top-Left bracket
      ctx.beginPath();
      ctx.moveTo(x0, y0 + ch + bLen);
      ctx.lineTo(x0, y0 + ch);
      ctx.lineTo(x0 + ch, y0);
      ctx.lineTo(x0 + ch + bLen, y0);
      ctx.stroke();

      // Top-Right bracket
      ctx.beginPath();
      ctx.moveTo(x0 + cardW - ch - bLen, y0);
      ctx.lineTo(x0 + cardW - ch, y0);
      ctx.lineTo(x0 + cardW, y0 + ch);
      ctx.lineTo(x0 + cardW, y0 + ch + bLen);
      ctx.stroke();

      ctx.shadowBlur = 0; // Reset shadow for crisp text rendering

      // Top LED Indicator Dot
      ctx.fillStyle = conf.color;
      ctx.beginPath();
      ctx.arc(x0 + 15, y0 + 13, 3, 0, Math.PI * 2);
      ctx.fill();

      // Top Header: Category Tag & Sector Title
      ctx.font = '800 11px JetBrains Mono';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`[ ${rawName.toUpperCase()} ]`, x0 + 24, y0 + 13);

      // Middle Line: Subtitle / Domain Role
      ctx.font = '500 9.5px Inter, sans-serif';
      ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
      ctx.fillText(subtitle, x0 + 14, y0 + 29);

      // Bottom Line: Live Telemetry Metrics with Mini Pill
      ctx.fillStyle = sector.id === 'hazard' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(56, 189, 248, 0.12)';
      ctx.strokeStyle = sector.id === 'hazard' ? 'rgba(244, 63, 94, 0.4)' : 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x0 + 12, y0 + 40, metW + 16, 14, 3);
      ctx.fill();
      ctx.stroke();

      ctx.font = '700 9px JetBrains Mono';
      ctx.fillStyle = sector.id === 'hazard' ? '#f43f5e' : 'rgba(56, 189, 248, 1)';
      ctx.fillText(metricsText, x0 + 20, y0 + 47);

      ctx.restore();
    }
    ctx.restore();
  }

  renderEnergyConduits(ctx, graph, analysis, state, effects) {
    const selectedId = state.selectedNodeId;
    const hoveredId = this.hoveredNodeId;
    const activeTarget = hoveredId || selectedId;
    const activePathEdges = this.pathFollower.getActivePathEdges();

    ctx.save();

    // Grouping for edge bundling (avoids laser floodlight)
    for (const edge of graph.edges) {
      if (state.timelineActiveNodeIds) {
        if (!state.timelineActiveNodeIds.has(edge.source) || !state.timelineActiveNodeIds.has(edge.target)) {
          continue; // Skip conduits for unborn nodes in this historical commit
        }
      }

      const src = graph.getNode(edge.source);
      const tgt = graph.getNode(edge.target);
      if (!src || !tgt) continue;

      const edgeKey = `${edge.source}->${edge.target}`;
      const isPathEdge = activePathEdges.has(edgeKey);
      const isConnectedToActive = activeTarget && (edge.source === activeTarget || edge.target === activeTarget);
      const isBlackout = effects.blackoutNodes.has(edge.source) || effects.blackoutNodes.has(edge.target);

      if (isBlackout) {
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
        ctx.lineWidth = 0.4;
      } else if (isPathEdge) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
      } else if (isConnectedToActive) {
        const isOutgoing = edge.source === activeTarget;
        // Soft gradient arc (avoids blinding solid fan)
        ctx.strokeStyle = isOutgoing ? 'rgba(245, 158, 11, 0.45)' : 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.shadowBlur = 0;
      } else if (activeTarget) {
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.08)';
        ctx.lineWidth = 0.3;
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
        ctx.lineWidth = 0.6;
        ctx.shadowBlur = 0;
      }

      // Smooth Curved Arc
      const mx = (src.x + tgt.x) / 2;
      const my = (src.y + tgt.y) / 2;
      const dx = tgt.x - src.x;
      const dy = tgt.y - src.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const curveAmount = Math.min(dist * 0.1, 28);
      const cx = mx - (dy / dist) * curveAmount;
      const cy = my + (dx / dist) * curveAmount;

      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.quadraticCurveTo(cx, cy, tgt.x, tgt.y);
      ctx.stroke();

      // Moving Packet on Highlighted Conduits
      if (isConnectedToActive || isPathEdge) {
        const t = (this.time * 1.4) % 1;
        const px = (1 - t) * (1 - t) * src.x + 2 * (1 - t) * t * cx + t * t * tgt.x;
        const py = (1 - t) * (1 - t) * src.y + 2 * (1 - t) * t * cy + t * t * tgt.y;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  renderProceduralArchitectures(ctx, graph, analysis, state, effects, camera) {
    const selectedId = state.selectedNodeId;
    const hoveredId = this.hoveredNodeId;
    const activeTarget = hoveredId || selectedId;
    const filter = state.activeFilter;
    const search = state.searchQuery;
    const activePathNodes = new Set(this.pathFollower.activePath);

    // Active Connected Subsystem Neighborhood
    const connectedNeighbors = new Set();
    if (activeTarget) {
      connectedNeighbors.add(activeTarget);
      for (const dep of graph.getDependencies(activeTarget)) connectedNeighbors.add(dep);
      for (const caller of graph.getDependents(activeTarget)) connectedNeighbors.add(caller);
    }

    // Viewport Frustum Bounds (in World coordinates)
    const halfW = (this.canvas.width / (2 * camera.zoom)) + 140;
    const halfH = (this.canvas.height / (2 * camera.zoom)) + 140;
    const camX = -camera.x;
    const camY = -camera.y;

    for (const node of graph.nodes.values()) {
      const isSelected = selectedId === node.id;
      const isHovered = hoveredId === node.id;

      // Viewport Frustum Culling
      if (!isSelected && !isHovered) {
        if (node.x < camX - halfW || node.x > camX + halfW || node.y < camY - halfH || node.y > camY + halfH) {
          continue;
        }
      }

      const stat = analysis.nodeStats.get(node.id);
      if (!stat) continue;

      let visible = true;
      if (filter === 'modules' && node.type !== 'module' && node.type !== 'project') visible = false;
      if (filter === 'functions' && node.type !== 'function') visible = false;
      if (filter === 'hotspots' && stat.centralityPct < 85) visible = false;
      if (filter === 'cycles' && !stat.isCyclic) visible = false;
      if (filter === 'threats' && stat.archetype !== 'threat_boss' && stat.riskScore < 70) visible = false;
      if (filter === 'unused' && stat.totalConnections > 0) visible = false;

      if (search && !node.name.toLowerCase().includes(search) && !node.path.toLowerCase().includes(search)) {
        visible = false;
      }

      const isBlackout = effects.blackoutNodes.has(node.id);
      const isFlowTarget = activePathNodes.has(node.id);

      if (!visible && !isSelected && !isHovered) continue;

      // Contextual Subsystem Focus Dimming & Historical Timeline Masking
      const isTimelineActive = !state.timelineActiveNodeIds || state.timelineActiveNodeIds.has(node.id);

      ctx.save();
      if (!isTimelineActive) {
        ctx.globalAlpha = 0.04; // Unborn building in this historical commit
      } else if (activeTarget) {
        if (connectedNeighbors.has(node.id)) {
          ctx.globalAlpha = 1.0;
        } else {
          ctx.globalAlpha = 0.14; // Dim unrelated architecture
        }
      }

      // Render 2.5D Building Platform & Silhouette
      this.buildings.renderBuilding(ctx, node, stat, {
        zoom: camera.zoom,
        isSelected,
        isHovered,
        isBlackout,
        isFlowTarget,
        activeMode: this.activeMode
      });
      ctx.restore();
    }
  }

  /**
   * Screen-Space Anti-Collision Label Renderer.
   * Eliminates the giant text scaling bug and prevents overlapping label walls!
   */
  renderScreenSpaceLabels(ctx, width, height) {
    const { camera, graph, analysis, state } = this;
    const selectedId = state.selectedNodeId;
    const hoveredId = this.hoveredNodeId;
    const search = state.searchQuery;

    const candidateNodes = [];

    for (const node of graph.nodes.values()) {
      const stat = analysis.nodeStats.get(node.id);
      if (!stat) continue;

      const screenPos = camera.worldToScreen(node.x, node.y);
      if (screenPos.x < -60 || screenPos.x > width + 60 || screenPos.y < -40 || screenPos.y > height + 40) {
        continue;
      }

      const isSelected = selectedId === node.id;
      const isHovered = hoveredId === node.id;
      const isKeyLandmark = stat.centralityPct >= 94 || stat.archetype === 'threat_boss';
      const isSearchResult = search && (node.name.toLowerCase().includes(search) || node.path.toLowerCase().includes(search));

      // Determine Priority for rendering
      let priority = 0;
      if (isSelected) priority = 100;
      else if (isHovered) priority = 90;
      else if (isSearchResult) priority = 80;
      else if (isKeyLandmark) priority = 70;
      else if (camera.zoom >= 2.5) priority = 50;
      else if (camera.zoom >= 1.2 && stat.centralityPct >= 80) priority = 40;

      if (priority > 0) {
        candidateNodes.push({
          node,
          stat,
          screenX: screenPos.x,
          screenY: screenPos.y,
          priority,
          isSelected,
          isHovered
        });
      }
    }

    // Sort by priority descending
    candidateNodes.sort((a, b) => b.priority - a.priority);

    // Collision Detection Grid
    const placedBoxes = [];
    const maxLabels = camera.zoom >= 3.0 ? 25 : camera.zoom >= 1.2 ? 14 : 7;

    for (const item of candidateNodes) {
      if (placedBoxes.length >= maxLabels && !item.isSelected && !item.isHovered) break;

      ctx.font = item.isSelected || item.isHovered ? '700 10.5px JetBrains Mono' : '500 9.5px JetBrains Mono';
      const text = item.node.name;
      const textWidth = ctx.measureText(text).width;
      const boxW = textWidth + 12;
      const boxH = 16;
      const boxX = item.screenX - boxW / 2;
      const boxY = item.screenY + 12;

      // Check collision
      let collides = false;
      if (!item.isSelected && !item.isHovered) {
        for (const b of placedBoxes) {
          if (boxX < b.x + b.w + 6 && boxX + boxW + 6 > b.x && boxY < b.y + b.h + 4 && boxY + boxH + 4 > b.y) {
            collides = true;
            break;
          }
        }
      }

      if (!collides || item.isSelected || item.isHovered) {
        placedBoxes.push({ x: boxX, y: boxY, w: boxW, h: boxH });

        // Draw Screen-Space Badge
        ctx.save();
        ctx.fillStyle = 'rgba(7, 10, 18, 0.94)';
        ctx.strokeStyle = item.isSelected ? '#38bdf8' : item.isHovered ? '#f59e0b' : 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = item.isSelected || item.isHovered ? 1.4 : 1;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 3);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = item.isSelected ? '#38bdf8' : item.isHovered ? '#f59e0b' : '#f1f5f9';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, item.screenX, boxY + boxH / 2);
        ctx.restore();
      }
    }
  }

  renderScreenSpaceHUD(ctx, width, height) {
    if (!this.hoveredNodeId) return;

    const node = this.graph.getNode(this.hoveredNodeId);
    const stat = this.analysis.nodeStats.get(this.hoveredNodeId);
    if (!node || !stat) return;

    const rarityKey = `rarity_${stat.rarity}`;
    const localizedRarity = i18n.t(rarityKey) || stat.rarity.toUpperCase();
    const rarityConf = RARITY_CONFIG[stat.rarity] || RARITY_CONFIG.common;
    const localizedBiome = i18n.t(`biome_${node.biome}`) || node.biome.toUpperCase();

    const padding = 14;
    const cardWidth = 270;
    const cardHeight = 138;

    let posX = this.mouseScreenX + 18;
    let posY = this.mouseScreenY + 18;

    if (posX + cardWidth > width - 20) posX = this.mouseScreenX - cardWidth - 18;
    if (posY + cardHeight > height - 60) posY = this.mouseScreenY - cardHeight - 18;

    ctx.save();
    ctx.translate(posX, posY);

    ctx.fillStyle = 'rgba(9, 14, 26, 0.96)';
    ctx.strokeStyle = rarityConf.color;
    ctx.lineWidth = 1;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.roundRect(0, 0, cardWidth, cardHeight, 5);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Title
    ctx.font = '700 11.5px JetBrains Mono';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(node.name, padding, padding);

    ctx.font = '400 9px JetBrains Mono';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(node.path, padding, padding + 15);

    // Badges
    ctx.font = '700 8.5px JetBrains Mono';
    ctx.fillStyle = rarityConf.color;
    ctx.fillText(`[${localizedRarity}]`, padding, padding + 32);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`[${localizedBiome}]`, padding + 90, padding + 32);

    // Metrics
    const yStart = padding + 50;
    ctx.font = '400 9px JetBrains Mono';
    ctx.fillStyle = '#94a3b8';

    ctx.fillText(`${i18n.t('inspect_centrality')}:`, padding, yStart);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${stat.centralityPct}%`, padding + 95, yStart);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${i18n.t('stat_risk')}:`, padding + 145, yStart);
    ctx.fillStyle = stat.riskScore > 65 ? '#f43f5e' : stat.riskScore > 35 ? '#f59e0b' : '#10b981';
    ctx.fillText(`${stat.riskScore}%`, padding + 195, yStart);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`FAN-IN:`, padding, yStart + 18);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(`${stat.fanIn}`, padding + 52, yStart + 18);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`FAN-OUT:`, padding + 115, yStart + 18);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(`${stat.fanOut}`, padding + 175, yStart + 18);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`LINES (LOC):`, padding, yStart + 35);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${stat.loc}`, padding + 80, yStart + 35);

    ctx.restore();
  }

  renderMinimap() {
    const { miniCtx, minimapCanvas, graph, analysis, camera } = this;
    const w = minimapCanvas.width;
    const h = minimapCanvas.height;

    miniCtx.fillStyle = '#060912';
    miniCtx.fillRect(0, 0, w, h);

    const scale = 0.052;
    const cx = w / 2;
    const cy = h / 2;

    for (const sector of Object.values(BIOME_SECTORS)) {
      const conf = BIOME_CONFIG[sector.id] || BIOME_CONFIG.core;
      miniCtx.strokeStyle = `${conf.color}35`;
      miniCtx.lineWidth = 1;
      miniCtx.beginPath();
      miniCtx.arc(cx + sector.x * scale, cy + sector.y * scale, sector.radius * scale, 0, Math.PI * 2);
      miniCtx.stroke();
    }

    for (const node of graph.nodes.values()) {
      const stat = analysis.nodeStats.get(node.id);
      const nx = cx + node.x * scale;
      const ny = cy + node.y * scale;
      const col = stat ? (RARITY_CONFIG[stat.rarity]?.color || '#38bdf8') : '#38bdf8';

      miniCtx.fillStyle = col;
      miniCtx.fillRect(nx, ny, 1.6, 1.6);
    }

    const vpW = ((this.displayWidth || this.canvas.width) / camera.zoom) * scale;
    const vpH = ((this.displayHeight || this.canvas.height) / camera.zoom) * scale;
    const vpX = cx - (camera.x) * scale - vpW / 2;
    const vpY = cy - (camera.y) * scale - vpH / 2;

    miniCtx.strokeStyle = '#38bdf8';
    miniCtx.lineWidth = 1.2;
    miniCtx.strokeRect(vpX, vpY, vpW, vpH);
  }
}
