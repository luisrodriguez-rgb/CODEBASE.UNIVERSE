/**
 * CODEBASE MEMORY - Main Application Bootstrap.
 * Connects Analysis Engine, Game Simulation, 2D/2.5D Canvas, and Cyber-HUD Decks.
 */

import { buildSketionGraph } from './data/sketionDataset.js';
import { buildRouterGraph } from './data/routerDataset.js';
import { analyzeArchitecture } from './analysis/risk.js';
import { generateProjectQuests } from './game/questGenerator.js';
import { globalState } from './game/gameState.js';
import { GraphWorld } from './world/graphWorld.js';

import { InspectorUI } from './ui/inspector.js';
import { CodeDexView } from './ui/codedexView.js';
import { QuestView } from './ui/questView.js';
import { ThreatView } from './ui/threatView.js';
import { WhatIfView } from './ui/whatIfView.js';
import { TimelineView } from './ui/timelineView.js';
import { HudController } from './ui/hud.js';
import { TitleScreen } from './ui/titleScreen.js';

class CodebaseMemoryApp {
  constructor() {
    this.canvas = document.getElementById('world-canvas');
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.world = null;
    this.views = {};
    this.hud = null;

    this.init();
  }

  init() {
    this.titleScreen = new TitleScreen((projectKey, customGraph) => {
      this.loadProject(projectKey, customGraph);
    });
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
    } else if (projectKey === 'custom' && customGraph) {
      graph = customGraph;
      projectName = 'CUSTOM REPOSITORY';
    } else {
      graph = buildSketionGraph();
      projectName = 'SKETION ENGINE';
    }

    document.getElementById('current-project-name').textContent = projectName;

    // 1. Run Comprehensive Architectural Analysis
    const analysis = analyzeArchitecture(graph);

    // 2. Procedurally Generate Quests & Initialize State
    globalState.activeQuests = generateProjectQuests(graph, analysis);
    globalState.currentProject = projectKey;
    globalState.selectedNodeId = null;

    // Pre-discover top central hubs
    for (const [id, stat] of analysis.nodeStats.entries()) {
      if (stat.rarityScore >= 95) {
        globalState.unlockedCodeDex.add(id);
        globalState.knowledgeTracker.markDiscovered(id);
      }
    }

    // 3. Initialize World Canvas
    this.world = new GraphWorld(this.canvas, this.minimapCanvas, graph, analysis, globalState);
    this.world.start();

    // 4. Initialize Views
    this.views.inspector = new InspectorUI(globalState, graph, analysis, this.world);
    this.views.codedex = new CodeDexView(globalState, graph, analysis, this.world);
    this.views.quests = new QuestView(globalState, graph, analysis, this.world);
    this.views.threats = new ThreatView(globalState, graph, analysis, this.world);
    this.views.whatif = new WhatIfView(globalState, graph, analysis, this.world);
    this.views.timeline = new TimelineView(globalState, graph, this.world);

    // 5. Initialize HUD Coordinator
    this.hud = new HudController(globalState, graph, analysis, this.world, this.views);
    this.hud.updateTelemetry();
  }
}

// Start app on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window.app = new CodebaseMemoryApp();
});
