/**
 * What-If Architecture Simulator Controller for CODEBASE.UNIVERSE.
 * 4 Explicit Scenario Modes: [ REMOVE | ISOLATE | REFACTOR | MOVE ]
 * Displays direct vs indirect casualties and comparative risk reduction.
 * ZERO EMOJIS.
 */

import { calculateBlastRadius } from '../analysis/blastRadius.js';
import { simulateRefactoring } from '../simulation/refactorSimulation.js';
import { sfx } from '../audio/soundFX.js';
import { i18n } from '../i18n/translations.js';

export class WhatIfViewController {
  constructor(state, camera, effects) {
    this.state = state;
    this.camera = camera;
    this.effects = effects;

    this.container = document.getElementById('whatif-modal');
    this.targetSelect = document.getElementById('whatif-target-node') || document.getElementById('whatif-target-select');
    this.scenarioSelect = document.getElementById('whatif-simulation-type') || document.getElementById('whatif-scenario-select');
    this.executeBtn = document.getElementById('run-simulation-btn') || document.getElementById('execute-whatif-btn');
    this.resultsContent = document.getElementById('whatif-results-content');

    this.activeScenario = 'remove';

    this.initEvents();
    this.subscribeState();
    this.updateI18n();
  }

  initEvents() {
    this.targetSelect?.addEventListener('change', () => {
      sfx.playClick();
      this.recalculateSimulation();
    });

    this.scenarioSelect?.addEventListener('change', (e) => {
      sfx.playClick();
      this.activeScenario = e.target.value;
      this.recalculateSimulation();
    });

    this.executeBtn?.addEventListener('click', () => {
      sfx.playAlarm();
      this.executeVisualCascade();
    });

    i18n.subscribe(() => {
      this.updateI18n();
      this.recalculateSimulation();
    });
  }

  subscribeState() {
    this.state.subscribe((event, data) => {
      if (event === 'graph_loaded') {
        this.populateTargetDropdown();
        this.recalculateSimulation();
      } else if (event === 'node_selected' && data.nodeId) {
        if (this.targetSelect) {
          this.targetSelect.value = data.nodeId;
          this.recalculateSimulation();
        }
      }
    });
  }

  populateTargetDropdown() {
    if (!this.targetSelect || !this.state.graph) return;
    const nodes = Array.from(this.state.graph.nodes.values()).sort((a, b) => a.name.localeCompare(b.name));

    this.targetSelect.innerHTML = nodes.map(n => `
      <option value="${n.id}">${n.name} (${n.biome.toUpperCase()})</option>
    `).join('');

    const topThreat = this.state.analysis?.threats[0];
    if (topThreat) {
      this.targetSelect.value = topThreat.id;
    }
  }

  recalculateSimulation() {
    if (!this.resultsContent || !this.targetSelect || !this.state.graph) return;
    const targetId = this.targetSelect.value;
    if (!targetId) return;

    const node = this.state.graph.getNode(targetId);
    const stat = this.state.analysis?.nodeStats.get(targetId);
    if (!node || !stat) return;

    const blast = calculateBlastRadius(this.state.graph, this.state.analysis, targetId, this.activeScenario);
    const isEs = i18n.currentLang === 'es';

    const directCount = blast.directDependents.length;
    const indirectCount = blast.indirectDependents.length;
    const totalCasualties = directCount + indirectCount;
    const initialRisk = stat.riskScore;
    const projectedRisk = Math.max(12, Math.round(initialRisk * (this.activeScenario === 'remove' ? 0.3 : this.activeScenario === 'refactor' ? 0.5 : 0.45)));
    const riskDiff = initialRisk - projectedRisk;

    this.resultsContent.innerHTML = `
      <div class="whatif-telemetry-card">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(30,41,59,0.6);padding-bottom:10px;">
          <div>
            <div style="font-size:12.5px;font-weight:700;color:#fff;">[SCENARIO: ${this.activeScenario.toUpperCase()}] ${node.name}</div>
            <div style="font-size:10px;color:var(--text-muted);">${node.path}</div>
          </div>
          <span class="badge ${totalCasualties > 15 ? 'threat-badge' : 'highlight'}">${totalCasualties} CASUALTIES</span>
        </div>

        <div class="metrics-grid" style="margin-top:14px;">
          <div class="metric-card">
            <span class="m-label">${isEs ? 'BAJAS DIRECTAS' : 'DIRECT CASUALTIES'}</span>
            <span class="m-val" style="color:#f87171;">${directCount}</span>
          </div>
          <div class="metric-card">
            <span class="m-label">${isEs ? 'BAJAS INDIRECTAS' : 'INDIRECT CASCADE'}</span>
            <span class="m-val" style="color:#fb923c;">${indirectCount}</span>
          </div>
          <div class="metric-card">
            <span class="m-label">${isEs ? 'RUTAS CRÍTICAS' : 'CRITICAL PATHS'}</span>
            <span class="m-val">${blast.criticalPaths}</span>
          </div>
          <div class="metric-card">
            <span class="m-label">${isEs ? 'RADIO DE IMPACTO' : 'BLAST RADIUS'}</span>
            <span class="m-val" style="color:var(--accent-cyan);">${blast.blastRadiusPct}%</span>
          </div>
        </div>

        <div class="refactor-comparison-grid" style="margin-top:14px;">
          <div>
            <div style="font-size:10px;color:var(--text-muted);">${isEs ? 'ESTADO ACTUAL' : 'CURRENT SYSTEM'}</div>
            <div style="font-size:12px;color:#f87171;">RISK: <strong>${initialRisk}%</strong></div>
          </div>
          <div>
            <div style="font-size:10px;color:var(--accent-emerald);">${isEs ? 'SIMULADO' : 'SIMULATED'}</div>
            <div style="font-size:12px;color:var(--accent-emerald);">RISK: <strong>${projectedRisk}% (↓ -${riskDiff}%)</strong></div>
          </div>
        </div>

        <div style="margin-top:14px;">
          <h4 style="font-size:10.5px;color:var(--text-muted);letter-spacing:0.05em;margin-bottom:8px;">
            ${isEs ? 'LISTADO DE MÓDULOS AFECTADOS' : 'AFFECTED PIPELINE ENTITIES'} (${blast.affectedDetails.length})
          </h4>
          <div style="display:flex;flex-wrap:wrap;gap:6px;max-height:130px;overflow-y:auto;">
            ${blast.affectedDetails.slice(0, 20).map(item => `
              <span class="trace-node-pill" style="border-color:${item.isDirect ? 'rgba(244,63,94,0.4)' : 'rgba(245,158,11,0.3)'};">
                <span style="color:${item.isDirect ? '#f87171' : '#fb923c'};">${item.isDirect ? '[DIR]' : '[IND]'}</span>
                <span class="step-name">${item.name}</span>
              </span>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  executeVisualCascade() {
    const targetId = this.targetSelect?.value;
    if (!targetId || !this.state.graph) return;

    const blast = calculateBlastRadius(this.state.graph, this.state.analysis, targetId, this.activeScenario);
    const targetNode = this.state.graph.getNode(targetId);

    if (targetNode) {
      this.effects.triggerShockwave(targetNode.x, targetNode.y, 450, '#f43f5e');
      this.effects.triggerBlackout(blast.directDependents.concat(blast.indirectDependents), 2800);
      this.camera.centerOn(targetNode.x, targetNode.y, 2.8);
      this.container?.classList.add('hidden');
      document.getElementById('modal-backdrop')?.classList.add('hidden');
    }
  }

  updateI18n() {
    const heading = document.getElementById('whatif-header-title');
    if (heading) heading.textContent = i18n.t('whatif_header_title');

    const lblTarget = document.getElementById('whatif-lbl-target');
    if (lblTarget) lblTarget.textContent = i18n.t('whatif_lbl_target');

    const lblScenario = document.getElementById('whatif-lbl-scenario');
    if (lblScenario) lblScenario.textContent = i18n.t('whatif_lbl_scenario');

    const btnExec = document.getElementById('run-simulation-btn') || document.getElementById('execute-whatif-btn');
    if (btnExec) btnExec.textContent = i18n.t('btn_execute_sim');
  }
}
