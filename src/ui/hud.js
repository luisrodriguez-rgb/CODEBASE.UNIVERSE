/**
 * Main HUD & Telemetry Coordinator.
 */

export class HudController {
  constructor(state, graph, analysis, world, views) {
    this.state = state;
    this.graph = graph;
    this.analysis = analysis;
    this.world = world;
    this.views = views;

    // Top Telemetry Stats
    this.projectName = document.getElementById('current-project-name');
    this.healthTag = document.getElementById('system-health-tag');
    this.statEntities = document.getElementById('stat-entities');
    this.statEdges = document.getElementById('stat-edges');
    this.statRisk = document.getElementById('stat-risk');
    this.statKnowledge = document.getElementById('stat-knowledge');
    this.playerRank = document.getElementById('player-rank');
    this.playerXp = document.getElementById('player-xp');

    // Controls
    this.searchInput = document.getElementById('node-search-input');
    this.searchClearBtn = document.getElementById('search-clear-btn');
    this.filterPills = document.querySelectorAll('.filter-pills .pill');
    this.zoomBadge = document.getElementById('semantic-zoom-level');
    this.zoomInBtn = document.getElementById('zoom-in-btn');
    this.zoomOutBtn = document.getElementById('zoom-out-btn');
    this.zoomResetBtn = document.getElementById('zoom-reset-btn');

    // Dock Tabs
    this.dockWorldBtn = document.getElementById('nav-world-btn');
    this.dockCodedexBtn = document.getElementById('nav-codedex-btn');
    this.dockQuestsBtn = document.getElementById('nav-quests-btn');
    this.dockThreatsBtn = document.getElementById('nav-threats-btn');
    this.dockWhatIfBtn = document.getElementById('nav-whatif-btn');
    this.dockTimelineBtn = document.getElementById('nav-timeline-btn');

    this.codedexBadge = document.getElementById('codedex-badge');
    this.activeQuestsBadge = document.getElementById('active-quests-badge');
    this.threatCountBadge = document.getElementById('threat-count-badge');

    this.modalBackdrop = document.getElementById('modal-backdrop');
    this.switchRepoBtn = document.getElementById('switch-project-btn');
    this.manualBtn = document.getElementById('help-guide-btn');

    this.initEvents();
  }

  initEvents() {
    // Search
    this.searchInput.addEventListener('input', (e) => {
      this.state.setSearchQuery(e.target.value);
    });

    this.searchClearBtn.addEventListener('click', () => {
      this.searchInput.value = '';
      this.state.setSearchQuery('');
    });

    // Filter Pills
    this.filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.state.setFilter(pill.getAttribute('data-filter') || 'all');
      });
    });

    // Camera Zoom Controls
    this.zoomInBtn.addEventListener('click', () => {
      this.world.camera.targetZoom = Math.min(this.world.camera.maxZoom, this.world.camera.zoom * 1.3);
    });

    this.zoomOutBtn.addEventListener('click', () => {
      this.world.camera.targetZoom = Math.max(this.world.camera.minZoom, this.world.camera.zoom * 0.7);
    });

    this.zoomResetBtn.addEventListener('click', () => {
      this.world.camera.reset();
    });

    // Dock Navigation
    this.dockWorldBtn.addEventListener('click', () => {
      this.closeAllModals();
      this.setActiveDockTab(this.dockWorldBtn);
    });

    this.dockCodedexBtn.addEventListener('click', () => {
      this.closeAllModals();
      this.setActiveDockTab(this.dockCodedexBtn);
      this.views.codedex.open();
    });

    this.dockQuestsBtn.addEventListener('click', () => {
      this.closeAllModals();
      this.setActiveDockTab(this.dockQuestsBtn);
      this.views.quests.open();
    });

    this.dockThreatsBtn.addEventListener('click', () => {
      this.closeAllModals();
      this.setActiveDockTab(this.dockThreatsBtn);
      this.views.threats.open();
    });

    this.dockWhatIfBtn.addEventListener('click', () => {
      this.closeAllModals();
      this.setActiveDockTab(this.dockWhatIfBtn);
      this.views.whatif.open();
    });

    this.dockTimelineBtn.addEventListener('click', () => {
      this.closeAllModals();
      this.setActiveDockTab(this.dockTimelineBtn);
      this.views.timeline.open();
    });

    // Close buttons & backdrop
    this.modalBackdrop.addEventListener('click', () => {
      this.closeAllModals();
      this.setActiveDockTab(this.dockWorldBtn);
    });

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeAllModals();
        this.setActiveDockTab(this.dockWorldBtn);
      });
    });

    this.switchRepoBtn.addEventListener('click', () => {
      document.getElementById('title-screen').classList.remove('hidden');
    });

    this.manualBtn.addEventListener('click', () => {
      alert(`CODEBASE MEMORY MANUAL:\n\n1. Left-click to inspect entity & reveal connections.\n2. Mouse drag to pan; Wheel to semantic zoom.\n3. Complete Quests to earn XP and level up your Architect rank.\n4. Explore CodeDex to collect rare and legendary entities.\n5. Use Threat Arena to simulate refactorings.\n6. Use What-If Lab to test failure impact and blast radius.`);
    });

    this.state.subscribe(() => this.updateTelemetry());
  }

  setActiveDockTab(tabEl) {
    document.querySelectorAll('.dock-tab').forEach(t => t.classList.remove('active'));
    tabEl.classList.add('active');
  }

  closeAllModals() {
    this.views.codedex.close();
    this.views.quests.close();
    this.views.threats.close();
    this.views.whatif.close();
    this.views.timeline.close();
  }

  updateTelemetry() {
    const kMetrics = this.state.knowledgeTracker.calculateKnowledgeMetrics(this.graph);
    const metrics = this.analysis.systemMetrics;

    this.statEntities.textContent = String(metrics.totalEntities);
    this.statEdges.textContent = String(metrics.totalEdges);
    this.statRisk.textContent = `${metrics.avgRisk}%`;
    this.statRisk.className = `metric-value ${metrics.avgRisk > 60 ? 'risk-high' : metrics.avgRisk > 35 ? 'risk-medium' : 'risk-low'}`;

    this.healthTag.textContent = metrics.healthStatus;
    this.healthTag.className = `status-tag status-${metrics.healthStatus.toLowerCase()}`;

    this.statKnowledge.textContent = `${kMetrics.overallKnowledgePct}%`;
    this.playerXp.textContent = `${this.state.xp.toLocaleString()} XP`;
    this.playerRank.textContent = this.state.knowledgeTracker.getRank(this.state.xp);

    this.codedexBadge.textContent = `${kMetrics.discoveredPct}%`;
    const pendingQuests = this.state.activeQuests.filter(q => !q.completed).length;
    this.activeQuestsBadge.textContent = `${pendingQuests} ACTIVE`;
    this.threatCountBadge.textContent = `${metrics.threatCount} DETECTED`;

    // Semantic zoom badge
    this.zoomBadge.textContent = this.world.camera.getSemanticZoomTier().label;
  }
}
