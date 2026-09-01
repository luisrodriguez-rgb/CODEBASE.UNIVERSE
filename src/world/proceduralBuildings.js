/**
 * Procedural Architectural Building Silhouettes for CODEBASE.UNIVERSE.
 * Encodes code metrics (LOC, Cyclomatic Mass, Fan-In, Centrality, Risk)
 * into structured 2.5D polygonal platforms and isometric citadel pods.
 * ZERO EMOJIS.
 */

import { BIOME_CONFIG, RARITY_CONFIG } from '../analysis/types.js';

export class ProceduralBuildingRenderer {
  constructor() {
    this.time = 0;
  }

  update(dt) {
    this.time += dt;
  }

  renderBuilding(ctx, node, stat, options = {}) {
    const {
      zoom = 1,
      isSelected = false,
      isHovered = false,
      isBlackout = false,
      isFlowTarget = false,
      activeMode = 'world'
    } = options;

    const biomeConf = BIOME_CONFIG[node.biome] || BIOME_CONFIG.core;
    const rarityConf = RARITY_CONFIG[stat.rarity] || RARITY_CONFIG.common;
    const isBoss = stat.archetype === 'threat_boss';
    const isCyclic = stat.isCyclic;

    // Physical dimensions derived from code metrics
    const baseRadius = Math.max(5, Math.min(18, 5 + Math.sqrt(stat.fanIn || 1) * 2.2));
    const height = Math.max(8, Math.min(32, 8 + Math.log10(Math.max(10, stat.loc || 50)) * 8));
    const centralityRatio = (stat.centralityPct || 50) / 100;

    ctx.save();
    ctx.translate(node.x, node.y);

    if (isBlackout) {
      this.renderBlackoutStructure(ctx, baseRadius);
      ctx.restore();
      return;
    }

    // 1. Isometric Base Platform
    this.renderBasePlatform(ctx, baseRadius, biomeConf.color, isSelected, isHovered);

    // 2. Orbital Selection & Centrality Energy Rings
    if (centralityRatio >= 0.8 || isSelected || isHovered) {
      this.renderOrbitalRings(ctx, baseRadius + 4, biomeConf.color, centralityRatio, isSelected);
    }

    // 3. Domain Silhouette Architecture
    this.renderDomainSilhouette(ctx, node.biome, baseRadius, height, biomeConf.color, isBoss);

    // 4. Glowing Status Core Beacon
    this.renderStatusBeacon(ctx, baseRadius, rarityConf.color, isSelected, isHovered);

    // 5. Threat Danger Beacon (Crimson Pulsing Orbit)
    if (isCyclic || isBoss || stat.riskScore >= 75) {
      this.renderThreatBeacon(ctx, baseRadius, isBoss);
    }

    ctx.restore();
  }

  renderBasePlatform(ctx, radius, color, isSelected, isHovered) {
    ctx.save();
    // 2.5D Isometric Diamond/Hexagon Pedestal
    const r = radius * 1.1;
    ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(9, 14, 26, 0.92)';
    ctx.strokeStyle = isSelected ? '#38bdf8' : isHovered ? '#f59e0b' : `${color}55`;
    ctx.lineWidth = isSelected ? 1.8 : 1;

    ctx.beginPath();
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(r, 0);
    ctx.lineTo(0, r * 0.55);
    ctx.lineTo(-r, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  renderOrbitalRings(ctx, radius, color, centrality, isSelected) {
    ctx.save();
    const rot = (this.time * 0.8) % (Math.PI * 2);
    ctx.strokeStyle = isSelected ? '#38bdf8' : `${color}40`;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);

    ctx.beginPath();
    ctx.ellipse(0, 0, radius, radius * 0.55, rot, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  renderDomainSilhouette(ctx, biome, radius, height, color, isBoss) {
    ctx.save();
    const w = radius * 0.85;
    const h = height;

    // Isometric 2.5D Citadel Block
    ctx.fillStyle = `${color}22`;
    ctx.strokeStyle = color;
    ctx.lineWidth = isBoss ? 1.8 : 1;

    // Left Facet
    ctx.beginPath();
    ctx.moveTo(-w, 0);
    ctx.lineTo(0, w * 0.5);
    ctx.lineTo(0, w * 0.5 - h);
    ctx.lineTo(-w, -h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Facet (shaded slightly darker)
    ctx.fillStyle = `${color}12`;
    ctx.beginPath();
    ctx.moveTo(0, w * 0.5);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, -h);
    ctx.lineTo(0, w * 0.5 - h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Roof Top Cap
    ctx.fillStyle = `${color}44`;
    ctx.beginPath();
    ctx.moveTo(0, -w * 0.5 - h);
    ctx.lineTo(w, -h);
    ctx.lineTo(0, w * 0.5 - h);
    ctx.lineTo(-w, -h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  renderStatusBeacon(ctx, radius, color, isSelected, isHovered) {
    ctx.save();
    const pulse = 1 + Math.sin(this.time * 3) * 0.15;
    const r = Math.max(2.5, radius * 0.35) * pulse;

    ctx.fillStyle = isSelected ? '#ffffff' : color;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderThreatBeacon(ctx, radius, isBoss) {
    ctx.save();
    const pulse = Math.abs(Math.sin(this.time * 4));
    const r = radius + 6 + pulse * 4;

    ctx.strokeStyle = `rgba(244, 63, 94, ${0.4 + pulse * 0.5})`;
    ctx.lineWidth = isBoss ? 2 : 1.2;
    ctx.setLineDash([3, 4]);

    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  renderBlackoutStructure(ctx, radius) {
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}
