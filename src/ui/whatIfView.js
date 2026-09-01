/**
 * What-If Architecture Simulator Controller for CODEBASE.UNIVERSE.
 * 4 Explicit Scenario Modes: [ REMOVE | ISOLATE | REFACTOR | MOVE ]
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
    this.targetSelect = document.getElementById('whatif-target-select');
    this.scenarioSelect = document.getElementById('whatif-scenario-select');
    this.executeBtn = document.getElementById('execute-whatif-btn');

    this.statDirect = document.getElementById('whatif-stat-direct');
    this.statIndirect = document.getElementById('whatif-stat-indirect');
    this.statPaths = document.getElementById('whatif-stat-paths');
    this.statRisk = document.getElementById('whatif-stat-risk');
    this.casualtiesList = document.getElementById('whatif-casualties-list');

    this.activeScenario = 'remove'; // 'remove', 'isolate', 'refactor', 'move'

    this.initEvents();
    this.subscribeState();
    this.updateI18n();
  }

  initEvents() {
    this.targetSelect?.addEventListener('change', () => {
      this.recalculateSimulation();
    });

    this.scenarioSelect?.addEventListener('change', (e) => {
      this.activeScenario = e.target.value;
      this.recalculateSimulation();
    });

    this.executeBtn?.addEventListener('click', () => {
      sfx.playAlarm();
      this.executeVisualCascade();
    });

    i18n.subscribe(() => {
      this.updateI18n();
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
    const targetId = this.targetSelect?.value;
    if (!targetId || !this.state.graph || !this.state.analysis) return;

    const blast = calculateBlastRadius(this.state.graph, this.state.analysis, targetId, 'failure');
    const refactorSim = simulateRefactoring(this.state.graph, this.state.analysis, targetId, 'break_cycle');

    const isEs = i18n.currentLang === 'es';

    let directCount = blast.directDependents.length;
    let indirectCount = blast.indirectDependents.length;
    let criticalPaths = blast.criticalPathsCount;
    let riskScore = blast.blastRadiusScore;

    if (this.activeScenario === 'isolate') {
      riskScore = Math.max(12, Math.round(riskScore * 0.45));
      indirectCount = Math.max(0, Math.round(indirectCount * 0.3));
    } else if (this.activeScenario === 'refactor') {
      riskScore = Math.max(15, Math.round(riskScore * 0.55));
    } else if (this.activeScenario === 'move') {
      riskScore = Math.max(20, Math.round(riskScore * 0.7));
    }

    if (this.statDirect) this.statDirect.textContent = directCount;
    if (this.statIndirect) this.statIndirect.textContent = indirectCount;
    if (this.statPaths) this.statPaths.textContent = criticalPaths;
    if (this.statRisk) {
      this.statRisk.textContent = `${riskScore}%`;
      this.statRisk.className = `stat-val ${riskScore > 60 ? 'risk-high' : 'risk-medium'}`;
    }

    // Render Casualties List
    if (this.casualtiesList) {
      const allCasualties = [...blast.directDependents, ...blast.indirectDependents];
      if (allCasualties.length === 0) {
        this.casualtiesList.innerHTML = `<li class="casualty-item" style="color:var(--text-muted);">${isEs ? 'Sin bajas proyectadas (Módulo aislado)' : 'No casualties projected (Isolated module)'}</li>`;
      } else {
        this.casualtiesList.innerHTML = allCasualties.slice(0, 20).map(cId => {
          const isDirect = blast.directDependents.includes(cId);
          const node = this.state.graph.getNode(cId);
          return `
            <li class="casualty-item" data-node-id="${cId}">
              <span>[!] ${node?.name || cId}</span>
              <span class="badge ${isDirect ? 'threat-badge' : ''}">${isDirect ? 'DIRECT' : 'INDIRECT'}</span>
            </li>
          `;
        }).join('');
      }
    }
  }

  executeVisualCascade() {
    const targetId = this.targetSelect?.value;
    if (!targetId || !this.state.graph) return;

    const blast = calculateBlastRadius(this.state.graph, this.state.analysis, targetId, 'failure');
    const targetNode = this.state.graph.getNode(targetId);

    // Hide modal to view visual explosion on map
    this.container?.classList.add('hidden');
    document.getElementById('modal-backdrop')?.classList.add('hidden');

    if (targetNode) {
      this.camera.centerOn(targetNode.x, targetNode.y, 2.8);
      this.effects.triggerShockwave(targetNode.x, targetNode.y, '#f43f5e', 450);

      const blackoutIds = [targetId, ...blast.directDependents, ...blast.indirectDependents];
      this.effects.blackoutNodes = new Set(blackoutIds);

      setTimeout(() => {
        this.effects.clearBlackout();
      }, 5000);
    }
  }

  updateI18n() {
    const title = document.getElementById('whatif-header-title');
    if (title) title.textContent = i18n.t('whatif_title');

    const lblTarget = document.getElementById('whatif-lbl-target');
    if (lblTarget) lblTarget.textContent = i18n.t('whatif_lbl_target');

    const lblScenario = document.getElementById('whatif-lbl-scenario');
    if (lblScenario) lblScenario.textContent = i18n.t('whatif_lbl_scenario');

    const lblCasualties = document.getElementById('whatif-lbl-casualties');
    if (lblCasualties) lblCasualties.textContent = i18n.t('whatif_lbl_casualties');

    if (this.executeBtn) this.executeBtn.textContent = i18n.t('btn_execute_whatif');
  }
}
