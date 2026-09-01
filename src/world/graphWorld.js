/**
 * High-Performance Visual Graph World Renderer.
 * - Clean, non-overlapping typography with anti-clutter LOD
 * - Luminous Biome Sector Territories with ambient neon aura
 * - Curved bezier energy arcs with dynamic direction
 * - Cyber Hover Tooltip & Crosshairs HUD
 * - Tactical holographic radar minimap
 */

import { WorldCamera } from './camera.js';
import { WorldLayout, BIOME_SECTORS } from './layout.js';
import { WorldEffects } from './effects.js';
import { BIOME_CONFIG, RARITY_CONFIG } from '../analysis/types.js';

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

    this.hoveredNodeId = null;
    this.mouseScreenX = 0;
    this.mouseScreenY = 0;
    this.animFrameId = null;
    this.time = 0;

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

      const worldPos = this.camera.screenToWorld(e.clientX, e.clientY);
      const hitNode = this.hitTest(worldPos.x, worldPos.y);
      this.hoveredNodeId = hitNode ? hitNode.id : null;
      this.canvas.style.cursor = hitNode ? 'pointer' : 'crosshair';
    });

    this.canvas.addEventListener('click', (e) => {
      const worldPos = this.camera.screenToWorld(e.clientX, e.clientY);
      const hitNode = this.hitTest(worldPos.x, worldPos.y);
      if (hitNode) {
        this.state.setSelectedNode(hitNode.id);
        this.camera.centerOn(hitNode.x, hitNode.y, 1.2);
      }
    });
  }

  hitTest(x, y) {
    for (const node of this.graph.nodes.values()) {
      const stat = this.analysis.nodeStats.get(node.id);
      const radius = this.getNodeRadius(node, stat);
      const dx = node.x - x;
      const dy = node.y - y;
      if (dx * dx + dy * dy <= (radius + 6) * (radius + 6)) {
        return node;
      }
    }
    return null;
  }

  getNodeRadius(node, stat) {
    if (!stat) return 4;
    if (stat.archetype === 'threat_boss') return 9;
    if (stat.archetype === 'healthy_core') return 7.5;
    if (stat.rarity === 'legendary') return 6.5;
    if (stat.rarity === 'epic') return 5.5;
    if (stat.rarity === 'rare') return 4.5;
    return 3.5;
  }

  start() {
    let lastTime = performance.now();
    let pulseTimer = 0;

    const loop = (currentTime) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      this.time += dt;

      // Physics layout relaxation step
      this.layout.step(0.04);
      this.camera.update();
      this.effects.update();

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

    // 1. Deep Space Void Background with Grid
    this.renderSpaceBackground(ctx, width, height, camera);

    ctx.save();
    ctx.translate(width / 2 + camera.x * camera.zoom, height / 2 + camera.y * camera.zoom);
    ctx.scale(camera.zoom, camera.zoom);

    // 2. Biome Sector Territories & Continental Islands
    this.renderBiomeTerritories(ctx);

    // 3. Curved Energy Edges
    this.renderCurvedEdges(ctx, graph, analysis, state, effects);

    // 4. Luminous Celestial Nodes & Anti-Clutter Labels
    this.renderCelestialNodes(ctx, graph, analysis, state, effects, camera);

    // 5. Active FX (Shockwaves, Data Pulses)
    effects.render(ctx);

    ctx.restore();

    // 6. Cyber Hover Tooltip & Crosshairs (Screen-Space Rendering)
    this.renderScreenSpaceHUD(ctx, width, height);
  }

  renderSpaceBackground(ctx, width, height, camera) {
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, width, height);

    // Subtle Cyber Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.25)';
    ctx.lineWidth = 1;

    const gridSize = 60 * camera.zoom;
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
      
      // Territory Soft Ambient Nebula Glow
      const glow = ctx.createRadialGradient(sector.x, sector.y, 10, sector.x, sector.y, sector.radius + 50);
      glow.addColorStop(0, `${conf.color}14`);
      glow.addColorStop(0.6, `${conf.color}05`);
      glow.addColorStop(1, 'transparent');

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sector.x, sector.y, sector.radius + 50, 0, Math.PI * 2);
      ctx.fill();

      // Territory Border Shield (Smooth Glowing Dashed Ring)
      ctx.strokeStyle = `${conf.color}35`;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.arc(sector.x, sector.y, sector.radius + 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Territory Header Badge
      ctx.save();
      ctx.translate(sector.x, sector.y - sector.radius - 24);
      
      ctx.font = '700 11px JetBrains Mono';
      const textWidth = ctx.measureText(sector.name).width;
      
      // Badge background pill
      ctx.fillStyle = 'rgba(8, 12, 22, 0.85)';
      ctx.strokeStyle = `${conf.color}60`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-textWidth / 2 - 10, -10, textWidth + 20, 20, 4);
      ctx.fill();
      ctx.stroke();

      // Badge title
      ctx.fillStyle = conf.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sector.name, 0, 0);

      // Subtitle
      ctx.font = '400 9px JetBrains Mono';
      ctx.fillStyle = '#64748b';
      ctx.fillText(conf.desc, 0, 18);
      ctx.restore();
    }
    ctx.restore();
  }

  renderCurvedEdges(ctx, graph, analysis, state, effects) {
    const selectedId = state.selectedNodeId;
    const hoveredId = this.hoveredNodeId;
    const activeTarget = hoveredId || selectedId;

    ctx.save();
    for (const edge of graph.edges) {
      const src = graph.getNode(edge.source);
      const tgt = graph.getNode(edge.target);
      if (!src || !tgt) continue;

      const isConnectedToActive = activeTarget && (edge.source === activeTarget || edge.target === activeTarget);
      const isBlackout = effects.blackoutNodes.has(edge.source) || effects.blackoutNodes.has(edge.target);

      const isSameBiome = src.biome === tgt.biome;

      if (isBlackout) {
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.2)';
        ctx.lineWidth = 0.5;
      } else if (isConnectedToActive) {
        const isOutgoing = edge.source === activeTarget;
        ctx.strokeStyle = isOutgoing ? '#f59e0b' : '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 6;
      } else if (activeTarget) {
        // Dim non-connected lines when an entity is focused
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.15)';
        ctx.lineWidth = 0.3;
        ctx.shadowBlur = 0;
      } else {
        // Default clean subtle arc
        ctx.strokeStyle = isSameBiome ? 'rgba(56, 189, 248, 0.12)' : 'rgba(148, 163, 184, 0.06)';
        ctx.lineWidth = isSameBiome ? 0.8 : 0.5;
        ctx.shadowBlur = 0;
      }

      // Draw subtle curved quadratic bezier arc
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
    }
    ctx.restore();
  }

  renderCelestialNodes(ctx, graph, analysis, state, effects, camera) {
    const selectedId = state.selectedNodeId;
    const hoveredId = this.hoveredNodeId;
    const filter = state.activeFilter;
    const search = state.searchQuery;

    // Collect labels to draw so we render them in a clean pass without overlapping
    const labelsToDraw = [];

    for (const node of graph.nodes.values()) {
      const stat = analysis.nodeStats.get(node.id);
      if (!stat) continue;

      // Filter checks
      let visible = true;
      if (filter === 'modules' && node.type !== 'module' && node.type !== 'project') visible = false;
      if (filter === 'functions' && node.type !== 'function') visible = false;
      if (filter === 'hotspots' && stat.centralityPct < 85) visible = false;
      if (filter === 'cycles' && !stat.isCyclic) visible = false;
      if (filter === 'threats' && stat.archetype !== 'threat_boss' && stat.riskScore < 75) visible = false;
      if (filter === 'unused' && stat.totalConnections > 0) visible = false;

      if (search && !node.name.toLowerCase().includes(search) && !node.path.toLowerCase().includes(search)) {
        visible = false;
      }

      const isSelected = selectedId === node.id;
      const isHovered = hoveredId === node.id;
      const isBlackout = effects.blackoutNodes.has(node.id);
      const isCyclic = stat.isCyclic;
      const isBoss = stat.archetype === 'threat_boss';
      const radius = this.getNodeRadius(node, stat);
      const rarityColor = RARITY_CONFIG[stat.rarity]?.color || '#94a3b8';

      ctx.save();
      ctx.translate(node.x, node.y);

      if (isBlackout) {
        // Blackout Ghost Node
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(2, radius * 0.7), 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
      } else if (!visible) {
        // Dimmed node
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(1.5, radius * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(30, 41, 59, 0.2)';
        ctx.fill();
      } else {
        // Luminous Outer Halo on Hover/Select/Boss
        if (isSelected || isHovered) {
          const pulseScale = 1 + Math.sin(this.time * 6) * 0.15;
          ctx.beginPath();
          ctx.arc(0, 0, (radius + 6) * pulseScale, 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(245, 158, 11, 0.2)';
          ctx.fill();
          ctx.strokeStyle = isSelected ? '#38bdf8' : '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (isBoss) {
          const pulseScale = 1 + Math.sin(this.time * 4) * 0.12;
          ctx.beginPath();
          ctx.arc(0, 0, (radius + 5) * pulseScale, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
          ctx.fill();
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Cyclic Anomaly Subtle Indicator
        if (isCyclic && !isBoss) {
          ctx.beginPath();
          ctx.arc(0, 0, radius + 2.5, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Node Body Orb
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = isBoss ? '#f43f5e' : rarityColor;
        ctx.fill();

        // Inner Specular Core
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(1, radius * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Intelligent Label Culling (STRICT ANTI-CLUTTER LOD)
        // Never show labels for ordinary nodes unless hovered or selected!
        const isKeyLandmark = stat.centralityPct >= 96 || (isBoss && stat.riskScore >= 80);
        if (isSelected || isHovered || (camera.zoom >= 0.9 && isKeyLandmark)) {
          labelsToDraw.push({
            node,
            stat,
            isSelected,
            isHovered,
            radius,
            color: isSelected ? '#38bdf8' : isHovered ? '#f59e0b' : rarityColor
          });
        }
      }

      ctx.restore();
    }

    // Render cleanly formatted, non-overlapping label badges
    for (const item of labelsToDraw) {
      this.renderNodeLabelBadge(ctx, item);
    }
  }

  renderNodeLabelBadge(ctx, { node, stat, isSelected, isHovered, radius, color }) {
    ctx.save();
    ctx.translate(node.x, node.y + radius + 8);

    ctx.font = (isSelected || isHovered) ? '700 10.5px JetBrains Mono' : '500 9px JetBrains Mono';
    const text = node.name;
    const textWidth = ctx.measureText(text).width;

    // Dark Frosted Pill Background
    ctx.fillStyle = 'rgba(7, 10, 18, 0.92)';
    ctx.strokeStyle = (isSelected || isHovered) ? color : 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-textWidth / 2 - 6, -3, textWidth + 12, 16, 3);
    ctx.fill();
    ctx.stroke();

    // Text Label
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

    const rarityConf = RARITY_CONFIG[stat.rarity] || RARITY_CONFIG.common;
    const biomeConf = BIOME_CONFIG[node.biome] || BIOME_CONFIG.core;

    const padding = 14;
    const cardWidth = 260;
    const cardHeight = 135;

    let posX = this.mouseScreenX + 18;
    let posY = this.mouseScreenY + 18;

    if (posX + cardWidth > width - 20) posX = this.mouseScreenX - cardWidth - 18;
    if (posY + cardHeight > height - 60) posY = this.mouseScreenY - cardHeight - 18;

    ctx.save();
    ctx.translate(posX, posY);

    // Glassmorphic Card Background
    ctx.fillStyle = 'rgba(10, 15, 26, 0.94)';
    ctx.strokeStyle = rarityConf.color;
    ctx.lineWidth = 1;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.roundRect(0, 0, cardWidth, cardHeight, 6);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Card Header: Name & Biome
    ctx.font = '700 12px JetBrains Mono';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(node.name, padding, padding);

    ctx.font = '400 9.5px JetBrains Mono';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(node.path, padding, padding + 16);

    // Tags strip (Rarity & Biome)
    ctx.font = '700 9px JetBrains Mono';
    ctx.fillStyle = rarityConf.color;
    ctx.fillText(`[${rarityConf.name.toUpperCase()}]`, padding, padding + 34);

    ctx.fillStyle = biomeConf.color;
    ctx.fillText(`SECTOR: ${biomeConf.name.toUpperCase()}`, padding + 85, padding + 34);

    // Metrics Grid
    const yStart = padding + 54;
    ctx.font = '400 9.5px JetBrains Mono';
    ctx.fillStyle = '#94a3b8';

    ctx.fillText(`CENTRALITY:`, padding, yStart);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${stat.centralityPct}%`, padding + 85, yStart);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`RISK:`, padding + 135, yStart);
    ctx.fillStyle = stat.riskScore > 65 ? '#f43f5e' : stat.riskScore > 35 ? '#f59e0b' : '#10b981';
    ctx.fillText(`${stat.riskScore}%`, padding + 175, yStart);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`FAN-IN (CALLERS):`, padding, yStart + 18);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(`${stat.fanIn}`, padding + 120, yStart + 18);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`FAN-OUT (DEPS):`, padding, yStart + 34);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(`${stat.fanOut}`, padding + 120, yStart + 34);

    ctx.restore();
  }

  renderMinimap() {
    const { miniCtx, minimapCanvas, graph, analysis, camera } = this;
    const w = minimapCanvas.width;
    const h = minimapCanvas.height;

    miniCtx.fillStyle = '#070a12';
    miniCtx.fillRect(0, 0, w, h);

    const scale = 0.055;
    const cx = w / 2;
    const cy = h / 2;

    // Draw miniature sector boundary circles
    for (const sector of Object.values(BIOME_SECTORS)) {
      const conf = BIOME_CONFIG[sector.id] || BIOME_CONFIG.core;
      miniCtx.strokeStyle = `${conf.color}33`;
      miniCtx.lineWidth = 1;
      miniCtx.beginPath();
      miniCtx.arc(cx + sector.x * scale, cy + sector.y * scale, sector.radius * scale, 0, Math.PI * 2);
      miniCtx.stroke();
    }

    // Draw miniature nodes
    for (const node of graph.nodes.values()) {
      const stat = analysis.nodeStats.get(node.id);
      const nx = cx + node.x * scale;
      const ny = cy + node.y * scale;
      const col = stat ? (RARITY_CONFIG[stat.rarity]?.color || '#38bdf8') : '#38bdf8';

      miniCtx.fillStyle = col;
      miniCtx.fillRect(nx, ny, 1.5, 1.5);
    }

    // Draw camera viewport bounds
    const vpW = ((this.displayWidth || this.canvas.width) / camera.zoom) * scale;
    const vpH = ((this.displayHeight || this.canvas.height) / camera.zoom) * scale;
    const vpX = cx - (camera.x) * scale - vpW / 2;
    const vpY = cy - (camera.y) * scale - vpH / 2;

    miniCtx.strokeStyle = '#38bdf8';
    miniCtx.lineWidth = 1.2;
    miniCtx.strokeRect(vpX, vpY, vpW, vpH);
  }
}
