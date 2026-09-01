/**
 * Procedural Architectural Building Silhouettes for CODEBASE.UNIVERSE.
 * Encodes code metrics (LOC, Cyclomatic Mass, Fan-In, Centrality, Risk)
 * directly into procedural 2.5D geometric vector structures.
 *
 * Rules: ZERO EMOJIS. Pure vector canvas geometry and glowing sci-fi shaders.
 */

import { BIOME_CONFIG, RARITY_CONFIG } from '../analysis/types.js';

export class ProceduralBuildingRenderer {
  constructor() {
    this.time = 0;
  }

  update(dt) {
    this.time += dt;
  }

  /**
   * Renders a procedural building structure on the canvas.
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} node
   * @param {Object} stat
   * @param {Object} options
   */
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

    // Physical dimensions derived from code metrics:
    // Base radius / width: proportional to Fan-In
    const baseRadius = Math.max(7, Math.min(26, 7 + Math.sqrt(stat.fanIn || 1) * 3.2));
    
    // Structure height: proportional to LOC / cyclomatic mass
    const height = Math.max(12, Math.min(54, 12 + Math.log10(Math.max(10, stat.loc || 50)) * 14));
    
    // Core glow intensity: proportional to Centrality
    const centralityRatio = (stat.centralityPct || 50) / 100;

    ctx.save();
    ctx.translate(node.x, node.y);

    if (isBlackout) {
      this.renderBlackoutStructure(ctx, baseRadius);
      ctx.restore();
      return;
    }

    // World Mode Reaction Styling
    if (activeMode === 'threats' && !isBoss && stat.riskScore < 60) {
      ctx.globalAlpha = 0.25;
    } else if (activeMode === 'quests' && !isSelected && !isHovered) {
      ctx.globalAlpha = 0.55;
    }

    // 1. Orbital Ring Conduits (proportional to Fan-In)
    if (stat.fanIn > 5) {
      this.renderOrbitalRings(ctx, baseRadius, stat.fanIn, biomeConf.color);
    }

    // 2. Base Ground Grid Foundation
    this.renderFoundation(ctx, baseRadius, biomeConf.color, isSelected || isHovered);

    // 3. Domain Silhouette Architecture (Centerpiece)
    switch (node.biome) {
      case 'core':
        this.renderCoreNexusCitadel(ctx, baseRadius, height, biomeConf.color, centralityRatio, isBoss);
        break;
      case 'ui':
        this.renderMetropolisTowers(ctx, baseRadius, height, biomeConf.color, isBoss);
        break;
      case 'power':
        this.renderPowerGridJunction(ctx, baseRadius, height, biomeConf.color);
        break;
      case 'bunker':
        this.renderStorageVaultSilo(ctx, baseRadius, height, biomeConf.color);
        break;
      case 'network':
        this.renderTransmissionArray(ctx, baseRadius, height, biomeConf.color);
        break;
      case 'lab':
        this.renderResearchDome(ctx, baseRadius, height, biomeConf.color);
        break;
      case 'hazard':
        this.renderHazardFortress(ctx, baseRadius, height, isCyclic);
        break;
      case 'ruins':
        this.renderForgottenMonolith(ctx, baseRadius, height);
        break;
      default:
        this.renderStandardModule(ctx, baseRadius, height, biomeConf.color);
    }

    // 4. Central Energy Core (Pulsing according to Centrality)
    this.renderEnergyCore(ctx, rarityConf.color, centralityRatio, isBoss);

    // 5. Target Reticle or Flow Beacon
    if (isSelected) {
      this.renderTacticalReticle(ctx, baseRadius + 10);
    } else if (isHovered) {
      this.renderHoverGlow(ctx, baseRadius + 6);
    } else if (isFlowTarget) {
      this.renderWaypointBeam(ctx, baseRadius);
    }

    ctx.restore();
  }

  renderFoundation(ctx, radius, color, isHighlighted) {
    ctx.save();
    ctx.strokeStyle = isHighlighted ? '#38bdf8' : `${color}40`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    if (isHighlighted) {
      ctx.fillStyle = `${color}15`;
      ctx.fill();
    }
    ctx.restore();
  }

  renderOrbitalRings(ctx, radius, fanIn, color) {
    ctx.save();
    const ringCount = Math.min(3, Math.floor(fanIn / 12) + 1);
    for (let i = 1; i <= ringCount; i++) {
      const r = radius + i * 5.5;
      ctx.strokeStyle = `${color}25`;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Domain 1: Core Nexus / Citadel (Central Command Spire)
  renderCoreNexusCitadel(ctx, base, height, color, centrality, isBoss) {
    ctx.save();
    const spireColor = isBoss ? '#f43f5e' : color;

    // Outer Spire Pillars
    ctx.strokeStyle = `${spireColor}90`;
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + this.time * 0.3;
      const px = Math.cos(angle) * (base * 0.7);
      const py = Math.sin(angle) * (base * 0.7);
      
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px * 0.3, py * 0.3 - height * 0.6);
      ctx.stroke();
    }

    // Central Obelisk Tower
    ctx.fillStyle = 'rgba(7, 12, 22, 0.92)';
    ctx.strokeStyle = spireColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -height);
    ctx.lineTo(base * 0.5, 0);
    ctx.lineTo(-base * 0.5, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Radiant crown light
    ctx.fillStyle = isBoss ? '#f43f5e' : '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -height, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Domain 2: UI Metropolis (Step-Tiered Component Skyscrapers)
  renderMetropolisTowers(ctx, base, height, color, isBoss) {
    ctx.save();
    const towerColor = isBoss ? '#f43f5e' : color;
    const w = base * 0.9;
    const h = height * 0.85;

    // Main Skyscraper Tier
    ctx.fillStyle = 'rgba(10, 15, 28, 0.92)';
    ctx.strokeStyle = towerColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h, w, h, 2);
    ctx.fill();
    ctx.stroke();

    // Stepped Upper Spire
    ctx.beginPath();
    ctx.roundRect(-w * 0.3, -h - 8, w * 0.6, 8, 1);
    ctx.fill();
    ctx.stroke();

    // Antenna Mast
    ctx.strokeStyle = `${towerColor}cc`;
    ctx.beginPath();
    ctx.moveTo(0, -h - 8);
    ctx.lineTo(0, -h - 14);
    ctx.stroke();
    ctx.restore();
  }

  // Domain 3: Power Grid (Circuit Junction & Capacitor Core)
  renderPowerGridJunction(ctx, base, height, color) {
    ctx.save();
    ctx.strokeStyle = `${color}cc`;
    ctx.lineWidth = 1.2;

    // Diamond Capacitor Frame
    ctx.fillStyle = 'rgba(10, 18, 16, 0.92)';
    ctx.beginPath();
    ctx.moveTo(0, -base * 1.1);
    ctx.lineTo(base * 1.1, 0);
    ctx.lineTo(0, base * 1.1);
    ctx.lineTo(-base * 1.1, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Internal Circuit Traces
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(-base * 0.6, 0);
    ctx.lineTo(base * 0.6, 0);
    ctx.moveTo(0, -base * 0.6);
    ctx.lineTo(0, base * 0.6);
    ctx.stroke();
    ctx.restore();
  }

  // Domain 4: Data Bunker (Reinforced Persistence Vault)
  renderStorageVaultSilo(ctx, base, height, color) {
    ctx.save();
    const w = base * 1.1;
    const h = height * 0.7;

    ctx.fillStyle = 'rgba(8, 14, 26, 0.94)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;

    // Heavy Fortified Vault Cylinder
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h, w, h, [4, 4, 1, 1]);
    ctx.fill();
    ctx.stroke();

    // Horizontal Security Ribs
    ctx.strokeStyle = `${color}60`;
    ctx.lineWidth = 1;
    for (let y = -h + 6; y < 0; y += 7) {
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 2, y);
      ctx.lineTo(w / 2 - 2, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Domain 5: Transmission Hub (Parabolic Dish & Radar Mast)
  renderTransmissionArray(ctx, base, height, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;

    // Transmission Mast
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -height);
    ctx.stroke();

    // Parabolic Radar Dish Arc
    ctx.fillStyle = 'rgba(7, 14, 24, 0.9)';
    ctx.beginPath();
    ctx.arc(0, -height + 4, base * 0.8, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Transceiver Pulse Emitter
    const pulseR = 2 + Math.sin(this.time * 6) * 1.2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, -height, pulseR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Domain 6: Research Labs (Geodesic Testing Dome)
  renderResearchDome(ctx, base, height, color) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 10, 26, 0.92)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;

    // Geodesic Dome
    ctx.beginPath();
    ctx.arc(0, 0, base * 0.95, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Internal Testing Chamber Lines
    ctx.strokeStyle = `${color}60`;
    ctx.beginPath();
    ctx.moveTo(0, -base * 0.95);
    ctx.lineTo(0, 0);
    ctx.moveTo(-base * 0.65, -base * 0.65);
    ctx.lineTo(0, 0);
    ctx.moveTo(base * 0.65, -base * 0.65);
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.restore();
  }

  // Domain 7: Hazard Zone (Crimson Threat Fortress)
  renderHazardFortress(ctx, base, height, isCyclic) {
    ctx.save();
    const hazardColor = '#f43f5e';
    const rot = isCyclic ? this.time * 2 : 0;

    ctx.fillStyle = 'rgba(28, 8, 14, 0.94)';
    ctx.strokeStyle = hazardColor;
    ctx.lineWidth = 1.5;

    // Angular Hexagonal Hazard Shield
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + rot;
      const x = Math.cos(angle) * (base * 1.15);
      const y = Math.sin(angle) * (base * 1.15);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Danger Core Beacon
    const pulse = 1 + Math.sin(this.time * 8) * 0.2;
    ctx.fillStyle = hazardColor;
    ctx.beginPath();
    ctx.arc(0, 0, 3.5 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Domain 8: Forgotten Ruins (Weathered Monolith)
  renderForgottenMonolith(ctx, base, height) {
    ctx.save();
    ctx.fillStyle = 'rgba(18, 22, 30, 0.85)';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;

    // Segmented Broken Monolith
    ctx.beginPath();
    ctx.moveTo(-base * 0.5, 0);
    ctx.lineTo(-base * 0.4, -height * 0.5);
    ctx.lineTo(-base * 0.1, -height * 0.45);
    ctx.lineTo(base * 0.4, -height * 0.6);
    ctx.lineTo(base * 0.5, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  renderStandardModule(ctx, base, height, color) {
    ctx.save();
    ctx.fillStyle = 'rgba(10, 15, 26, 0.9)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, base * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  renderEnergyCore(ctx, rarityColor, centralityRatio, isBoss) {
    ctx.save();
    const coreRadius = Math.max(2, 2.5 + centralityRatio * 3.5);

    // Glow Halo
    const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, coreRadius * 3);
    glow.addColorStop(0, isBoss ? 'rgba(244, 63, 94, 0.8)' : `${rarityColor}cc`);
    glow.addColorStop(1, 'transparent');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius * 3, 0, Math.PI * 2);
    ctx.fill();

    // Solid Bright Core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderTacticalReticle(ctx, radius) {
    ctx.save();
    const rot = this.time * 1.6;
    ctx.rotate(rot);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.4;

    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, radius, i * (Math.PI / 2) + 0.2, (i + 1) * (Math.PI / 2) - 0.2);
      ctx.stroke();
    }

    ctx.fillStyle = '#38bdf8';
    for (let i = 0; i < 4; i++) {
      const angle = i * (Math.PI / 2);
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * (radius + 4), Math.sin(angle) * (radius + 4), 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  renderHoverGlow(ctx, radius) {
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  renderWaypointBeam(ctx, radius) {
    ctx.save();
    const beamHeight = 90;
    const grad = ctx.createLinearGradient(0, 0, 0, -beamHeight);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
    grad.addColorStop(1, 'transparent');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.5, 0);
    ctx.lineTo(radius * 0.5, 0);
    ctx.lineTo(0, -beamHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  renderBlackoutStructure(ctx, base) {
    ctx.save();
    ctx.fillStyle = '#060910';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, base * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}
