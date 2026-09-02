/**
 * SPRINT 0 - VISUAL LANGUAGE
 * Single source of truth for all visual constants in CODEBASE.UNIVERSE.
 * ZERO EMOJIS.
 */

export const BIOME_VISUAL = {
  core: { base:'#38bdf8',highlight:'#7dd3fc',emissive:'#0ea5e9',shadow:'rgba(14,165,233,0.12)',accent:'#fbbf24',windows:'#bae6fd',ground:'rgba(56,189,248,0.08)',glow:'rgba(56,189,248,0.35)',fogColor:'rgba(14,165,233,0.04)' },
  ui: { base:'#a855f7',highlight:'#c084fc',emissive:'#9333ea',shadow:'rgba(168,85,247,0.12)',accent:'#e879f9',windows:'#f0abfc',ground:'rgba(168,85,247,0.07)',glow:'rgba(168,85,247,0.30)',fogColor:'rgba(147,51,234,0.04)' },
  power: { base:'#f59e0b',highlight:'#fbbf24',emissive:'#d97706',shadow:'rgba(245,158,11,0.12)',accent:'#10b981',windows:'#fde68a',ground:'rgba(245,158,11,0.07)',glow:'rgba(245,158,11,0.30)',fogColor:'rgba(217,119,6,0.04)' },
  bunker: { base:'#3b82f6',highlight:'#60a5fa',emissive:'#2563eb',shadow:'rgba(59,130,246,0.12)',accent:'#ef4444',windows:'#bfdbfe',ground:'rgba(59,130,246,0.07)',glow:'rgba(59,130,246,0.30)',fogColor:'rgba(37,99,235,0.04)' },
  transmission: { base:'#06b6d4',highlight:'#22d3ee',emissive:'#0891b2',shadow:'rgba(6,182,212,0.12)',accent:'#a5f3fc',windows:'#cffafe',ground:'rgba(6,182,212,0.07)',glow:'rgba(6,182,212,0.30)',fogColor:'rgba(8,145,178,0.04)' },
  lab: { base:'#10b981',highlight:'#34d399',emissive:'#059669',shadow:'rgba(16,185,129,0.12)',accent:'#6ee7b7',windows:'#a7f3d0',ground:'rgba(16,185,129,0.07)',glow:'rgba(16,185,129,0.30)',fogColor:'rgba(5,150,105,0.04)' },
  hazard: { base:'#f43f5e',highlight:'#fb7185',emissive:'#e11d48',shadow:'rgba(244,63,94,0.15)',accent:'#fbbf24',windows:'#fda4af',ground:'rgba(244,63,94,0.10)',glow:'rgba(244,63,94,0.40)',fogColor:'rgba(225,29,72,0.06)' },
  ruins: { base:'#64748b',highlight:'#94a3b8',emissive:'#475569',shadow:'rgba(100,116,139,0.08)',accent:'#475569',windows:'#cbd5e1',ground:'rgba(100,116,139,0.04)',glow:'rgba(100,116,139,0.15)',fogColor:'rgba(71,85,105,0.06)' },
};

export const SCALE_RULES = {
  mythic:    { baseMin:22,baseMax:36,heightMin:70, heightMax:120,lightBeam:true, rings:3 },
  legendary: { baseMin:14,baseMax:22,heightMin:42, heightMax:72, lightBeam:true, rings:2 },
  epic:      { baseMin:9, baseMax:14,heightMin:24, heightMax:42, lightBeam:false,rings:1 },
  rare:      { baseMin:6, baseMax:10,heightMin:14, heightMax:24, lightBeam:false,rings:0 },
  common:    { baseMin:3, baseMax:7, heightMin:6,  heightMax:14, lightBeam:false,rings:0 },
};

export const DEPTH_LAYERS = {
  nebula:    { parallax:0.02, alpha:0.25 },
  starsFar:  { parallax:0.04, alpha:0.50 },
  starsNear: { parallax:0.10, alpha:0.80 },
  gridHolo:  { parallax:1.00, alpha:0.15 },
  city:      { parallax:1.00, alpha:1.00 },
};

export const WORLD_LAYOUT = {
  core:         { x:    0, y:    0, baseRadius:130, scale:1.00 },
  ui:           { x:  620, y: -340, baseRadius:180, scale:1.40 },
  power:        { x: -560, y: -300, baseRadius:160, scale:1.20 },
  bunker:       { x: -500, y:  380, baseRadius:150, scale:1.15 },
  transmission: { x:  560, y:  360, baseRadius:150, scale:1.15 },
  lab:          { x:   80, y: -580, baseRadius:110, scale:0.85 },
  hazard:       { x:  760, y: -500, baseRadius:100, scale:0.80 },
  ruins:        { x: -680, y:  520, baseRadius: 90, scale:0.70 },
};
