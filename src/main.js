/**
 * CODEBASE.UNIVERSE - Main Application Bootstrap.
 * Connects Analysis Engine, Game Simulation, 2D/2.5D Canvas, Web Audio, i18n, and Cyber Decks.
 */

import { buildSketionGraph } from './data/sketionDataset.js';
import { buildRouterGraph } from './data/routerDataset.js';
import { analyzeArchitecture } from './analysis/risk.js';
import { generateProjectQuests } from './game/questGenerator.js';
import { globalState } from './game/gameState.js';
import { GraphWorld } from './world/graphWorld.js';

import { ManualModal } from './ui/manualModal.js';
import { InspectorController } from './ui/inspector.js';
import { CodeDexViewController } from './ui/codedexView.js';
import { QuestViewController } from './ui/questView.js';
import { ThreatViewController } from './ui/threatView.js';
import { WhatIfViewController } from './ui/whatIfView.js';
import { TimelineViewController } from './ui/timelineView.js';
import { HudController } from './ui/hud.js';
import { TitleScreenController } from './ui/titleScreen.js';

class CodebaseUniverseApp {
  constructor() {
    this.canvas = document.getElementById('world-canvas');
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.world = null;
    this.manualModal = null;
    this.views = {};
    this.hud = null;

    this.init();
  }

  init() {
    this.manualModal = new ManualModal();

    this.titleScreen = new TitleScreenController(
      () => {
        const sel = document.getElementById('project-select-dropdown');
        const projectKey = sel?.value || 'sketion';
        this.loadProject(projectKey);
      },
      (projectKey, customGraph) => {
        this.loadProject(projectKey, customGraph);
      }
    );

    // Initial default project load behind splash
    this.loadProject('sketion');
  }

  loadProject(projectKey, customGraph = null) {
    if (this.world) {
      this.world.stop();
    }

    let graph;
    let projectName = 'SKETION ENGINE';

    if (projectKey === 'router') {
      graph = buildRouterGraph();
      projectName = 'NEO-API ROUTER & GATEWAY';
    } else if (projectKey === 'custom_raw' && customGraph) {
      graph = customGraph;
      projectName = 'CUSTOM REPOSITORY';
    } else {
      graph = buildSketionGraph();
      projectName = 'SKETION ENGINE';
    }

    const projNameEl = document.getElementById('current-project-name');
    if (projNameEl) projNameEl.textContent = projectName;

    // 1. Run Comprehensive Architectural Analysis
    const analysis = analyzeArchitecture(graph);

    // 2. Procedurally Generate Quests & Initialize State
    const quests = generateProjectQuests(graph, analysis);
    globalState.setGraph(graph, analysis, quests);
    globalState.currentProject = projectKey;

    // Pre-discover key central landmarks
    for (const [id, stat] of analysis.nodeStats.entries()) {
      if (stat.rarityScore >= 95) {
        globalState.knowledgeTracker.markDiscovered(id);
      }
    }

    // 3. Initialize World Canvas
    this.world = new GraphWorld(this.canvas, this.minimapCanvas, graph, analysis, globalState);
    this.world.start();

    // 4. Initialize Views
    this.views.inspector = new InspectorController(globalState, this.world.camera);
    this.views.codedex = new CodeDexViewController(globalState, this.world.camera);
    this.views.quests = new QuestViewController(globalState, this.world.camera);
    this.views.threats = new ThreatViewController(globalState, this.world.camera);
    this.views.whatif = new WhatIfViewController(globalState, this.world.camera, this.world.effects);
    this.views.timeline = new TimelineViewController(globalState, this.world);

    // 5. Initialize HUD Coordinator
    this.hud = new HudController(globalState, this.manualModal);

    // Connect Camera Zoom Buttons
    document.getElementById('zoom-in-btn')?.addEventListener('click', () => {
      this.world.camera.targetZoom = Math.min(12.0, this.world.camera.targetZoom * 1.35);
    });
    document.getElementById('zoom-out-btn')?.addEventListener('click', () => {
      this.world.camera.targetZoom = Math.max(0.05, this.world.camera.targetZoom * 0.75);
    });
    document.getElementById('zoom-reset-btn')?.addEventListener('click', () => {
      this.world.camera.reset();
    });
  }
}

// Start app on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window.app = new CodebaseUniverseApp();
});
