/**
 * Telemetry Bar, Filter Deck, Action Dock & Audio/i18n Coordinator for CODEBASE.UNIVERSE.
 */

import { sfx } from '../audio/soundFX.js';
import { i18n } from '../i18n/translations.js';

export class HudController {
  constructor(state, manualModal) {
    this.state = state;
    this.manualModal = manualModal;

    this.initElements();
    this.initEvents();
    this.subscribeState();
    this.updateI18nLabels();
  }

  initElements() {
    this.langToggleBtn = document.getElementById('lang-toggle-btn');
    this.soundToggleBtn = document.getElementById('sound-toggle-btn');

    this.searchInput = document.getElementById('node-search-input');
    this.clearSearchBtn = document.getElementById('search-clear-btn');
    this.filterPills = document.querySelectorAll('.filter-pills .pill');
    
    this.zoomLevelBadge = document.getElementById('semantic-zoom-level');
    this.zoomInBtn = document.getElementById('zoom-in-btn');
    this.zoomOutBtn = document.getElementById('zoom-out-btn');
    this.zoomResetBtn = document.getElementById('zoom-reset-btn');

    this.dockTabs = document.querySelectorAll('.dock-tab');
    this.helpGuideBtn = document.getElementById('help-guide-btn');
    this.switchProjectBtn = document.getElementById('switch-project-btn');

    // Telemetry labels
    this.statEntities = document.getElementById('stat-entities');
    this.statEdges = document.getElementById('stat-edges');
    this.statRisk = document.getElementById('stat-risk');
    this.statKnowledge = document.getElementById('stat-knowledge');
    this.playerRank = document.getElementById('player-rank');
    this.playerXp = document.getElementById('player-xp');

    this.activeQuestsBadge = document.getElementById('active-quests-badge');
    this.threatCountBadge = document.getElementById('threat-count-badge');
    this.codedexBadge = document.getElementById('codedex-badge');
  }

  initEvents() {
    // Language Toggle
    this.langToggleBtn?.addEventListener('click', () => {
      sfx.playClick();
      i18n.toggleLanguage();
      this.updateI18nLabels();
    });

    // Sound Toggle
    this.soundToggleBtn?.addEventListener('click', () => {
      const isMuted = sfx.toggleMute();
      if (!isMuted) sfx.playClick();
      this.soundToggleBtn.textContent = isMuted ? 'SFX: OFF' : 'SFX: ON';
    });

    // Search Input
    this.searchInput?.addEventListener('input', (e) => {
      this.state.setSearchQuery(e.target.value);
    });

    this.clearSearchBtn?.addEventListener('click', () => {
      sfx.playClick();
      if (this.searchInput) this.searchInput.value = '';
      this.state.setSearchQuery('');
    });

    // Filter Pills
    this.filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        sfx.playClick();
        this.filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.getAttribute('data-filter') || 'all';
        this.state.setActiveFilter(filter);
      });
    });

    // Bottom Navigation Dock Tabs
    this.dockTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        sfx.playClick();
        const tabId = tab.id;
        this.handleDockTabClick(tabId);
      });
    });

    // Manual Modal Trigger
    this.helpGuideBtn?.addEventListener('click', () => {
      sfx.playClick();
      if (this.manualModal) {
        this.manualModal.open();
      }
    });

    // Switch Project Trigger
    this.switchProjectBtn?.addEventListener('click', () => {
      sfx.playClick();
      const splash = document.getElementById('title-screen');
      if (splash) splash.classList.remove('hidden');
    });

    // Modal Close buttons
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.playClick();
        const modalId = btn.getAttribute('data-close');
        const targetModal = document.getElementById(modalId);
        if (targetModal) targetModal.classList.add('hidden');
        document.getElementById('modal-backdrop')?.classList.add('hidden');
      });
    });

    // Backdrop Click
    document.getElementById('modal-backdrop')?.addEventListener('click', () => {
      sfx.playClick();
      document.querySelectorAll('.deck-modal').forEach(m => m.classList.add('hidden'));
      document.getElementById('modal-backdrop')?.classList.add('hidden');
    });

    i18n.subscribe(() => {
      this.updateI18nLabels();
    });
  }

  handleDockTabClick(tabId) {
    this.dockTabs.forEach(t => t.classList.remove('active'));
    document.getElementById(tabId)?.classList.add('active');

    // Hide all modal decks
    document.querySelectorAll('.deck-modal').forEach(m => m.classList.add('hidden'));
    const backdrop = document.getElementById('modal-backdrop');

    if (tabId === 'nav-world-btn') {
      backdrop?.classList.add('hidden');
    } else if (tabId === 'nav-codedex-btn') {
      document.getElementById('codedex-modal')?.classList.remove('hidden');
      backdrop?.classList.remove('hidden');
    } else if (tabId === 'nav-quests-btn') {
      document.getElementById('quests-modal')?.classList.remove('hidden');
      backdrop?.classList.remove('hidden');
    } else if (tabId === 'nav-threats-btn') {
      document.getElementById('threats-modal')?.classList.remove('hidden');
      backdrop?.classList.remove('hidden');
    } else if (tabId === 'nav-whatif-btn') {
      document.getElementById('whatif-modal')?.classList.remove('hidden');
      backdrop?.classList.remove('hidden');
    } else if (tabId === 'nav-timeline-btn') {
      const drawer = document.getElementById('timeline-drawer');
      drawer?.classList.toggle('hidden');
    }
  }

  subscribeState() {
    this.state.subscribe((event, data) => {
      if (event === 'graph_loaded' || event === 'knowledge_updated' || event === 'quest_completed' || event === 'threat_refactored') {
        this.updateTelemetryMetrics();
      }
    });
  }

  updateTelemetryMetrics() {
    const analysis = this.state.analysis;
    const graph = this.state.graph;
    if (!analysis || !graph) return;

    const totalNodes = analysis.totalNodes || graph.nodes.size || 568;
    const totalEdges = analysis.totalEdges || graph.edges.length || 1520;
    const overallRisk = analysis.overallRiskScore || analysis.systemMetrics?.avgRisk || 38;

    if (this.statEntities) this.statEntities.textContent = totalNodes.toLocaleString();
    if (this.statEdges) this.statEdges.textContent = totalEdges.toLocaleString();
    if (this.statRisk) {
      this.statRisk.textContent = `${overallRisk}%`;
      this.statRisk.className = `metric-value ${overallRisk > 60 ? 'risk-high' : 'risk-medium'}`;
    }

    const knowledgePct = this.state.knowledgeTracker?.getCompletionPercentage() || 0;
    if (this.statKnowledge) this.statKnowledge.textContent = `${knowledgePct}%`;
    if (this.codedexBadge) this.codedexBadge.textContent = `${knowledgePct}%`;

    const xp = this.state.knowledgeTracker?.totalXP || 1450;
    const rank = this.state.knowledgeTracker?.getRankTitle() || 'INTERN APPRENTICE (LVL 01)';
    if (this.playerRank) this.playerRank.textContent = rank;
    if (this.playerXp) this.playerXp.textContent = `${xp.toLocaleString()} XP`;

    const activeQuests = this.state.quests?.filter(q => !q.completed).length || 0;
    if (this.activeQuestsBadge) {
      this.activeQuestsBadge.textContent = `${activeQuests} ${i18n.t('active_badge')}`;
    }

    const threatCount = analysis.threats?.length || 0;
    if (this.threatCountBadge) {
      this.threatCountBadge.textContent = `${threatCount} ${i18n.t('detected_badge')}`;
    }
  }

  updateI18nLabels() {
    if (this.langToggleBtn) {
      this.langToggleBtn.textContent = i18n.currentLang === 'es' ? 'ES / EN' : 'EN / ES';
    }

    // Top Header
    const brandHeader = document.getElementById('brand-header-title');
    if (brandHeader) brandHeader.textContent = i18n.t('brand_title');

    const projectTag = document.getElementById('label-project-tag');
    if (projectTag) projectTag.textContent = i18n.t('project_label');

    const lblEntities = document.getElementById('lbl-entities');
    if (lblEntities) lblEntities.textContent = i18n.t('stat_entities');

    const lblEdges = document.getElementById('lbl-edges');
    if (lblEdges) lblEdges.textContent = i18n.t('stat_edges');

    const lblRisk = document.getElementById('lbl-risk');
    if (lblRisk) lblRisk.textContent = i18n.t('stat_risk');

    const lblKnowledge = document.getElementById('lbl-knowledge');
    if (lblKnowledge) lblKnowledge.textContent = i18n.t('stat_knowledge');

    const lblRank = document.getElementById('lbl-rank');
    if (lblRank) lblRank.textContent = i18n.t('stat_rank');

    // Search Box & Filters
    if (this.searchInput) this.searchInput.placeholder = i18n.t('search_placeholder');

    const pillAll = document.getElementById('filter-pill-all');
    if (pillAll) pillAll.textContent = i18n.t('filter_all');

    const pillMod = document.getElementById('filter-pill-modules');
    if (pillMod) pillMod.textContent = i18n.t('filter_modules');

    const pillFunc = document.getElementById('filter-pill-functions');
    if (pillFunc) pillFunc.textContent = i18n.t('filter_functions');

    const pillHot = document.getElementById('filter-pill-hotspots');
    if (pillHot) pillHot.textContent = i18n.t('filter_hotspots');

    const pillCyc = document.getElementById('filter-pill-cycles');
    if (pillCyc) pillCyc.textContent = i18n.t('filter_cycles');

    const pillThreat = document.getElementById('filter-pill-threats');
    if (pillThreat) pillThreat.textContent = i18n.t('filter_threats');

    const pillUnused = document.getElementById('filter-pill-unused');
    if (pillUnused) pillUnused.textContent = i18n.t('filter_unused');

    // Minimap & Reset
    const minimapLbl = document.getElementById('minimap-label-text');
    if (minimapLbl) minimapLbl.textContent = i18n.t('radar_title');

    const zoomReset = document.getElementById('zoom-reset-btn');
    if (zoomReset) zoomReset.textContent = i18n.t('cam_reset');

    // Dock text
    const dockWorld = document.getElementById('dock-text-world');
    if (dockWorld) dockWorld.textContent = i18n.t('dock_world');

    const dockCodedex = document.getElementById('dock-text-codedex');
    if (dockCodedex) dockCodedex.textContent = i18n.t('dock_codedex');

    const dockQuests = document.getElementById('dock-text-quests');
    if (dockQuests) dockQuests.textContent = i18n.t('dock_quests');

    const dockThreats = document.getElementById('dock-text-threats');
    if (dockThreats) dockThreats.textContent = i18n.t('dock_threats');

    const dockWhatif = document.getElementById('dock-text-whatif');
    if (dockWhatif) dockWhatif.textContent = i18n.t('dock_whatif');

    const dockTimeline = document.getElementById('dock-text-timeline');
    if (dockTimeline) dockTimeline.textContent = i18n.t('dock_timeline');

    if (this.switchProjectBtn) this.switchProjectBtn.textContent = i18n.t('dock_switch_repo');
    if (this.helpGuideBtn) this.helpGuideBtn.textContent = i18n.t('dock_manual');

    this.updateTelemetryMetrics();
  }
}
