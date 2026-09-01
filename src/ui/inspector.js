/**
 * Layered Entity Inspector Controller for CODEBASE.UNIVERSE.
 * Progressive disclosure architecture with 4 functional tabs:
 * [ ARCHITECTURE ] | [ DEPENDENCIES ] | [ RECOMMENDATIONS ] | [ SIMULATION ]
 * Answers: "What is here?", "How is it connected?", and "What should I do?"
 * ZERO EMOJIS.
 */

import { RARITY_CONFIG } from '../analysis/types.js';
import { ArchitecturalRecommendationEngine } from '../analysis/recommendations.js';
import { sfx } from '../audio/soundFX.js';
import { i18n } from '../i18n/translations.js';

export class InspectorController {
  constructor(state, camera, graphWorld) {
    this.state = state;
    this.camera = camera;
    this.graphWorld = graphWorld;

    this.container = document.getElementById('entity-inspector');
    this.closeBtn = document.getElementById('close-inspector-btn');

    this.activeTab = 'architecture';

    this.initEvents();
    this.subscribeState();
    this.updateI18n();
  }

  initEvents() {
    this.closeBtn?.addEventListener('click', () => {
      sfx.playClick();
      this.close();
    });

    i18n.subscribe(() => {
      this.updateI18n();
      if (this.state.selectedNodeId) {
        this.renderNodeDetails(this.state.selectedNodeId);
      }
    });
  }

  subscribeState() {
    this.state.subscribe((event, data) => {
      if (event === 'node_selected') {
        if (data.nodeId) {
          // Unified Multi-System Reaction: Mark discovered & add XP
          this.state.knowledgeTracker.markDiscovered(data.nodeId);
          this.open();
          this.renderNodeDetails(data.nodeId);
        } else {
          this.close();
        }
      }
    });
  }

  open() {
    this.container?.classList.remove('hidden');
  }

  close() {
    this.container?.classList.add('hidden');
    this.state.setSelectedNode(null);
  }

  renderNodeDetails(nodeId) {
    const node = this.state.graph.getNode(nodeId);
    const stat = this.state.analysis.nodeStats.get(nodeId);
    if (!node || !stat) return;

    const rarityKey = `rarity_${stat.rarity}`;
    const localizedRarity = i18n.t(rarityKey) || stat.rarity.toUpperCase();
    const rarityConf = RARITY_CONFIG[stat.rarity] || RARITY_CONFIG.common;
    const localizedBiome = i18n.t(`biome_${node.biome}`) || node.biome.toUpperCase();

    const callers = this.state.graph.getDependents(nodeId);
    const deps = this.state.graph.getDependencies(nodeId);
    const isEs = i18n.currentLang === 'es';

    const interventions = ArchitecturalRecommendationEngine.getInterventionsForNode(
      node,
      stat,
      this.state.analysis,
      isEs
    );

    this.container.innerHTML = `
      <div class="inspector-header">
        <div class="inspector-title-row">
          <div>
            <div class="entity-name" title="${node.name}">${node.name}</div>
            <div class="entity-path" title="${node.path}">${node.path}</div>
          </div>
          <button id="close-inspector-btn" class="close-btn">[X]</button>
        </div>

        <div class="badge-row">
          <span class="rarity-tag rarity-${stat.rarity}">${localizedRarity}</span>
          <span class="biome-tag">${localizedBiome}</span>
          <span class="type-tag">${node.type.toUpperCase()}</span>
        </div>

        <div class="inspector-tabs-nav">
          <button class="insp-tab-btn ${this.activeTab === 'architecture' ? 'active' : ''}" data-tab="architecture">${isEs ? 'ARQUITECTURA' : 'ARCHITECTURE'}</button>
          <button class="insp-tab-btn ${this.activeTab === 'dependencies' ? 'active' : ''}" data-tab="dependencies">${isEs ? 'CONEXIONES' : 'DEPENDENCIES'}</button>
          <button class="insp-tab-btn ${this.activeTab === 'recommendations' ? 'active' : ''}" data-tab="recommendations">${isEs ? 'ACCIONES' : 'INTERVENTIONS'}</button>
          <button class="insp-tab-btn ${this.activeTab === 'simulation' ? 'active' : ''}" data-tab="simulation">${isEs ? 'SIMULACIÓN' : 'SIMULATION'}</button>
        </div>
      </div>

      <div class="inspector-tab-content">
        ${this.renderTabContent(node, stat, callers, deps, interventions, isEs)}
      </div>

      <div class="inspector-actions">
        <button id="btn-follow-flow" class="action-btn highlight">
          [>] ${isEs ? 'SEGUIR FLUJO' : 'FOLLOW FLOW'}
        </button>
        <button id="btn-whatif-trigger" class="action-btn">
          [!] WHAT-IF
        </button>
        <button id="btn-refactor-trigger" class="action-btn">
          [*] REFACTOR
        </button>
      </div>
    `;

    // Re-attach close event
    document.getElementById('close-inspector-btn')?.addEventListener('click', () => {
      sfx.playClick();
      this.close();
    });

    // Tab buttons click
    this.container.querySelectorAll('.insp-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.playClick();
        this.activeTab = btn.getAttribute('data-tab');
        this.renderNodeDetails(nodeId);
      });
    });

    // Action 1: Follow Flow
    document.getElementById('btn-follow-flow')?.addEventListener('click', () => {
      sfx.playVictory();
      const flow = this.graphWorld.pathFollower.getDownstreamFlow(nodeId, 6);
      this.graphWorld.pathFollower.startFlow(flow, () => {
        sfx.playVictory();
      });
    });

    // Action 2: What-If
    document.getElementById('btn-whatif-trigger')?.addEventListener('click', () => {
      sfx.playClick();
      document.getElementById('nav-whatif-btn')?.click();
    });

    // Action 3: Refactor
    document.getElementById('btn-refactor-trigger')?.addEventListener('click', () => {
      sfx.playClick();
      document.getElementById('nav-threats-btn')?.click();
    });

    // Dependency node clicks
    this.container.querySelectorAll('.dep-link-item').forEach(link => {
      link.addEventListener('click', () => {
        sfx.playClick();
        const targetId = link.getAttribute('data-target-id');
        if (targetId) {
          this.state.setSelectedNode(targetId);
          const targetNode = this.state.graph.getNode(targetId);
          if (targetNode) {
            this.camera.centerOn(targetNode.x, targetNode.y, 3.5);
          }
        }
      });
    });
  }

  renderTabContent(node, stat, callers, deps, interventions, isEs) {
    if (this.activeTab === 'architecture') {
      return `
        <div class="metrics-grid">
          <div class="metric-card">
            <span class="m-label">${i18n.t('inspect_centrality')}</span>
            <span class="m-val">${stat.centralityPct}%</span>
          </div>
          <div class="metric-card">
            <span class="m-label">${i18n.t('inspect_dependents')} (FAN-IN)</span>
            <span class="m-val">${stat.fanIn}</span>
          </div>
          <div class="metric-card">
            <span class="m-label">FAN-OUT</span>
            <span class="m-val">${stat.fanOut}</span>
          </div>
          <div class="metric-card">
            <span class="m-label">LINES (LOC)</span>
            <span class="m-val">${stat.loc}</span>
          </div>
        </div>

        <div class="role-box">
          <strong>${i18n.t('inspect_role')}:</strong>
          <p>${this.getArchitecturalRoleDescription(node, stat, isEs)}</p>
        </div>

        <div class="risk-breakdown-box">
          <div class="risk-header-row">
            <span>${i18n.t('inspect_risk_eval')}</span>
            <strong class="${stat.riskScore > 60 ? 'risk-high' : 'risk-medium'}">${stat.riskScore}% RISK</strong>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill ${stat.riskScore > 60 ? 'risk-high' : ''}" style="width: ${stat.riskScore}%;"></div>
          </div>
          <div class="risk-reasons-list">
            <span>- ${stat.fanIn > 15 ? 'High fan-in coupling concentration' : 'Moderate dependency footprint'}</span>
            <span>- ${stat.isCyclic ? 'Entangled in circular dependency loops' : 'Linear unidirectional data flow'}</span>
            <span>- Instability index: ${stat.instability}%</span>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'dependencies') {
      return `
        <div class="deps-container">
          <div class="dep-section">
            <h4 class="dep-title">${i18n.t('inspect_called_by')} (${callers.length})</h4>
            <div class="dep-list">
              ${callers.length === 0 ? '<span class="empty-text">No callers (Dead Code candidate)</span>' : ''}
              ${callers.slice(0, 15).map(cId => {
                const cNode = this.state.graph.getNode(cId);
                return `<div class="dep-link-item" data-target-id="${cId}">[<] ${cNode?.name || cId}</div>`;
              }).join('')}
            </div>
          </div>

          <div class="dep-section" style="margin-top:14px;">
            <h4 class="dep-title">${i18n.t('inspect_depends_on')} (${deps.length})</h4>
            <div class="dep-list">
              ${deps.length === 0 ? '<span class="empty-text">No outgoing dependencies (Leaf utility)</span>' : ''}
              ${deps.slice(0, 15).map(dId => {
                const dNode = this.state.graph.getNode(dId);
                return `<div class="dep-link-item" data-target-id="${dId}">[>] ${dNode?.name || dId}</div>`;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'recommendations') {
      return `
        <div class="interventions-container" style="display:flex;flex-direction:column;gap:10px;">
          <div style="font-size:10px;font-weight:700;color:var(--accent-cyan);letter-spacing:0.05em;">
            [+] ${isEs ? 'ACCIONES RECOMENDADAS POR EL SISTEMA' : 'ACTIONABLE ARCHITECTURAL INTERVENTIONS'}
          </div>
          ${interventions.map(item => `
            <div class="intervention-card" style="background:rgba(10,16,28,0.85);border:1px solid ${item.priority === 'CRITICAL' || item.priority === 'HIGH' ? 'rgba(244,63,94,0.35)' : 'rgba(56,189,248,0.25)'};border-radius:4px;padding:10px 12px;display:flex;flex-direction:column;gap:4px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:10.5px;font-weight:700;color:#fff;">${item.title}</span>
                <span class="badge ${item.priority === 'CRITICAL' || item.priority === 'HIGH' ? 'threat-badge' : 'highlight'}">${item.priority}</span>
              </div>
              <div style="font-size:9.5px;color:var(--accent-cyan);">${item.principle}</div>
              <p style="font-size:10.5px;color:var(--text-secondary);margin:4px 0;line-height:1.4;">${item.action}</p>
              <div style="font-size:9.5px;color:var(--accent-emerald);border-top:1px solid rgba(30,41,59,0.5);padding-top:4px;">
                IMPACT: ${item.expectedImpact}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'simulation') {
      return `
        <div class="sim-tab-box">
          <p style="font-size:11px;color:var(--text-secondary);line-height:1.4;">
            ${isEs
              ? 'Ejecuta simulaciones hipoteticas no destructivas sobre este modulo para medir el radio de impacto y la reduccion de riesgo.'
              : 'Run non-destructive hypothetical simulations on this module to measure blast radius and architectural risk reduction.'}
          </p>
          <div class="sim-quick-actions" style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
            <button class="strategy-btn" onclick="document.getElementById('nav-whatif-btn')?.click()">
              [!] ${isEs ? 'SIMULAR APAGÓN EN CASCADA' : 'SIMULATE CASCADE BLACKOUT'}
            </button>
            <button class="strategy-btn" onclick="document.getElementById('nav-threats-btn')?.click()">
              [*] ${isEs ? 'SIMULAR DESACOPLAMIENTO' : 'SIMULATE DECOUPLING'}
            </button>
          </div>
        </div>
      `;
    }

    return '';
  }

  getArchitecturalRoleDescription(node, stat, isEs) {
    if (node.biome === 'core') {
      return isEs
        ? 'Modulo de orquestacion principal. Controla el flujo central de ejecucion y coordina los demas subsistemas.'
        : 'Primary orchestrator module. Controls execution pipeline and coordinates domain subsystems.';
    }
    if (node.biome === 'ui') {
      return isEs
        ? 'Capa de presentacion e interfaz. Responsable del renderizado de componentes y gestion del viewport.'
        : 'Presentation & viewport layer. Responsible for layout rendering and component lifecycle.';
    }
    if (node.biome === 'power') {
      return isEs
        ? 'Red de energia y estado. Administra la sincronizacion de eventos y mutaciones del estado global.'
        : 'State & power grid. Manages reactive stores, action dispatching, and state persistence bus.';
    }
    if (node.biome === 'bunker') {
      return isEs
        ? 'Bunker de persistencia. Almacenamiento seguro, base de datos e integracion de almacenamiento local.'
        : 'Persistence vault. Encapsulates storage engines, databases, and cached repositories.';
    }
    return isEs
      ? 'Componente funcional del sistema con responsabilidades acotadas.'
      : 'Functional system component with modular responsibilities.';
  }

  updateI18n() {}
}
