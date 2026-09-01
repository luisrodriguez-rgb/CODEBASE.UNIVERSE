/**
 * High-Performance Visual Graph World Renderer for CODEBASE.UNIVERSE.
 * - Procedural metric-driven building silhouettes
 * - 4-Tier Semantic Zoom into code
 * - "Follow the Flow" & "Trace Path" execution engine
 * - Particle packet flow on glowing energy conduits
 * - ZERO EMOJIS: Pure vector canvas geometry and tactile badges.
 */

import { WorldCamera } from './camera.js';
import { WorldLayout, BIOME_SECTORS } from './layout.js';
import { WorldEffects } from './effects.js';
import { ProceduralBuildingRenderer } from './proceduralBuildings.js';
import { PathFollower } from './pathFollower.js';
import { BIOME_CONFIG, RARITY_CONFIG } from '../analysis/types.js';
import { i18n } from '../i18n/translations.js';

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
      const stat = this.analysis.nodeStats.get(node.id);
      const radius = 16;

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
      if (pulseTimer > 0.28 && this.graph.edges.length > 0) {
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

    // 1. Deep Space Holographic Grid
    this.renderSpaceBackground(ctx, width, height, camera);

    ctx.save();
    ctx.translate(width / 2 + camera.x * camera.zoom, height / 2 + camera.y * camera.zoom);
    ctx.scale(camera.zoom, camera.zoom);

    // 2. Biome Sector Boundaries & Concentric Range Circles
    this.renderBiomeTerritories(ctx);

    // 3. Glowing Energy Conduits & Flow Highways
    this.renderEnergyConduits(ctx, graph, analysis, state, effects);

    // 4. Procedural Metric-Driven Architectural Buildings
    this.renderProceduralArchitectures(ctx, graph, analysis, state, effects, camera);

    // 5. Active FX (Shockwaves, Pulses)
    effects.render(ctx);

    ctx.restore();

    // 6. Tactical Hover Tooltip (Screen-Space)
    this.renderScreenSpaceHUD(ctx, width, height);
  }

  renderSpaceBackground(ctx, width, height, camera) {
    ctx.fillStyle = '#040711';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.22)';
    ctx.lineWidth = 1;

    const gridSize = 65 * camera.zoom;
    const offsetX = (width / 2 + camera.x * camera.zoom) % gridSize;
    const offsetY = (height / 2 + camera.y * camera.zoom) % gridSize;

    ctx.beginPath();
    for (let x = offsetX; x < width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = offsetY; y < height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  renderBiomeTerritories(ctx) {
    ctx.save();
    for (const sector of Object.values(BIOME_SECTORS)) {
      const conf = BIOME_CONFIG[sector.id] || BIOME_CONFIG.core;
      const localizedName = i18n.t(`biome_${sector.id}`) || sector.name;
      const localizedDesc = i18n.t(`biome_${sector.id}_desc`) || conf.desc;

      // Soft Nebula Glow
      const glow = ctx.createRadialGradient(sector.x, sector.y, 15, sector.x, sector.y, sector.radius + 60);
      glow.addColorStop(0, `${conf.color}15`);
      glow.addColorStop(0.65, `${conf.color}04`);
      glow.addColorStop(1, 'transparent');

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sector.x, sector.y, sector.radius + 60, 0, Math.PI * 2);
      ctx.fill();

      // Concentric Tactical Rings
      ctx.strokeStyle = `${conf.color}35`;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([8, 10]);
      ctx.beginPath();
      ctx.arc(sector.x, sector.y, sector.radius + 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Tactical Header Pill
      ctx.save();
      ctx.translate(sector.x, sector.y - sector.radius - 24);
      
      ctx.font = '700 11px JetBrains Mono';
      const textWidth = ctx.measureText(localizedName).width;
      
      ctx.fillStyle = 'rgba(7, 11, 20, 0.9)';
      ctx.strokeStyle = `${conf.color}70`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-textWidth / 2 - 12, -10, textWidth + 24, 20, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = conf.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(localizedName, 0, 0);

      ctx.font = '400 9px JetBrains Mono';
      ctx.fillStyle = '#64748b';
      ctx.fillText(localizedDesc, 0, 18);
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
    for (const edge of graph.edges) {
      const src = graph.getNode(edge.source);
      const tgt = graph.getNode(edge.target);
      if (!src || !tgt) continue;

      const edgeKey = `${edge.source}->${edge.target}`;
      const isPathEdge = activePathEdges.has(edgeKey);
      const isConnectedToActive = activeTarget && (edge.source === activeTarget || edge.target === activeTarget);
      const isBlackout = effects.blackoutNodes.has(edge.source) || effects.blackoutNodes.has(edge.target);

      if (isBlackout) {
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.15)';
        ctx.lineWidth = 0.5;
      } else if (isPathEdge) {
        // Highlighted Follow-the-Flow Path
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3.0;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
      } else if (isConnectedToActive) {
        const isOutgoing = edge.source === activeTarget;
        ctx.strokeStyle = isOutgoing ? '#f59e0b' : '#38bdf8';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 10;
      } else if (activeTarget) {
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
        ctx.lineWidth = 0.3;
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.09)';
        ctx.lineWidth = 0.7;
        ctx.shadowBlur = 0;
      }

      // Smooth Curved Arc
      const mx = (src.x + tgt.x) / 2;
      const my = (src.y + tgt.y) / 2;
      const dx = tgt.x - src.x;
      const dy = tgt.y - src.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const curveAmount = Math.min(dist * 0.12, 35);
      const cx = mx - (dy / dist) * curveAmount;
      const cy = my + (dx / dist) * curveAmount;

      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.quadraticCurveTo(cx, cy, tgt.x, tgt.y);
      ctx.stroke();

      // Moving Packet on Highlighted Conduits
      if (isConnectedToActive || isPathEdge) {
        const t = (this.time * 1.5) % 1;
        const px = (1 - t) * (1 - t) * src.x + 2 * (1 - t) * t * cx + t * t * tgt.x;
        const py = (1 - t) * (1 - t) * src.y + 2 * (1 - t) * t * cy + t * t * tgt.y;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  renderProceduralArchitectures(ctx, graph, analysis, state, effects, camera) {
    const selectedId = state.selectedNodeId;
    const hoveredId = this.hoveredNodeId;
    const filter = state.activeFilter;
    const search = state.searchQuery;
    const activePathNodes = new Set(this.pathFollower.activePath);

    const labelsToDraw = [];

    for (const node of graph.nodes.values()) {
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

      const isSelected = selectedId === node.id;
      const isHovered = hoveredId === node.id;
      const isBlackout = effects.blackoutNodes.has(node.id);
      const isFlowTarget = activePathNodes.has(node.id);

      if (!visible && !isSelected && !isHovered) continue;

      // Render Procedural Building Silhouette
      this.buildings.renderBuilding(ctx, node, stat, {
        zoom: camera.zoom,
        isSelected,
        isHovered,
        isBlackout,
        isFlowTarget,
        activeMode: this.activeMode
      });

      // Semantic LOD for Labels
      const isKeyLandmark = stat.centralityPct >= 95 || stat.archetype === 'threat_boss';
      if (isSelected || isHovered || camera.zoom >= 2.2 || (camera.zoom >= 0.85 && isKeyLandmark)) {
        labelsToDraw.push({
          node,
          stat,
          isSelected,
          isHovered,
          color: isSelected ? '#38bdf8' : isHovered ? '#f59e0b' : RARITY_CONFIG[stat.rarity]?.color || '#94a3b8'
        });
      }
    }

    // Render Clean Tactile Badges
    for (const item of labelsToDraw) {
      this.renderBuildingLabelBadge(ctx, item);
    }
  }

  renderBuildingLabelBadge(ctx, { node, stat, isSelected, isHovered, color }) {
    ctx.save();
    ctx.translate(node.x, node.y + 14);

    ctx.font = (isSelected || isHovered) ? '700 10.5px JetBrains Mono' : '500 9px JetBrains Mono';
    const text = node.name;
    const textWidth = ctx.measureText(text).width;

    ctx.fillStyle = 'rgba(7, 10, 18, 0.94)';
    ctx.strokeStyle = (isSelected || isHovered) ? color : 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-textWidth / 2 - 6, -3, textWidth + 12, 16, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = (isSelected || isHovered) ? '#ffffff' : '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(text, 0, 0);

    ctx.restore();
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
    const cardWidth = 280;
    const cardHeight = 142;

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
    ctx.font = '700 12px JetBrains Mono';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(node.name, padding, padding);

    ctx.font = '400 9.5px JetBrains Mono';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(node.path, padding, padding + 16);

    // Badges
    ctx.font = '700 9px JetBrains Mono';
    ctx.fillStyle = rarityConf.color;
    ctx.fillText(`[${localizedRarity}]`, padding, padding + 34);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`[${localizedBiome}]`, padding + 95, padding + 34);

    // Metrics
    const yStart = padding + 54;
    ctx.font = '400 9.5px JetBrains Mono';
    ctx.fillStyle = '#94a3b8';

    ctx.fillText(`${i18n.t('inspect_centrality')}:`, padding, yStart);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${stat.centralityPct}%`, padding + 100, yStart);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${i18n.t('stat_risk')}:`, padding + 150, yStart);
    ctx.fillStyle = stat.riskScore > 65 ? '#f43f5e' : stat.riskScore > 35 ? '#f59e0b' : '#10b981';
    ctx.fillText(`${stat.riskScore}%`, padding + 205, yStart);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`FAN-IN:`, padding, yStart + 20);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(`${stat.fanIn}`, padding + 55, yStart + 20);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`FAN-OUT:`, padding + 120, yStart + 20);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(`${stat.fanOut}`, padding + 185, yStart + 20);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`MASS (LOC):`, padding, yStart + 38);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${stat.loc} lines`, padding + 85, yStart + 38);

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
