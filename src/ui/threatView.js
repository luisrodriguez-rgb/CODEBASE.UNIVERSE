/**
 * Threat Arena & Refactor Strategy Simulator Controller for CODEBASE.UNIVERSE.
 */

import { simulateRefactoring } from '../simulation/refactorSimulation.js';
import { sfx } from '../audio/soundFX.js';
import { i18n } from '../i18n/translations.js';

export class ThreatViewController {
  constructor(state, camera) {
    this.state = state;
    this.camera = camera;

    this.container = document.getElementById('threats-modal');
    this.sidebarList = document.getElementById('threats-sidebar-list');
    this.dossierContainer = document.getElementById('active-threat-dossier');

    this.activeThreatIndex = 0;
    this.activeStrategy = 'break_cycle';

    this.initEvents();
    this.subscribeState();
    this.updateI18n();
  }

  initEvents() {
    i18n.subscribe(() => {
      this.updateI18n();
      this.renderSidebar();
      this.renderDossier();
    });
  }

  subscribeState() {
    this.state.subscribe((event, data) => {
      if (event === 'graph_loaded' || event === 'threat_refactored') {
        this.renderSidebar();
        this.renderDossier();
      }
    });
  }

  renderSidebar() {
    if (!this.sidebarList || !this.state.analysis) return;
    const threats = this.state.analysis.threats || [];

    this.sidebarList.innerHTML = threats.map((th, idx) => {
      const node = this.state.graph.getNode(th.id);
      return `
        <li class="threat-list-item ${idx === this.activeThreatIndex ? 'active' : ''}" data-threat-index="${idx}">
          <div class="threat-item-name">${th.titleAlias}</div>
          <div class="threat-item-meta">
            <span>${node?.name || th.id}</span>
            <span style="color:var(--accent-rose);font-weight:700;">${th.riskScore}% RISK</span>
          </div>
        </li>
      `;
    }).join('');

    this.sidebarList.querySelectorAll('.threat-list-item').forEach(item => {
      item.addEventListener('click', () => {
        sfx.playClick();
        this.activeThreatIndex = parseInt(item.getAttribute('data-threat-index'), 10);
        this.renderSidebar();
        this.renderDossier();
      });
    });
  }

  renderDossier() {
    if (!this.dossierContainer || !this.state.analysis) return;
    const threats = this.state.analysis.threats || [];
    const threat = threats[this.activeThreatIndex];
    if (!threat) return;

    const node = this.state.graph.getNode(threat.id);
    const stat = this.state.analysis.nodeStats.get(threat.id);
    const isEs = i18n.currentLang === 'es';

    // Simulate current active strategy
    const simResult = simulateRefactoring(this.state.graph, this.state.analysis, threat.id, this.activeStrategy);

    this.dossierContainer.innerHTML = `
      <div class="threat-dossier-card">
        <div class="threat-header-row">
          <div>
            <div class="threat-title-alias">☠ ${threat.titleAlias}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${node?.path || threat.id}</div>
          </div>
          <button id="locate-threat-btn" class="quest-track-btn" style="background:var(--accent-rose);color:#fff;">
            ${i18n.t('threat_locate')}
          </button>
        </div>

        <div class="threat-metrics-row">
          <div class="stat-box">
            <span class="stat-lbl">${i18n.t('stat_risk')}</span>
            <span class="stat-val risk-high">${threat.riskScore}%</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">${i18n.t('inspect_centrality')}</span>
            <span class="stat-val">${stat?.centralityPct || 90}%</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">${i18n.t('inspect_dependents')}</span>
            <span class="stat-val">${stat?.fanIn || 0}</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">ANOMALIES</span>
            <span class="stat-val" style="color:var(--accent-amber)">${stat?.isCyclic ? (isEs ? 'CICLO DETECTADO' : 'CYCLIC SCC') : 'NONE'}</span>
          </div>
        </div>

        <div class="diagnosis-box">
          <strong>${i18n.t('threat_why')}:</strong><br>
          ${isEs
            ? `Este módulo actúa como un cuello de botella monolítico. ${stat?.fanIn} subsistemas dependen directamente de su estructura y concentra una masa crítica de dependencias.`
            : `This module acts as a monolithic bottleneck. ${stat?.fanIn} subsystems directly depend on its concrete implementation, creating critical architectural drag.`}
        </div>

        <div class="refactor-strategies-box">
          <h4 style="font-size:11px;letter-spacing:0.08em;color:var(--text-muted)">${i18n.t('threat_simulate_heading')}</h4>
          <div class="strategy-options">
            <button class="strategy-btn ${this.activeStrategy === 'break_cycle' ? 'active' : ''}" data-strategy="break_cycle">${i18n.t('strat_break_cycle')}</button>
            <button class="strategy-btn ${this.activeStrategy === 'split_module' ? 'active' : ''}" data-strategy="split_module">${i18n.t('strat_split_module')}</button>
            <button class="strategy-btn ${this.activeStrategy === 'introduce_interface' ? 'active' : ''}" data-strategy="introduce_interface">${i18n.t('strat_introduce_interface')}</button>
            <button class="strategy-btn ${this.activeStrategy === 'isolate' ? 'active' : ''}" data-strategy="isolate">${i18n.t('strat_isolate')}</button>
          </div>

          <div class="refactor-comparison-grid">
            <div>
              <div style="font-size:10px;color:var(--text-muted);margin-bottom:6px;">${i18n.t('before_sim')}</div>
              <div style="font-size:12px;color:#f87171;">${i18n.t('stat_risk')}: <strong>${threat.riskScore}%</strong></div>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">${i18n.t('stat_blast_radius')}: <strong>${simResult.baselineBlastRadius}%</strong></div>
            </div>
            <div>
              <div style="font-size:10px;color:var(--accent-emerald);margin-bottom:6px;">${i18n.t('after_sim')}</div>
              <div style="font-size:12px;color:var(--accent-emerald);">${i18n.t('stat_risk')}: <strong>${simResult.newRiskScore}% (↓ -${simResult.riskReduction}%)</strong></div>
              <div style="font-size:12px;color:var(--accent-emerald);margin-top:4px;">${i18n.t('stat_blast_radius')}: <strong>${simResult.newBlastRadius}% (↓ -${simResult.blastReduction}%)</strong></div>
            </div>
          </div>

          <button id="validate-refactor-btn" class="execute-sim-btn" style="background:var(--accent-emerald);box-shadow:0 0 20px rgba(16,185,129,0.35);">
            ${i18n.t('btn_validate_refactor')}
          </button>
        </div>
      </div>
    `;

    // Locate Threat
    document.getElementById('locate-threat-btn')?.addEventListener('click', () => {
      sfx.playClick();
      this.container?.classList.add('hidden');
      document.getElementById('modal-backdrop')?.classList.add('hidden');
      this.state.setSelectedNode(threat.id);
      if (node) this.camera.centerOn(node.x, node.y, 3.5);
    });

    // Strategy Selection
    this.dossierContainer.querySelectorAll('.strategy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.playClick();
        this.activeStrategy = btn.getAttribute('data-strategy');
        this.renderDossier();
      });
    });

    // Validate Refactor Simulation
    document.getElementById('validate-refactor-btn')?.addEventListener('click', () => {
      sfx.playVictory();
      this.state.knowledgeTracker.addXP(500);
      alert(isEs
        ? `¡REFACTOR VALIDADO! Estrategia '${this.activeStrategy}' simulada con éxito. Riesgo reducido en ${simResult.riskReduction}%. +500 XP ganados.`
        : `REFACTOR VALIDATED! Simulated strategy '${this.activeStrategy}' successfully. Risk reduced by ${simResult.riskReduction}%. +500 XP awarded.`
      );
    });
  }

  updateI18n() {
    const title = document.getElementById('threats-header-title');
    if (title) title.textContent = i18n.t('threat_title');

    const stabilityLbl = document.getElementById('threats-lbl-stability');
    if (stabilityLbl) stabilityLbl.textContent = i18n.t('threat_stability');

    const sidebarHeading = document.getElementById('threats-sidebar-heading');
    if (sidebarHeading) sidebarHeading.textContent = i18n.t('threat_detected_heading');
  }
}
