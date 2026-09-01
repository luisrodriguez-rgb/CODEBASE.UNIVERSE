/**
 * Architectural Threat Arena & Refactor Strategy Simulator Controller.
 */

import { simulateRefactoring } from '../simulation/refactorSimulation.js';

export class ThreatView {
  constructor(state, graph, analysis, world) {
    this.state = state;
    this.graph = graph;
    this.analysis = analysis;
    this.world = world;

    this.modal = document.getElementById('threats-modal');
    this.sidebarList = document.getElementById('threats-sidebar-list');
    this.dossier = document.getElementById('active-threat-dossier');

    this.selectedThreatId = null;
    this.activeStrategy = 'break_cycle';

    this.initEvents();
  }

  initEvents() {
    this.state.subscribe(() => {
      if (!this.modal.classList.contains('hidden')) {
        this.renderSidebar();
        this.renderDossier();
      }
    });
  }

  open() {
    this.modal.classList.remove('hidden');
    document.getElementById('modal-backdrop').classList.remove('hidden');
    if (!this.selectedThreatId && this.analysis.threats.length > 0) {
      this.selectedThreatId = this.analysis.threats[0].id;
    }
    this.renderSidebar();
    this.renderDossier();
  }

  close() {
    this.modal.classList.add('hidden');
    document.getElementById('modal-backdrop').classList.add('hidden');
  }

  renderSidebar() {
    const threats = this.analysis.threats;
    this.sidebarList.innerHTML = threats.map(t => {
      const isActive = t.id === this.selectedThreatId;
      return `
        <li class="threat-list-item ${isActive ? 'active' : ''}" data-threat-id="${t.id}">
          <span class="threat-item-name">${t.name}</span>
          <div class="threat-item-meta">
            <span class="risk-high">RISK ${t.riskScore}%</span>
            <span>${t.fanIn} dependents</span>
          </div>
        </li>
      `;
    }).join('') || '<li style="padding:16px; color:var(--text-muted);">No critical threats detected. System is clean.</li>';

    this.sidebarList.querySelectorAll('.threat-list-item').forEach(el => {
      el.addEventListener('click', () => {
        this.selectedThreatId = el.getAttribute('data-threat-id');
        this.renderSidebar();
        this.renderDossier();
      });
    });
  }

  renderDossier() {
    if (!this.selectedThreatId) {
      this.dossier.innerHTML = '<div style="color:var(--text-muted);">Select a threat from the sidebar to inspect dossier.</div>';
      return;
    }

    const threat = this.analysis.threats.find(t => t.id === this.selectedThreatId);
    if (!threat) return;

    const simResult = simulateRefactoring(this.graph, this.selectedThreatId, this.activeStrategy);

    this.dossier.innerHTML = `
      <div class="threat-dossier-card">
        <div class="threat-header-row">
          <div>
            <div class="threat-title-alias">${threat.alias}</div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Target Entity: ${threat.name}</div>
          </div>
          <button id="threat-locate-btn" class="action-btn secondary" data-target-id="${threat.id}">LOCATE ON MAP</button>
        </div>

        <div class="threat-metrics-row">
          <div class="stat-box">
            <span class="stat-lbl">STRUCTURAL RISK</span>
            <span class="stat-val risk-high">${threat.riskScore}%</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">DIRECT DEPENDENTS</span>
            <span class="stat-val">${threat.fanIn}</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">CRITICAL PATHS</span>
            <span class="stat-val">${threat.criticalPaths}</span>
          </div>
          <div class="stat-box">
            <span class="stat-lbl">CYCLOMATIC MASS</span>
            <span class="stat-val">${threat.cyclomatic}</span>
          </div>
        </div>

        <div class="drawer-section">
          <h3 class="section-title">THREAT DIAGNOSIS</h3>
          <ul style="list-style: square; padding-left: 18px; color: var(--text-secondary); font-size: 11px;">
            ${threat.reasons.map(r => `<li style="margin-bottom:4px;">${r}</li>`).join('')}
          </ul>
        </div>

        <div class="refactor-strategies-box">
          <h3 class="section-title">SIMULATE REFACTORING STRATEGY</h3>
          <div class="strategy-options">
            <button class="strategy-btn ${this.activeStrategy === 'break_cycle' ? 'active' : ''}" data-strategy="break_cycle">BREAK CYCLE</button>
            <button class="strategy-btn ${this.activeStrategy === 'split_module' ? 'active' : ''}" data-strategy="split_module">SPLIT MODULE</button>
            <button class="strategy-btn ${this.activeStrategy === 'introduce_interface' ? 'active' : ''}" data-strategy="introduce_interface">INTRODUCE INTERFACE</button>
            <button class="strategy-btn ${this.activeStrategy === 'isolate' ? 'active' : ''}" data-strategy="isolate">ISOLATE SUBSYSTEM</button>
          </div>
          
          <div style="font-size:11px; color:var(--accent-cyan); font-style:italic;">
            ${simResult.strategyDescription}
          </div>

          <div class="refactor-comparison-grid">
            <div>
              <div style="font-size:10px; color:var(--text-muted); margin-bottom:6px; letter-spacing:0.05em;">BEFORE SIMULATION</div>
              <div style="font-size:12px; margin-bottom:4px;">Risk: <strong class="risk-high">${simResult.before.riskScore}%</strong></div>
              <div style="font-size:12px; margin-bottom:4px;">Cycles: <strong>${simResult.before.cycleCount}</strong></div>
              <div style="font-size:12px;">Blast Radius: <strong>${simResult.before.blastRadiusPct}%</strong></div>
            </div>
            <div>
              <div style="font-size:10px; color:var(--accent-emerald); margin-bottom:6px; letter-spacing:0.05em;">AFTER REFACTOR (HYPOTHETICAL)</div>
              <div style="font-size:12px; margin-bottom:4px;">Risk: <strong class="risk-low">${simResult.after.riskScore}%</strong> (-${simResult.riskDelta}%)</div>
              <div style="font-size:12px; margin-bottom:4px;">Cycles: <strong>${simResult.after.cycleCount}</strong></div>
              <div style="font-size:12px;">Blast Radius: <strong style="color:var(--accent-cyan)">${simResult.after.blastRadiusPct}%</strong> (-${simResult.blastDelta}%)</div>
            </div>
          </div>

          <button id="commit-refactor-sim-btn" class="action-btn" style="align-self:flex-start; margin-top:8px;">
            VALIDATE REFACTOR STRATEGY (+500 XP)
          </button>
        </div>
      </div>
    `;

    document.getElementById('threat-locate-btn')?.addEventListener('click', () => {
      this.close();
      this.state.setSelectedNode(threat.id);
      const node = this.graph.getNode(threat.id);
      if (node) {
        this.world.camera.centerOn(node.x, node.y);
      }
    });

    this.dossier.querySelectorAll('.strategy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeStrategy = btn.getAttribute('data-strategy');
        this.renderDossier();
      });
    });

    document.getElementById('commit-refactor-sim-btn')?.addEventListener('click', () => {
      this.state.knowledgeTracker.markMastered(threat.id);
      this.state.addXp(500);
      alert(`REFACTOR STRATEGY VALIDATED!\nRisk reduced by ${simResult.riskDelta}%.\n+500 XP awarded to Architect Profile.`);
      this.renderDossier();
    });
  }
}
