/**
 * SPRINT 2 - Biome-Specific Procedural Architecture Generators
 * Each biome has its own distinct building geometry and visual language.
 * Building dimensions are data-driven: LOC, centrality, cyclomatic complexity.
 * ZERO EMOJIS.
 */

import { BIOME_VISUAL, SCALE_RULES } from './visualLanguage.js';


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function seededRand(seed) {
  let s = seed | 0;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

function getBuildingDims(stat) {
  const rarity = stat.rarity || 'common';
  const rule = SCALE_RULES[rarity] || SCALE_RULES.common;
  const t = Math.min(1, (stat.centralityPct || 0) / 100);
  const baseRadius = rule.baseMin + t * (rule.baseMax - rule.baseMin);
  const height     = rule.heightMin + t * (rule.heightMax - rule.heightMin)
                   + Math.min(18, Math.log10(Math.max(10, stat.loc || 10)) * 5);
  return { baseRadius, height, rule };
}

// Window grid based on real code metrics
function drawWindowGrid(ctx, w, h, stat, color, time) {
  const cols = Math.min(6, Math.max(1, Math.ceil((stat.cyclomaticEstimate || 1) / 2)));
  const rows = Math.min(9, Math.max(1, Math.ceil((stat.loc || 10) / 35)));
  const risk = stat.riskScore || 0;
  const bright = 0.35 + (stat.centralityPct || 0) / 100 * 0.55;
  const ww = Math.max(2, w / (cols + 1) * 0.6);
  const wh = Math.max(2, h / (rows + 2) * 0.6);

  for (let r = 0; r < rows; r++) {
    const wy = -(h * 0.85) + r * (h / (rows + 1));
    for (let c = 0; c < cols; c++) {
      const wx = -w * 0.7 + c * (w * 1.4 / (cols));
      // High-risk windows flicker red
      let alpha;
      if (risk > 75) {
        alpha = bright * (0.5 + 0.5 * Math.abs(Math.sin(time * 3.8 + r * 1.3 + c * 0.9)));
        ctx.fillStyle = `rgba(244,63,94,${alpha})`;
      } else {
        alpha = bright * (0.6 + 0.4 * Math.abs(Math.sin(time * 0.9 + r * 2.1 + c * 1.4)));
        ctx.fillStyle = `rgba(${hexToRgb(color)},${alpha})`;
      }
      ctx.fillRect(wx - ww / 2, wy - wh / 2, ww, wh);
    }
  }
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

// ---------------------------------------------------------------------------
// Biome-specific renderers
// ---------------------------------------------------------------------------

function renderCoreTower(ctx, w, h, v, stat, time) {
  const pulse = Math.sin(time * 2.0) * 0.5 + 0.5;
  // Base tier
  ctx.fillStyle   = `rgba(56,189,248,0.20)`;
  ctx.strokeStyle = v.base;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-w, 0); ctx.lineTo(0, w * 0.4); ctx.lineTo(0, -h * 0.5); ctx.lineTo(-w, -h * 0.5);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = `rgba(56,189,248,0.12)`;
  ctx.beginPath();
  ctx.moveTo(0, w * 0.4); ctx.lineTo(w, 0); ctx.lineTo(w, -h * 0.5); ctx.lineTo(0, -h * 0.5);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Spire
  ctx.fillStyle   = `rgba(56,189,248,0.30)`;
  ctx.strokeStyle = v.highlight;
  ctx.beginPath();
  ctx.moveTo(-w * 0.5, -h * 0.5); ctx.lineTo(0, -h * 0.6); ctx.lineTo(0, -h); ctx.lineTo(-w * 0.5, -h * 0.9);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = `rgba(56,189,248,0.15)`;
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.6); ctx.lineTo(w * 0.5, -h * 0.5); ctx.lineTo(w * 0.5, -h * 0.9); ctx.lineTo(0, -h);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Windows
  ctx.save(); drawWindowGrid(ctx, w, h, stat, v.windows, time); ctx.restore();
}

function renderUITower(ctx, w, h, v, stat, time) {
  // Dense rectangular block with many windows — urban feel
  ctx.fillStyle   = `rgba(168,85,247,0.18)`;
  ctx.strokeStyle = v.base;
  ctx.lineWidth = 1;
  // Main block
  ctx.beginPath();
  ctx.rect(-w, -h, w * 2, h);
  ctx.fill(); ctx.stroke();
  // Side darker face
  ctx.fillStyle = `rgba(147,51,234,0.25)`;
  ctx.beginPath();
  ctx.moveTo(w, -h); ctx.lineTo(w + w * 0.35, -h * 0.7); ctx.lineTo(w + w * 0.35, 0); ctx.lineTo(w, 0);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Roof accent
  ctx.fillStyle = v.base;
  ctx.fillRect(-w, -h - 2, w * 2, 3);
  // Window matrix (dense — UI is complex)
  ctx.save(); drawWindowGrid(ctx, w, h, stat, v.windows, time); ctx.restore();
  // Ground glow strip
  ctx.fillStyle = `rgba(168,85,247,0.08)`;
  ctx.fillRect(-w * 1.4, -2, w * 2.8, 2);
}

function renderPowerSubstation(ctx, w, h, v, stat, time) {
  const pulse = Math.abs(Math.sin(time * 2.8));
  // Heavy base structure
  ctx.fillStyle   = `rgba(245,158,11,0.18)`;
  ctx.strokeStyle = v.base;
  ctx.lineWidth = 1.2;
  // Main body — trapezoid
  ctx.beginPath();
  ctx.moveTo(-w * 1.1, 0); ctx.lineTo(-w * 0.7, -h * 0.7);
  ctx.lineTo(w * 0.7, -h * 0.7); ctx.lineTo(w * 1.1, 0);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Vertical energy column
  ctx.fillStyle = `rgba(245,158,11,0.30)`;
  ctx.fillRect(-w * 0.15, -h * 0.7, w * 0.3, -h * 0.3);
  // Energy crown coils
  ctx.strokeStyle = v.accent;
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const yr = -h * 0.7 - h * 0.1 * i;
    ctx.strokeStyle = `rgba(16,185,129,${0.6 - i * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(0, yr, w * 0.4, w * 0.12, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Pulsing energy orb at top
  const orbR = 3 + pulse * 2.5;
  const orbGlow = ctx.createRadialGradient(0, -h, 0, 0, -h, orbR * 3);
  orbGlow.addColorStop(0, `rgba(245,158,11,${0.7 + pulse * 0.3})`);
  orbGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = orbGlow;
  ctx.beginPath(); ctx.arc(0, -h, orbR * 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = v.highlight;
  ctx.beginPath(); ctx.arc(0, -h, orbR, 0, Math.PI * 2); ctx.fill();
}

function renderDataSilo(ctx, w, h, v, stat, time) {
  // Heavy fortified cylindrical silo
  const rng = seededRand(stat.loc || 42);
  ctx.fillStyle   = `rgba(59,130,246,0.22)`;
  ctx.strokeStyle = v.base;
  ctx.lineWidth = 1.2;
  // Cylinder body
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.9, w * 0.4, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.fillRect(-w * 0.9, -h, w * 1.8, h);
  ctx.stroke();
  // Top dome
  ctx.fillStyle = `rgba(59,130,246,0.45)`;
  ctx.beginPath();
  ctx.ellipse(0, -h, w * 0.9, w * 0.4, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Security light
  const secPulse = Math.abs(Math.sin(time * 1.5));
  ctx.fillStyle = `rgba(239,68,68,${0.4 + secPulse * 0.5})`;
  ctx.beginPath(); ctx.arc(0, -h - 2, 3, 0, Math.PI * 2); ctx.fill();
  // Horizontal reinforcement bands
  ctx.strokeStyle = `rgba(59,130,246,0.55)`;
  ctx.lineWidth = 0.8;
  for (let i = 1; i <= 3; i++) {
    const yb = -h * (i / 4);
    ctx.beginPath(); ctx.moveTo(-w * 0.9, yb); ctx.lineTo(w * 0.9, yb); ctx.stroke();
  }
}

function renderTransmissionAntenna(ctx, w, h, v, stat, time) {
  const ringR = (time * 18) % (w * 1.8);
  // Mast
  ctx.strokeStyle = v.base;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -h); ctx.stroke();
  // Parabolic dish
  ctx.fillStyle   = `rgba(6,182,212,0.20)`;
  ctx.strokeStyle = v.base;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, -h * 0.65, w * 1.1, Math.PI * 0.8, Math.PI * 1.8);
  ctx.fill(); ctx.stroke();
  // Expanding signal rings
  for (let i = 0; i < 3; i++) {
    const rr = (ringR + i * 12) % (w * 2.2);
    ctx.strokeStyle = `rgba(6,182,212,${Math.max(0, 0.5 - rr / (w * 2.2))})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(0, -h, rr, Math.PI * 1.0, Math.PI * 2.0);
    ctx.stroke();
  }
  // Base support struts
  ctx.strokeStyle = `rgba(6,182,212,0.35)`;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-w, 0); ctx.lineTo(0, -h * 0.2);
  ctx.moveTo( w, 0); ctx.lineTo(0, -h * 0.2);
  ctx.stroke();
}

function renderResearchDome(ctx, w, h, v, stat, time) {
  const pulse = Math.sin(time * 1.8) * 0.5 + 0.5;
  // Geodesic dome
  ctx.fillStyle   = `rgba(16,185,129,0.14)`;
  ctx.strokeStyle = v.base;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(0, 0, w * 1.15, Math.PI, 0);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Geodesic wireframe
  ctx.strokeStyle = `rgba(16,185,129,0.30)`;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(-w * 1.0, -h * 0.15); ctx.lineTo(0, -h * 0.85); ctx.lineTo(w * 1.0, -h * 0.15); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-w * 0.65, 0); ctx.lineTo(-w * 0.25, -h * 0.82); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo( w * 0.65, 0); ctx.lineTo( w * 0.25, -h * 0.82); ctx.stroke();
  // Energy field bubble
  const bubbleR = w * (1.2 + pulse * 0.05);
  ctx.strokeStyle = `rgba(16,185,129,${0.08 + pulse * 0.08})`;
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.arc(0, 0, bubbleR, Math.PI, 0); ctx.stroke();
  // Apex antenna
  ctx.strokeStyle = v.highlight;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -h * 0.85); ctx.lineTo(0, -h * 1.15); ctx.stroke();
  ctx.fillStyle = v.accent;
  ctx.beginPath(); ctx.arc(0, -h * 1.15, 2.5, 0, Math.PI * 2); ctx.fill();
}

function renderCorruptedNode(ctx, w, h, v, stat, time) {
  // Distorted, glitching structure — hazard zone
  const rng = seededRand((stat.loc || 7) + 99);
  const glitch = Math.sin(time * 7.5) * 0.5 + 0.5;

  ctx.fillStyle   = `rgba(244,63,94,0.20)`;
  ctx.strokeStyle = v.base;
  ctx.lineWidth = 1.2;

  // Jagged irregular silhouette
  ctx.beginPath();
  ctx.moveTo(-w, 0);
  const pts = 7;
  for (let i = 0; i <= pts; i++) {
    const prog = i / pts;
    const yl = -h * prog;
    const xOff = (rng() - 0.5) * w * 0.7;
    const isLeft = i % 2 === 0;
    if (i === 0) ctx.lineTo(-w + xOff, yl);
    else ctx.lineTo(isLeft ? -w * 0.3 + xOff : w * 0.3 + xOff, yl);
  }
  ctx.lineTo(w, 0);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Glitch scan line
  const glitchY = -(h * ((time * 0.8) % 1));
  ctx.fillStyle = `rgba(244,63,94,${0.3 + glitch * 0.3})`;
  ctx.fillRect(-w * 1.2, glitchY - 1, w * 2.4, 1.5);

  // Corruption static dots
  ctx.fillStyle = `rgba(251,191,36,0.60)`;
  for (let i = 0; i < 4; i++) {
    const dx = (rng() - 0.5) * w * 1.8;
    const dy = -rng() * h * 0.9;
    ctx.beginPath(); ctx.arc(dx + Math.sin(time * 9 + i) * 2, dy, 1.5, 0, Math.PI * 2); ctx.fill();
  }

  // Warning border pulse
  ctx.strokeStyle = `rgba(244,63,94,${0.4 + glitch * 0.5})`;
  ctx.setLineDash([3,3]);
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.rect(-w * 1.1, -h * 1.05, w * 2.2, h * 1.1); ctx.stroke();
  ctx.setLineDash([]);
}

function renderRuinedStructure(ctx, w, h, v, stat, time) {
  const rng = seededRand(stat.loc || 3);
  // Decayed, collapsed building
  ctx.fillStyle   = `rgba(100,116,139,0.16)`;
  ctx.strokeStyle = v.base;
  ctx.lineWidth = 0.9;
  // Partial walls
  const wallH = h * (0.4 + rng() * 0.5);
  ctx.beginPath();
  ctx.moveTo(-w, 0); ctx.lineTo(-w, -wallH);
  ctx.lineTo(-w * 0.5, -wallH * (0.6 + rng() * 0.3));
  ctx.lineTo(-w * 0.2, -wallH * 0.85);
  ctx.lineTo(0, -wallH * rng());
  ctx.lineTo(w * 0.4, -wallH * 0.4);
  ctx.lineTo(w, -wallH * 0.2);
  ctx.lineTo(w, 0);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Rubble dots at base
  ctx.fillStyle = `rgba(100,116,139,0.30)`;
  for (let i = 0; i < 5; i++) {
    const rx = (rng() - 0.5) * w * 2.2;
    const rr = 1.5 + rng() * 2.5;
    ctx.beginPath(); ctx.arc(rx, -1 - rng() * 4, rr, 0, Math.PI * 2); ctx.fill();
  }
  // No animation — ruins are dead
}

// ---------------------------------------------------------------------------
// Public export
// ---------------------------------------------------------------------------

export class ProceduralBuildingRenderer {
  constructor() { this.time = 0; }
  update(dt) { this.time += dt; }

  renderBuilding(ctx, node, stat, options = {}) {
    const {
      zoom = 1, isSelected = false, isHovered = false,
      isBlackout = false, isFlowTarget = false, activeMode = 'world'
    } = options;

    const biome = node.biome || 'core';
    const v = BIOME_VISUAL[biome] || BIOME_VISUAL.core;
    const { baseRadius: w, height: h, rule } = getBuildingDims(stat);

    ctx.save();
    ctx.translate(node.x, node.y);

    if (isBlackout) {
      ctx.fillStyle = '#060912';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, w * 0.6, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.restore();
      return;
    }

    // Ground foundation glow
    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, w * 2.2);
    glow.addColorStop(0, isSelected ? 'rgba(56,189,248,0.40)' : v.ground.replace('0.08', isHovered ? '0.20' : '0.08'));
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(0, 0, w * 2.2, 0, Math.PI * 2); ctx.fill();

    // Selection / hover halo ring
    if (isSelected || isHovered) {
      const haloAlpha = isSelected ? 0.85 : 0.45;
      ctx.strokeStyle = isSelected ? '#38bdf8' : v.highlight;
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.ellipse(0, 0, w * 1.5, w * 0.65, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Threat warning ring
    if (stat.riskScore >= 75 || stat.isCyclic || stat.archetype === 'threat_boss') {
      const tPulse = Math.abs(Math.sin(this.time * 3.5));
      ctx.strokeStyle = `rgba(244,63,94,${0.35 + tPulse * 0.55})`;
      ctx.lineWidth = stat.archetype === 'threat_boss' ? 2.0 : 1.2;
      ctx.setLineDash([3,4]);
      ctx.beginPath(); ctx.ellipse(0, 0, w * 1.8 + tPulse * 4, (w * 1.8 + tPulse * 4) * 0.5, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      // Hazard triangle
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(0, -w * 1.8 - 10 - tPulse * 4);
      ctx.lineTo(5, -w * 1.8 - tPulse * 4);
      ctx.lineTo(-5, -w * 1.8 - tPulse * 4);
      ctx.closePath(); ctx.fill();
    }

    // Skyward light beam for mythic/legendary
    if (rule.lightBeam || isSelected) {
      const beamGrad = ctx.createLinearGradient(0, -h, 0, -h - 200);
      beamGrad.addColorStop(0, isSelected ? 'rgba(56,189,248,0.60)' : v.glow.replace('0.35','0.50'));
      beamGrad.addColorStop(0.7, isSelected ? 'rgba(56,189,248,0.10)' : v.glow.replace('0.35','0.08'));
      beamGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(-2, -h); ctx.lineTo(2, -h);
      ctx.lineTo(7, -h - 200); ctx.lineTo(-7, -h - 200);
      ctx.closePath(); ctx.fill();
    }

    // Biome-specific geometry
    switch (biome) {
      case 'ui':           renderUITower(ctx, w, h, v, stat, this.time);           break;
      case 'power':        renderPowerSubstation(ctx, w, h, v, stat, this.time);   break;
      case 'bunker':       renderDataSilo(ctx, w, h, v, stat, this.time);          break;
      case 'transmission': renderTransmissionAntenna(ctx, w, h, v, stat, this.time); break;
      case 'lab':          renderResearchDome(ctx, w, h, v, stat, this.time);      break;
      case 'hazard':       renderCorruptedNode(ctx, w, h, v, stat, this.time);     break;
      case 'ruins':        renderRuinedStructure(ctx, w, h, v, stat, this.time);   break;
      default:             renderCoreTower(ctx, w, h, v, stat, this.time);         break;
    }

    ctx.restore();
  }
}
