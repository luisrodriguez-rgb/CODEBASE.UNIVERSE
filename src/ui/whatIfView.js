/**
 * What-If Impact Laboratory Controller.
 * Runs failure, contract change, and isolation cascading simulations.
 */

import { calculateBlastRadius } from '../analysis/blastRadius.js';

export class WhatIfView {
  constructor(state, graph, analysis, world) {
    this.state = state;
    this.graph = graph;
    this.analysis = analysis;
    this.world = world;

    this.modal = document.getElementById('whatif-modal');
    this.targetSelect = document.getElementById('whatif-target-node');
    this.scenarioSelect = document.getElementById('whatif-simulation-type');
    this.runBtn = document.getElementById('run-simulation-btn');
    this.resultsContent = document.getElementById('whatif-results-content');

    this.initEvents();
  }

  initEvents() {
    this.runBtn.addEventListener('click', () => {
      const targetId = this.targetSelect.value;
      const scenario = this.scenarioSelect.value;
      this.executeSimulation(targetId, scenario);
    });

    window.addEventListener('open-whatif-sim', (e) => {
      const { targetId, scenario } = e.detail;
      this.open(targetId, scenario);
      this.executeSimulation(targetId, scenario);
    });
  }

  open(preselectId = null, preselectScenario = null) {
    this.modal.classList.remove('hidden');
    document.getElementById('modal-backdrop').classList.remove('hidden');

    this.populateDropdown();
    if (preselectId) this.targetSelect.value = preselectId;
    if (preselectScenario) this.scenarioSelect.value = preselectScenario;
  }

  close() {
    this.modal.classList.add('hidden');
    document.getElementById('modal-backdrop').classList.add('hidden');
    this.world.effects.clearBlackout();
  }

  populateDropdown() {
    const nodes = Array.from(this.graph.nodes.values()).sort((a, b) => a.name.localeCompare(b.name));
    this.targetSelect.innerHTML = nodes.map(n => {
      const stat = this.analysis.nodeStats.get(n.id);
      return `<option value="${n.id}">[${stat?.rarity.toUpperCase() || 'MOD'}] ${n.name}</option>`;
    }).join('');
  }

  executeSimulation(targetId, scenario) {
    if (!targetId) return;

    const result = calculateBlastRadius(this.graph, targetId, scenario);
    if (!result) return;

    // Trigger visual shockwave and blackout cascade in the canvas world
    const targetNode = this.graph.getNode(targetId);
    if (targetNode) {
      this.world.effects.triggerShockwave(targetNode.x, targetNode.y, '#f43f5e', 450);
      this.world.effects.setBlackoutNodes(result.affectedDetails.map(d => d.id));
    }

    this.resultsContent.innerHTML = `
      <div class="whatif-stats-banner">
        <div class="stat-box">
          <span class="stat-lbl">TOTAL AFFECTED</span>
          <span class="stat-val risk-high">${result.affectedCount} files</span>
        </div>
        <div class="stat-box">
          <span class="stat-lbl">DIRECT DEPENDENTS</span>
          <span class="stat-val">${result.directCount}</span>
        </div>
        <div class="stat-box">
          <span class="stat-lbl">INDIRECT CASUALTIES</span>
          <span class="stat-val">${result.indirectCount}</span>
        </div>
        <div class="stat-box">
          <span class="stat-lbl">CRITICAL BREAKPOINTS</span>
          <span class="stat-val">${result.criticalPaths}</span>
        </div>
      </div>

      <div class="blast-gauge-box">
        <div style="display:flex; justify-content:space-between; font-size:11px;">
          <span>ESTIMATED SYSTEM BLAST RADIUS</span>
          <strong class="${result.blastRadiusPct > 50 ? 'risk-high' : 'risk-medium'}">${result.blastRadiusPct}%</strong>
        </div>
        <div class="gauge-track">
          <div class="gauge-fill" id="animated-gauge-fill"></div>
        </div>
      </div>

      <div class="drawer-section">
        <h3 class="section-title">IMPACTED DOWNSTREAM MODULES & CASUALTY LOG</h3>
        <ul class="entity-link-list" style="max-height: 220px;">
          ${result.affectedDetails.map(d => `
            <li class="entity-link-item" data-node-id="${d.id}">
              <span>${d.name} ${d.isDirect ? '<strong style="color:var(--accent-rose)">[DIRECT]</strong>' : '<span style="color:var(--text-muted)">[TRANSITIVE]</span>'}</span>
              <span style="color:var(--text-muted)">${d.biome}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <button id="view-in-world-blackout-btn" class="action-btn" style="align-self:flex-start;">
        VIEW BLACKOUT CASCADE IN WORLD MAP
      </button>
    `;

    setTimeout(() => {
      const fill = document.getElementById('animated-gauge-fill');
      if (fill) fill.style.width = `${result.blastRadiusPct}%`;
    }, 50);

    document.getElementById('view-in-world-blackout-btn')?.addEventListener('click', () => {
      this.close();
      if (targetNode) {
        this.world.camera.centerOn(targetNode.x, targetNode.y);
      }
    });

    this.resultsContent.querySelectorAll('.entity-link-item').forEach(el => {
      el.addEventListener('click', () => {
        const nodeId = el.getAttribute('data-node-id');
        if (nodeId) {
          this.close();
          this.state.setSelectedNode(nodeId);
          const n = this.graph.getNode(nodeId);
          if (n) this.world.camera.centerOn(n.x, n.y);
        }
      });
    });
  }
}
