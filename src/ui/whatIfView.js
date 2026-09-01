/**
 * What-If Impact & Blast Radius Lab Controller for CODEBASE.UNIVERSE.
 */

import { calculateBlastRadius } from '../analysis/blastRadius.js';
import { sfx } from '../audio/soundFX.js';
import { i18n } from '../i18n/translations.js';

export class WhatIfViewController {
  constructor(state, camera, effects) {
    this.state = state;
    this.camera = camera;
    this.effects = effects;

    this.container = document.getElementById('whatif-modal');
    this.targetSelect = document.getElementById('whatif-target-node');
    this.scenarioSelect = document.getElementById('whatif-simulation-type');
    this.runBtn = document.getElementById('run-simulation-btn');
    this.resultsContent = document.getElementById('whatif-results-content');

    this.initEvents();
    this.subscribeState();
    this.updateI18n();
  }

  initEvents() {
    this.runBtn?.addEventListener('click', () => {
      sfx.playAlarm();
      this.executeSimulation();
    });

    i18n.subscribe(() => {
      this.updateI18n();
    });
  }

  subscribeState() {
    this.state.subscribe((event, data) => {
      if (event === 'graph_loaded') {
        this.populateDropdown();
      }
    });
  }

  populateDropdown() {
    if (!this.targetSelect || !this.state.graph) return;
    const nodes = Array.from(this.state.graph.nodes.values());

    this.targetSelect.innerHTML = nodes.map(n => {
      return `<option value="${n.id}">${n.name} (${n.biome.toUpperCase()} - ${n.path})</option>`;
    }).join('');
  }

  executeSimulation() {
    const targetId = this.targetSelect?.value;
    const scenario = this.scenarioSelect?.value || 'failure';
    if (!targetId || !this.state.graph) return;

    const targetNode = this.state.graph.getNode(targetId);
    const blast = calculateBlastRadius(this.state.graph, this.state.analysis, targetId, scenario);
    const isEs = i18n.currentLang === 'es';

    // Render results pane
    this.resultsContent.innerHTML = `
      <div class="whatif-stats-banner">
        <div class="stat-box">
          <span class="stat-lbl">${i18n.t('stat_affected')}</span>
          <span class="stat-val" style="color:var(--accent-rose)">${blast.totalAffected}</span>
        </div>
        <div class="stat-box">
          <span class="stat-lbl">${i18n.t('stat_direct')}</span>
          <span class="stat-val">${blast.directDependents.length}</span>
        </div>
        <div class="stat-box">
          <span class="stat-lbl">${i18n.t('stat_indirect')}</span>
          <span class="stat-val">${blast.indirectDependents.length}</span>
        </div>
        <div class="stat-box">
          <span class="stat-lbl">${i18n.t('stat_critical_paths')}</span>
          <span class="stat-val" style="color:var(--accent-amber)">${blast.criticalPaths}</span>
        </div>
      </div>

      <div class="blast-gauge-box">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:11px;font-weight:700;letter-spacing:0.06em;color:#fff;">${i18n.t('stat_blast_radius')}</span>
          <strong style="font-size:16px;color:var(--accent-rose);">${blast.blastRadiusScore}%</strong>
        </div>
        <div class="gauge-track">
          <div class="gauge-fill" style="width: ${blast.blastRadiusScore}%"></div>
        </div>
      </div>

      <div class="drawer-section">
        <h4 style="font-size:11px;letter-spacing:0.08em;color:var(--text-muted);">${i18n.t('whatif_cascade_log')} (${blast.totalAffected})</h4>
        <ul class="entity-link-list" style="max-height:160px;">
          ${blast.casualtyList.slice(0, 35).map(c => `
            <li class="entity-link-item">
              <span>${c.name}</span>
              <span style="color:var(--text-muted);font-size:9.5px">${c.reason} (Layer ${c.depth})</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <button id="trigger-world-blackout-btn" class="execute-sim-btn" style="background:#0284c7;box-shadow:0 0 20px rgba(2,132,199,0.35);">
        ${i18n.t('btn_view_blackout')}
      </button>
    `;

    document.getElementById('trigger-world-blackout-btn')?.addEventListener('click', () => {
      sfx.playWarp();
      // Close modal, trigger shockwave and blackout cascade in canvas
      this.container?.classList.add('hidden');
      document.getElementById('modal-backdrop')?.classList.add('hidden');
      
      if (targetNode) {
        this.camera.centerOn(targetNode.x, targetNode.y, 2.5);
        this.effects.triggerShockwave(targetNode.x, targetNode.y, '#f43f5e', 450);
        this.effects.triggerBlackoutCascade(blast.casualtyList.map(c => c.id));
      }
    });
  }

  updateI18n() {
    const title = document.getElementById('whatif-header-title');
    if (title) title.textContent = i18n.t('whatif_title');

    const lblHypothesis = document.getElementById('whatif-lbl-hypothesis');
    if (lblHypothesis) lblHypothesis.textContent = i18n.t('whatif_hypothesis');

    const lblTarget = document.getElementById('whatif-lbl-target');
    if (lblTarget) lblTarget.textContent = i18n.t('whatif_target_label');

    const lblScenario = document.getElementById('whatif-lbl-scenario');
    if (lblScenario) lblScenario.textContent = i18n.t('whatif_scenario_label');

    const runBtn = document.getElementById('run-simulation-btn');
    if (runBtn) runBtn.textContent = i18n.t('btn_run_sim');

    const lblResultsHeading = document.getElementById('whatif-lbl-results-heading');
    if (lblResultsHeading) lblResultsHeading.textContent = i18n.t('whatif_telemetry_heading');
  }
}
