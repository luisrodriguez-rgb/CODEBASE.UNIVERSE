/**
 * Core Type Definitions and Data Contracts for CODEBASE MEMORY
 */

/**
 * @typedef {'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'} RarityTier
 * @typedef {'core' | 'ui' | 'power' | 'bunker' | 'network' | 'lab' | 'hazard' | 'ruins'} BiomeSector
 * @typedef {'function' | 'module' | 'class' | 'interface' | 'variable' | 'folder' | 'project'} EntityType
 * @typedef {'discovered' | 'understood' | 'mastered'} KnowledgeLevel
 */

export const BIOME_CONFIG = {
  core: { name: 'Core Citadel', color: '#38bdf8', desc: 'Central orchestrators & execution pipelines' },
  ui: { name: 'Metropolis Grid', color: '#a855f7', desc: 'Presentation, views, templates & themes' },
  power: { name: 'Power Grid', color: '#f59e0b', desc: 'State management, store slices & event buses' },
  bunker: { name: 'Subterranean Bunker', color: '#3b82f6', desc: 'Persistence, database, storage & caching' },
  network: { name: 'Transmission Hub', color: '#06b6d4', desc: 'APIs, routers, web sockets & protocols' },
  transmission: { name: 'Transmission Hub', color: '#06b6d4', desc: 'APIs, routers, web sockets & protocols' },
  lab: { name: 'Research Labs', color: '#10b981', desc: 'Test suites, mocks, assertions & benchmarks' },
  hazard: { name: 'Hazard Sector', color: '#f43f5e', desc: 'High-risk modules, anomalies & circular paths' },
  ruins: { name: 'Forgotten Ruins', color: '#64748b', desc: 'Dead code, deprecated modules & leaf utilities' }
};

export const RARITY_CONFIG = {
  common: { name: 'Common', color: '#94a3b8', minPct: 0, maxPct: 40, weight: 1 },
  uncommon: { name: 'Uncommon', color: '#10b981', minPct: 40, maxPct: 60, weight: 2 },
  rare: { name: 'Rare', color: '#0284c7', minPct: 60, maxPct: 75, weight: 3 },
  epic: { name: 'Epic', color: '#a855f7', minPct: 75, maxPct: 90, weight: 4 },
  legendary: { name: 'Legendary', color: '#f59e0b', minPct: 90, maxPct: 97, weight: 5 },
  mythic: { name: 'Mythic', color: '#f43f5e', minPct: 97, maxPct: 100, weight: 6 }
};
