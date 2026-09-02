/**
 * SPRINT 2 REV2 — Isometric Architecture Generators for CODEBASE.UNIVERSE
 *
 * All buildings share a consistent isometric 2.5D base geometry:
 *   Left face (brighter), Right face (darker), Top cap (lightest).
 * Biome identity comes from rooftop details, emissives, and FX — not from
 * breaking the base shape (which caused the zigzag disaster).
 *
 * Data-driven dimensions:
 *   LOC          -> building height
 *   Centrality   -> building width/rarity
 *   Risk Score   -> window flicker color
 *   Cyclomatic   -> window density
 *
 * ZERO EMOJIS.
 */

import { BIOME_VISUAL, SCALE_RULES } from './visualLanguage.js';

// ---------------------------------------------------------------------------
// Dimension Calculator
// ---------------------------------------------------------------------------

function getDims(stat) {
  const rarity = stat.rarity || 'common';
  const rule   = SCALE_RULES[rarity] || SCALE_RULES.common;
  const t      = Math.min(1, (stat.centralityPct || 0) / 100);
  const w      = rule.baseMin + t * (rule.baseMax - rule.baseMin);
  const h      = rule.heightMin + t * (rule.heightMax - rule.heightMin)
               + Math.min(16, Math.log10(Math.max(10, stat.loc || 10)) * 4.5);
  return { w, h, rule };
}

// ---------------------------------------------------------------------------
// Shared Isometric Building Base
// Draws a 3-face isometric box. Origin is at the building's base center.
// Positive Y = down on canvas. Building grows upward (negative Y).
//
//        top-cap
//      /--------//     / (light)  //    /            //   |  left face   |  right face (darker)
//   |  (brighter)  |  (w/2 side depth)
//   |______________|
//
// ---------------------------------------------------------------------------

function drawIsoBox(ctx, w, h, leftColor, rightColor, topColor, lineColor, lineW) {
  const d = w * 0.40;   // isometric side depth factor

  // --- Left face (front-left) ---
  ctx.fillStyle   = leftColor;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth   = lineW;
  ctx.beginPath();
  ctx.moveTo(-w,  0);
  ctx.lineTo( 0,  d);
  ctx.lineTo( 0,  d - h);
  ctx.lineTo(-w, -h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // --- Right face (front-right, darker) ---
  ctx.fillStyle = rightColor;
  ctx.beginPath();
  ctx.moveTo( 0,  d);
  ctx.lineTo( w,  0);
  ctx.lineTo( w, -h);
  ctx.lineTo( 0,  d - h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // --- Top cap ---
  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(-w, -h);
  ctx.lineTo( 0, -h + d);
  ctx.lineTo( w, -h);
  ctx.lineTo( 0, -h - d);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Window matrix (data-driven)
// Placed on the left face of the iso box.
// ---------------------------------------------------------------------------

function drawWindows(ctx, w, h, stat, winColor, time) {
  const risk   = stat.riskScore || 0;
  const cyclo  = stat.cyclomaticEstimate || 1;
  const loc    = stat.loc || 20;
  const bright = 0.40 + (stat.centralityPct || 0) / 100 * 0.50;
  const cols   = Math.min(5, Math.max(1, Math.ceil(cyclo / 3)));
  const rows   = Math.min(7, Math.max(1, Math.ceil(loc / 40)));
  const ww     = Math.max(1.5, (w * 0.75) / (cols + 1));
  const wh     = Math.max(1.5, (h * 0.70) / (rows + 1));
  const d      = w * 0.40;

  for (let r = 0; r < rows; r++) {
    const fy   = (r + 1) / (rows + 1);
    const baseY = d - h * fy;
    for (let c = 0; c < cols; c++) {
      const fx = (c + 0.5) / cols - 0.5;
      // Project onto left-face: x shifts left as y goes up (isometric)
      const wx = fx * w * 0.75 - (1 - fy) * w * 0.50;
      const wy = baseY + fx * d * 0.75;
      let alpha;
      if (risk > 75) {
        alpha = bright * (0.4 + 0.6 * Math.abs(Math.sin(time * 3.8 + r * 1.7 + c)));
        ctx.fillStyle = `rgba(244,63,94,${alpha.toFixed(2)})`;
      } else {
        alpha = bright * (0.5 + 0.5 * Math.abs(Math.sin(time * 0.8 + r * 1.9 + c * 1.3)));
        ctx.fillStyle = winColor.replace(')', `,${alpha.toFixed(2)})`).replace('rgb(', 'rgba(');
      }
      ctx.fillRect(wx - ww / 2, wy - wh / 2, ww, wh);
    }
  }
}

// ---------------------------------------------------------------------------
// Biome Renderers
// ---------------------------------------------------------------------------

// 1. CORE — stepped spire, gold+cyan, window matrix
function renderCore(ctx, w, h, v, stat, time) {
  const d = w * 0.40;
  // Tier 1 base
  drawIsoBox(ctx, w, h * 0.55,
    `rgba(14,165,233,0.30)`, `rgba(14,165,233,0.16)`, `rgba(56,189,248,0.50)`,
    v.base, 1.0);
  // Tier 2 mid-spire (narrower)
  ctx.save(); ctx.translate(0, -h * 0.55);
  drawIsoBox(ctx, w * 0.60, h * 0.30,
    `rgba(56,189,248,0.32)`, `rgba(56,189,248,0.18)`, `rgba(125,211,252,0.60)`,
    v.highlight, 0.9);
  ctx.restore();
  // Tier 3 crown
  ctx.save(); ctx.translate(0, -h * 0.85);
  drawIsoBox(ctx, w * 0.32, h * 0.15,
    `rgba(125,211,252,0.45)`, `rgba(125,211,252,0.25)`, `rgba(186,230,253,0.75)`,
    v.highlight, 0.8);
  ctx.restore();
  // Antenna
  ctx.save(); ctx.translate(0, -h);
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -h * 0.18); ctx.stroke();
  const bPulse = 1 + Math.sin(time * 4.5) * 0.4;
  ctx.fillStyle = v.accent;
  ctx.beginPath(); ctx.arc(0, -h * 0.18, 2.5 * bPulse, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Windows on left face
  drawWindows(ctx, w, h * 0.55, stat, `rgb(186,230,253)`, time);
}

// 2. UI METROPOLIS — wide glass tower, violet windows, rooftop deck
function renderUI(ctx, w, h, v, stat, time) {
  const d = w * 0.40;
  // Main tower
  drawIsoBox(ctx, w, h,
    `rgba(168,85,247,0.22)`, `rgba(147,51,234,0.32)`, `rgba(192,132,252,0.45)`,
    v.base, 1.0);
  // Rooftop accent bar
  ctx.save(); ctx.translate(0, -h);
  ctx.fillStyle = v.base;
  ctx.beginPath();
  ctx.moveTo(-w, 0); ctx.lineTo(0, d); ctx.lineTo(w, 0); ctx.lineTo(0, -d);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  // Rooftop antenna cluster (3 small spires)
  for (let i = -1; i <= 1; i++) {
    ctx.save();
    const ax = i * w * 0.4;
    const ay = -h - Math.abs(i) * d * 0.25;
    ctx.translate(ax, ay);
    ctx.strokeStyle = v.highlight; ctx.lineWidth = 0.9;
    const ah = h * 0.12 + Math.abs(i) * 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -ah); ctx.stroke();
    ctx.fillStyle = v.accent;
    ctx.beginPath(); ctx.arc(0, -ah, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  drawWindows(ctx, w, h, stat, `rgb(240,171,252)`, time);
}

// 3. POWER GRID — squat industrial block + energy coils on top
function renderPower(ctx, w, h, v, stat, time) {
  const d = w * 0.40;
  // Squat wide base
  drawIsoBox(ctx, w * 1.1, h * 0.65,
    `rgba(245,158,11,0.25)`, `rgba(217,119,6,0.35)`, `rgba(251,191,36,0.55)`,
    v.base, 1.0);
  // Energy column up top
  ctx.save(); ctx.translate(0, -h * 0.65);
  drawIsoBox(ctx, w * 0.40, h * 0.35,
    `rgba(245,158,11,0.35)`, `rgba(217,119,6,0.45)`, `rgba(253,230,138,0.65)`,
    v.highlight, 0.9);
  ctx.restore();
  // Coil rings around the column
  const pulse = Math.abs(Math.sin(time * 2.5));
  for (let i = 0; i < 3; i++) {
    const ry = -h * 0.65 - h * 0.12 * i;
    ctx.strokeStyle = `rgba(16,185,129,${0.55 - i * 0.12})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, ry, w * 0.55, w * 0.18, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Energy orb
  const orbR = 2.5 + pulse * 2;
  const g = ctx.createRadialGradient(0, -h, 0, 0, -h, orbR * 4);
  g.addColorStop(0, `rgba(251,191,36,0.80)`); g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, -h, orbR * 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(0, -h, orbR, 0, Math.PI * 2); ctx.fill();
  drawWindows(ctx, w * 1.1, h * 0.65, stat, `rgb(253,230,138)`, time);
}

// 4. STORAGE BUNKER — heavy fortified box, reinforcement bands, security light
function renderBunker(ctx, w, h, v, stat, time) {
  const d = w * 0.40;
  // Very thick squat bunker
  drawIsoBox(ctx, w * 1.15, h * 0.80,
    `rgba(59,130,246,0.28)`, `rgba(37,99,235,0.40)`, `rgba(96,165,250,0.55)`,
    v.base, 1.1);
  // Fortified reinforcement bands (horizontal lines on left face)
  ctx.save();
  ctx.strokeStyle = v.highlight; ctx.lineWidth = 0.8;
  for (let i = 1; i <= 3; i++) {
    const fy = i / 4;
    const ly = d - h * 0.80 * fy;
    const lx0 = -w * 1.15 - fy * 0;
    const lx1 =  0;
    const slope = d / (w * 1.15);
    ctx.beginPath();
    ctx.moveTo(lx0, ly - lx0 * (-slope));
    ctx.lineTo(lx1, ly - lx1 * (-slope));
    ctx.stroke();
  }
  ctx.restore();
  // Domed top
  ctx.save(); ctx.translate(0, -h * 0.80);
  ctx.fillStyle = `rgba(59,130,246,0.45)`;
  ctx.strokeStyle = v.highlight; ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.75, w * 0.28, 0, Math.PI, 0);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  // Security light
  const secPulse = Math.abs(Math.sin(time * 1.8));
  ctx.save(); ctx.translate(0, -h * 0.80);
  ctx.fillStyle = `rgba(239,68,68,${0.45 + secPulse * 0.50})`;
  ctx.beginPath(); ctx.arc(0, -w * 0.15, 2.8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  drawWindows(ctx, w * 1.15, h * 0.80, stat, `rgb(191,219,254)`, time);
}

// 5. TRANSMISSION HUB — slim mast, parabolic dish, expanding signal rings
function renderTransmission(ctx, w, h, v, stat, time) {
  const d = w * 0.40;
  // Small base station
  drawIsoBox(ctx, w * 0.75, h * 0.35,
    `rgba(6,182,212,0.22)`, `rgba(8,145,178,0.32)`, `rgba(34,211,238,0.45)`,
    v.base, 0.9);
  // Mast
  ctx.save(); ctx.translate(0, -h * 0.35);
  ctx.strokeStyle = v.highlight; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -h * 0.65); ctx.stroke();
  // Support struts
  ctx.strokeStyle = `rgba(6,182,212,0.40)`; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(-w * 0.6, h * 0.05); ctx.lineTo(0, -h * 0.20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo( w * 0.6, h * 0.05); ctx.lineTo(0, -h * 0.20); ctx.stroke();
  // Parabolic dish
  ctx.fillStyle = `rgba(6,182,212,0.20)`;
  ctx.strokeStyle = v.base; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, -h * 0.55, w * 0.85, Math.PI * 0.75, Math.PI * 1.75);
  ctx.fill(); ctx.stroke();
  // Expanding signal rings
  const ringT = (time * 20) % (w * 2.0);
  for (let i = 0; i < 3; i++) {
    const rr = (ringT + i * 10) % (w * 2.0);
    const alpha = Math.max(0, 0.50 - rr / (w * 2.0));
    ctx.strokeStyle = `rgba(6,182,212,${alpha})`;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(0, -h * 0.65, rr, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();
  }
  ctx.restore();
}

// 6. RESEARCH LABS — geodesic dome on a platform
function renderLab(ctx, w, h, v, stat, time) {
  const d = w * 0.40;
  // Platform base
  drawIsoBox(ctx, w, h * 0.30,
    `rgba(16,185,129,0.20)`, `rgba(5,150,105,0.30)`, `rgba(52,211,153,0.45)`,
    v.base, 0.9);
  // Dome
  ctx.save(); ctx.translate(0, -h * 0.30);
  ctx.fillStyle = `rgba(16,185,129,0.18)`;
  ctx.strokeStyle = v.base; ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.arc(0, 0, w * 1.05, Math.PI, 0);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Geodesic wireframe lines
  ctx.strokeStyle = `rgba(52,211,153,0.35)`; ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(-w, 0); ctx.lineTo(0, -h * 0.70); ctx.lineTo(w, 0); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-w * 0.65, 0); ctx.lineTo(-w * 0.20, -h * 0.68); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo( w * 0.65, 0); ctx.lineTo( w * 0.20, -h * 0.68); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-w, 0); ctx.lineTo(w, 0); ctx.stroke();
  // Energy bubble
  const pulse = Math.sin(time * 1.6) * 0.5 + 0.5;
  ctx.strokeStyle = `rgba(16,185,129,${0.08 + pulse * 0.10})`;
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.arc(0, 0, w * 1.15 + pulse * 3, Math.PI, 0); ctx.stroke();
  // Apex
  ctx.strokeStyle = v.highlight; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -h * 0.70); ctx.lineTo(0, -h * 0.95); ctx.stroke();
  ctx.fillStyle = v.accent;
  ctx.beginPath(); ctx.arc(0, -h * 0.95, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// 7. HAZARD ZONE — standard iso building with corruption OVERLAYS
//    (no more random-walk zigzags — corruption is a visual effect ON TOP)
function renderHazard(ctx, w, h, v, stat, time) {
  const d   = w * 0.40;
  const glitch = Math.sin(time * 7.0) * 0.5 + 0.5;

  // Base building — same iso shape but red-tinted
  drawIsoBox(ctx, w, h,
    `rgba(244,63,94,0.28)`, `rgba(225,29,72,0.40)`, `rgba(251,113,133,0.50)`,
    v.base, 1.0);

  // Corruption glitch overlay: horizontal scan bars that slide up
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-w, 0); ctx.lineTo(0, d); ctx.lineTo(w, 0); ctx.lineTo(w, -h); ctx.lineTo(-w, -h);
  ctx.closePath(); ctx.clip();
  const scanY = -(h * ((time * 0.60) % 1));
  ctx.fillStyle = `rgba(244,63,94,${0.18 + glitch * 0.20})`;
  ctx.fillRect(-w * 1.5, scanY - 2, w * 3, 2.5);
  ctx.fillStyle = `rgba(251,191,36,${0.12 + glitch * 0.12})`;
  ctx.fillRect(-w * 1.5, scanY - 6, w * 3, 1.2);
  ctx.restore();

  // Warning border dashes
  ctx.save();
  ctx.strokeStyle = `rgba(244,63,94,${0.35 + glitch * 0.45})`;
  ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-w - 3, 2); ctx.lineTo(0, d + 4);
  ctx.lineTo(w + 3, 2); ctx.lineTo(w + 3, -h - 2);
  ctx.lineTo(-w - 3, -h - 2); ctx.closePath();
  ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();

  // Corruption static sparks (small, fixed positions from seed — NOT random-walk paths)
  const rng = seededRand((stat.loc || 7) * 13);
  ctx.fillStyle = `rgba(251,191,36,0.65)`;
  for (let i = 0; i < 4; i++) {
    const sx = (rng() - 0.5) * w * 1.5;
    const sy = -h * rng() * 0.85;
    const jx = Math.sin(time * 8 + i * 2.1) * 1.5;
    ctx.beginPath(); ctx.arc(sx + jx, sy, 1.8, 0, Math.PI * 2); ctx.fill();
  }

  drawWindows(ctx, w, h, stat, `rgb(253,164,175)`, time);
}

// 8. RUINS — broken, collapsed iso building (intentionally damaged geometry)
function renderRuins(ctx, w, h, v, stat, time) {
  const rng  = seededRand((stat.loc || 3) * 17);
  const d    = w * 0.40;
  const wallH = h * (0.35 + rng() * 0.40);

  // Collapsed left wall (cut off partway up)
  ctx.fillStyle   = `rgba(100,116,139,0.22)`;
  ctx.strokeStyle = v.base; ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-w, 0);
  ctx.lineTo(0, d);
  ctx.lineTo(0, d - wallH * (0.6 + rng() * 0.3));
  ctx.lineTo(-w, -wallH);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Right wall fragment (shorter — collapsed)
  ctx.fillStyle = `rgba(71,85,105,0.30)`;
  const rWallH = wallH * (0.4 + rng() * 0.4);
  ctx.beginPath();
  ctx.moveTo(0, d);
  ctx.lineTo(w * (0.5 + rng() * 0.4), d * (0.5 + rng() * 0.3));
  ctx.lineTo(w * (0.5 + rng() * 0.4), d * (0.5 + rng() * 0.3) - rWallH);
  ctx.lineTo(0, d - rWallH * 0.8);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Rubble pile at base (ellipse scatter)
  ctx.fillStyle = `rgba(100,116,139,0.35)`;
  for (let i = 0; i < 5; i++) {
    const rx = (rng() - 0.5) * w * 2.0;
    const ry = rng() * d * 0.4;
    const rr = 1.5 + rng() * 2.5;
    ctx.beginPath(); ctx.ellipse(rx, ry, rr, rr * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  }
}

// Seeded random — deterministic per building, no jitter across frames
function seededRand(seed) {
  let s = seed | 0;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

// ---------------------------------------------------------------------------
// Public class
// ---------------------------------------------------------------------------

export class ProceduralBuildingRenderer {
  constructor() { this.time = 0; }
  update(dt) { this.time += dt; }

  renderBuilding(ctx, node, stat, options = {}) {
    const { zoom = 1, isSelected = false, isHovered = false,
            isBlackout = false, isFlowTarget = false } = options;

    const biome = node.biome || 'core';
    const v     = BIOME_VISUAL[biome] || BIOME_VISUAL.core;
    const { w, h, rule } = getDims(stat);

    ctx.save();
    ctx.translate(node.x, node.y);

    // Blackout state
    if (isBlackout) {
      ctx.fillStyle = '#060912'; ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, w * 0.6, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.restore(); return;
    }

    // Ground glow halo
    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, w * 2.5);
    if (isSelected)      glow.addColorStop(0, 'rgba(56,189,248,0.35)');
    else if (isHovered)  glow.addColorStop(0, `${v.glow.replace('0.35','0.22')}`);
    else                 glow.addColorStop(0, v.ground);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(0, 0, w * 2.5, 0, Math.PI * 2); ctx.fill();

    // Selection / hover ring
    if (isSelected || isHovered) {
      ctx.strokeStyle = isSelected ? '#38bdf8' : v.highlight;
      ctx.lineWidth   = isSelected ? 2.0 : 1.2;
      ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.ellipse(0, 0, w * 1.8, w * 0.65, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Threat warning ring (cyclic / boss / high risk)
    if (stat.riskScore >= 75 || stat.isCyclic || stat.archetype === 'threat_boss') {
      const tPulse = Math.abs(Math.sin(this.time * 3.5));
      ctx.strokeStyle = `rgba(244,63,94,${0.35 + tPulse * 0.55})`;
      ctx.lineWidth   = stat.archetype === 'threat_boss' ? 2.2 : 1.3;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 2.0 + tPulse * 4, (w * 2.0 + tPulse * 4) * 0.50, 0, 0, Math.PI * 2);
      ctx.stroke(); ctx.setLineDash([]);
      // Hazard triangle above building
      ctx.fillStyle = '#f43f5e';
      const triY = -h - 12 - tPulse * 3;
      ctx.beginPath(); ctx.moveTo(0, triY - 7); ctx.lineTo(5, triY); ctx.lineTo(-5, triY); ctx.closePath(); ctx.fill();
    }

    // Skyward light beam for landmark buildings
    if (rule.lightBeam || isSelected) {
      const beamG = ctx.createLinearGradient(0, -h, 0, -h - 220);
      beamG.addColorStop(0, isSelected ? 'rgba(56,189,248,0.55)' : v.glow.replace('0.35','0.45'));
      beamG.addColorStop(0.7, 'rgba(56,189,248,0.06)');
      beamG.addColorStop(1, 'transparent');
      ctx.fillStyle = beamG;
      ctx.beginPath();
      ctx.moveTo(-2.5, -h); ctx.lineTo(2.5, -h);
      ctx.lineTo(9, -h - 220); ctx.lineTo(-9, -h - 220);
      ctx.closePath(); ctx.fill();
    }

    // Dispatch biome-specific renderer
    switch (biome) {
      case 'ui':           renderUI(ctx, w, h, v, stat, this.time);           break;
      case 'power':        renderPower(ctx, w, h, v, stat, this.time);        break;
      case 'bunker':       renderBunker(ctx, w, h, v, stat, this.time);       break;
      case 'transmission': renderTransmission(ctx, w, h, v, stat, this.time); break;
      case 'lab':          renderLab(ctx, w, h, v, stat, this.time);          break;
      case 'hazard':       renderHazard(ctx, w, h, v, stat, this.time);       break;
      case 'ruins':        renderRuins(ctx, w, h, v, stat, this.time);        break;
      default:             renderCore(ctx, w, h, v, stat, this.time);         break;
    }

    ctx.restore();
  }
}
