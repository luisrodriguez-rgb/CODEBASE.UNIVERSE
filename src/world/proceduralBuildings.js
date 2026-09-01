/**
 * Next-Gen Procedural Architectural Citadels for CODEBASE.UNIVERSE.
 * Transforms raw code metrics into stunning, multi-tiered Sci-Fi Megastructures
 * with dramatic height hierarchies, glowing windows, radial energy suns, and district silhouettes.
 *
 * ZERO EMOJIS. Pure Canvas 2D vector geometry and holographic cyber aesthetics.
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
   * Renders a full architectural megastructure.
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
    const isMythic = stat.rarity === 'mythic' || stat.centralityPct >= 92;
    const isLegendary = stat.rarity === 'legendary' || stat.centralityPct >= 80;

    // Dramatic Visual Hierarchy based on Centrality & LOC:
    // Mythic/Legendary: Towering Skyscrapers (Height 60px to 110px, Base 22px to 36px)
    // Common Leaves: Low-profile micro-nodes (Height 8px to 16px, Base 6px to 10px)
    let baseRadius, height;

    if (isMythic) {
      baseRadius = 24 + Math.min(14, Math.sqrt(stat.fanIn || 1) * 2.5);
      height = 70 + Math.min(45, Math.log10(Math.max(10, stat.loc || 100)) * 18);
    } else if (isLegendary) {
      baseRadius = 16 + Math.min(10, Math.sqrt(stat.fanIn || 1) * 2.0);
      height = 45 + Math.min(30, Math.log10(Math.max(10, stat.loc || 50)) * 14);
    } else if (stat.rarity === 'epic' || stat.rarity === 'rare') {
      baseRadius = 11 + Math.min(6, Math.sqrt(stat.fanIn || 1) * 1.5);
      height = 26 + Math.min(20, Math.log10(Math.max(10, stat.loc || 30)) * 10);
    } else {
      baseRadius = 5 + Math.min(4, Math.sqrt(stat.fanIn || 1) * 1.0);
      height = 9 + Math.min(12, Math.log10(Math.max(10, stat.loc || 10)) * 6);
    }

    ctx.save();
    ctx.translate(node.x, node.y);

    if (isBlackout) {
      this.renderBlackoutNode(ctx, baseRadius);
      ctx.restore();
      return;
    }

    // 1. Illuminated Ground Foundation Pad
    this.renderFoundationPlatform(ctx, baseRadius, biomeConf.color, isSelected, isHovered, isMythic);

    // 2. Multi-tier Orbital Rings & Centrality Halos
    if (isMythic || isLegendary || isSelected || isHovered) {
      this.renderPulsingHaloRings(ctx, baseRadius + 6, biomeConf.color, isMythic, isSelected);
    }

    // 3. Skyward Megastructure Geometry
    if (isMythic || isLegendary) {
      this.renderMegaSkyscraper(ctx, node.biome, baseRadius, height, biomeConf.color, rarityConf.color, isSelected, isHovered);
    } else {
      this.renderStandardFacility(ctx, node.biome, baseRadius, height, biomeConf.color, rarityConf.color, isSelected, isHovered);
    }

    // 4. Vertical Skyward Light Beam (For Mythic Citadels)
    if (isMythic || isSelected) {
      this.renderSkywardLightBeam(ctx, height, biomeConf.color, isSelected);
    }

    // 5. Threat Hazard Ring & Emergency Holo-Badge
    if (isCyclic || isBoss || stat.riskScore >= 75) {
      this.renderThreatWarningHoloring(ctx, baseRadius, isBoss);
    }

    ctx.restore();
  }

  renderFoundationPlatform(ctx, radius, color, isSelected, isHovered, isMythic) {
    ctx.save();
    const r = radius * 1.25;

    // Glowing ground shadow & circuit lines
    const groundGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, r * 1.8);
    groundGlow.addColorStop(0, isSelected ? 'rgba(56, 189, 248, 0.45)' : `${color}25`);
    groundGlow.addColorStop(1, 'transparent');

    ctx.fillStyle = groundGlow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Octagonal / Diamond Cyber Pedestal
    ctx.fillStyle = isSelected ? 'rgba(15, 23, 42, 0.95)' : 'rgba(7, 10, 18, 0.92)';
    ctx.strokeStyle = isSelected ? '#38bdf8' : isHovered ? '#f59e0b' : `${color}70`;
    ctx.lineWidth = isSelected ? 2 : isMythic ? 1.6 : 1;

    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * (r * 0.58);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  renderPulsingHaloRings(ctx, radius, color, isMythic, isSelected) {
    ctx.save();
    const pulse = Math.sin(this.time * 2.5);
    const rot = (this.time * 0.7) % (Math.PI * 2);

    ctx.strokeStyle = isSelected ? 'rgba(56, 189, 248, 0.8)' : isMythic ? `${color}88` : `${color}40`;
    ctx.lineWidth = isSelected ? 1.5 : 1;
    ctx.setLineDash([4, 6]);

    ctx.beginPath();
    ctx.ellipse(0, 0, radius + pulse * 2, (radius + pulse * 2) * 0.55, rot, 0, Math.PI * 2);
    ctx.stroke();

    if (isMythic) {
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.4, radius * 1.4 * 0.55, -rot * 0.8, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Renders a towering Mega Skyscraper with multi-tier glass terraces, illuminated window matrices, and neon spires.
   */
  renderMegaSkyscraper(ctx, biome, radius, height, color, rarityColor, isSelected, isHovered) {
    ctx.save();
    const w = radius * 0.9;
    const h = height;

    // --- TIER 1: Lower Citadel Podium ---
    const tier1H = h * 0.45;
    ctx.fillStyle = `${color}28`;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;

    // Left Facet
    ctx.beginPath();
    ctx.moveTo(-w, 0);
    ctx.lineTo(0, w * 0.45);
    ctx.lineTo(0, w * 0.45 - tier1H);
    ctx.lineTo(-w, -tier1H);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Facet
    ctx.fillStyle = `${color}18`;
    ctx.beginPath();
    ctx.moveTo(0, w * 0.45);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, -tier1H);
    ctx.lineTo(0, w * 0.45 - tier1H);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing Matrix Windows on Lower Tier
    ctx.fillStyle = rarityColor;
    const rows = 4;
    const cols = 3;
    for (let r = 0; r < rows; r++) {
      const wy = -tier1H + 8 + r * 6;
      for (let c = 0; c < cols; c++) {
        const wx = -w * 0.7 + c * (w * 0.4);
        ctx.fillRect(wx, wy + (wx * 0.2), 2, 2.5);
      }
    }

    // --- TIER 2: Slender Upper Spire Tower ---
    const w2 = w * 0.6;
    const tier2H = h * 0.85;
    ctx.fillStyle = `${color}35`;
    ctx.strokeStyle = isSelected ? '#ffffff' : color;
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.moveTo(-w2, -tier1H);
    ctx.lineTo(0, -tier1H + w2 * 0.4);
    ctx.lineTo(0, -tier2H);
    ctx.lineTo(-w2, -tier2H - w2 * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = `${color}20`;
    ctx.beginPath();
    ctx.moveTo(0, -tier1H + w2 * 0.4);
    ctx.lineTo(w2, -tier1H);
    ctx.lineTo(w2, -tier2H - w2 * 0.2);
    ctx.lineTo(0, -tier2H);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // --- TIER 3: Crown Spire & Glowing Antenna ---
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -tier2H);
    ctx.lineTo(0, -h);
    ctx.stroke();

    // Pulsing Tip Beacon
    const pulse = 1 + Math.sin(this.time * 4) * 0.3;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -h, 3 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Diamond Core
    ctx.fillStyle = rarityColor;
    ctx.beginPath();
    ctx.moveTo(0, -tier1H - 4);
    ctx.lineTo(4, -tier1H);
    ctx.lineTo(0, -tier1H + 4);
    ctx.lineTo(-4, -tier1H);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * Renders a domain-specific standard facility structure.
   */
  renderStandardFacility(ctx, biome, radius, height, color, rarityColor, isSelected, isHovered) {
    ctx.save();
    const w = radius * 0.85;
    const h = height;

    if (biome === 'transmission') {
      // Transmission Hub: Parabolic Radar Dish
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.fillStyle = `${color}25`;

      // Dish Arc
      ctx.beginPath();
      ctx.arc(0, -h * 0.6, w * 1.1, Math.PI * 0.8, Math.PI * 1.8);
      ctx.stroke();
      ctx.fill();

      // Mast
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -h);
      ctx.stroke();

      // Signal waves
      const ringR = (this.time * 15) % 18;
      ctx.strokeStyle = `${color}60`;
      ctx.beginPath();
      ctx.arc(0, -h, ringR, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

    } else if (biome === 'bunker') {
      // Storage Bunker: Heavy Fortified Cylinder
      ctx.fillStyle = `${color}30`;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.ellipse(0, 0, w, w * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-w, 0);
      ctx.lineTo(-w, -h);
      ctx.ellipse(0, -h, w, w * 0.5, 0, Math.PI, 0);
      ctx.lineTo(w, 0);
      ctx.fill();
      ctx.stroke();

      // Top Dome
      ctx.fillStyle = `${color}60`;
      ctx.beginPath();
      ctx.ellipse(0, -h, w * 0.7, w * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

    } else if (biome === 'lab') {
      // Geodesic Research Dome
      ctx.fillStyle = `${color}25`;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.arc(0, 0, w * 1.1, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Geodesic Wireframe Lines
      ctx.beginPath();
      ctx.moveTo(-w * 0.8, -h * 0.2);
      ctx.lineTo(0, -h * 0.8);
      ctx.lineTo(w * 0.8, -h * 0.2);
      ctx.stroke();

    } else {
      // Standard Tiered Cyber Pod
      ctx.fillStyle = `${color}25`;
      ctx.strokeStyle = isSelected ? '#38bdf8' : color;
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(-w, 0);
      ctx.lineTo(0, w * 0.5);
      ctx.lineTo(0, w * 0.5 - h);
      ctx.lineTo(-w, -h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = `${color}15`;
      ctx.beginPath();
      ctx.moveTo(0, w * 0.5);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, -h);
      ctx.lineTo(0, w * 0.5 - h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Flat Roof Cap
      ctx.fillStyle = `${color}55`;
      ctx.beginPath();
      ctx.moveTo(0, -w * 0.5 - h);
      ctx.lineTo(w, -h);
      ctx.lineTo(0, w * 0.5 - h);
      ctx.lineTo(-w, -h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Small glowing core dot
    ctx.fillStyle = rarityColor;
    ctx.beginPath();
    ctx.arc(0, -h * 0.5, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderSkywardLightBeam(ctx, height, color, isSelected) {
    ctx.save();
    const beamGlow = ctx.createLinearGradient(0, -height, 0, -height - 180);
    beamGlow.addColorStop(0, isSelected ? 'rgba(56, 189, 248, 0.7)' : `${color}60`);
    beamGlow.addColorStop(0.6, isSelected ? 'rgba(56, 189, 248, 0.15)' : `${color}15`);
    beamGlow.addColorStop(1, 'transparent');

    ctx.fillStyle = beamGlow;
    ctx.beginPath();
    ctx.moveTo(-2, -height);
    ctx.lineTo(2, -height);
    ctx.lineTo(8, -height - 180);
    ctx.lineTo(-8, -height - 180);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  renderThreatWarningHoloring(ctx, radius, isBoss) {
    ctx.save();
    const pulse = Math.abs(Math.sin(this.time * 3.5));
    const r = radius + 8 + pulse * 6;

    ctx.strokeStyle = `rgba(244, 63, 94, ${0.4 + pulse * 0.5})`;
    ctx.lineWidth = isBoss ? 2.2 : 1.4;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Floating Hologram Hazard Triangle
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.55 - 10);
    ctx.lineTo(6, -r * 0.55);
    ctx.lineTo(-6, -r * 0.55);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  renderBlackoutNode(ctx, radius) {
    ctx.save();
    ctx.fillStyle = '#060912';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}
