/**
 * Layered Entity Inspector Controller for CODEBASE.UNIVERSE.
 * Displays dedicated architectural inspection card upon clicking any building node.
 * Features close button [X], caller/dependency cross-links, and What-If simulation triggers.
 *
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

    this.container = document.getElementById('inspector-panel') || document.getElementById('entity-inspector');
    this.closeBtn = document.getElementById('close-inspector-btn');

    this.initElements();
    this.initEvents();
    this.subscribeState();
  }

  initElements() {
    this.elName = document.getElementById('inspect-entity-name');
    this.elPath = document.getElementById('inspect-entity-path');
    this.elRarity = document.getElementById('inspect-rarity-tag');
    this.elBiome = document.getElementById('inspect-biome-tag');
    this.elCentrality = document.getElementById('inspect-centrality');
    this.elImportance = document.getElementById('inspect-importance');
    this.elRisk = document.getElementById('inspect-risk');
    this.elComplexity = document.getElementById('inspect-complexity');
    this.elDependentsCount = document.getElementById('inspect-dependents-count');
    this.elDependenciesCount = document.getElementById('inspect-dependencies-count');
    this.elCallersList = document.getElementById('inspect-callers-list');
    this.elDepsList = document.getElementById('inspect-deps-list');
    this.elDiagnosis = document.getElementById('inspect-diagnosis-text');
    this.quickSimFailBtn = document.getElementById('quick-simulate-failure-btn');
    this.quickSimChangeBtn = document.getElementById('quick-simulate-change-btn');
  }

  initEvents() {
    this.closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      sfx.playClick();
      this.close();
    });

    // Keyboard ESC to close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    this.quickSimFailBtn?.addEventListener('click', () => {
      if (this.state.selectedNodeId) {
        sfx.playAlert();
        this.graphWorld?.effects?.triggerBlackoutCascade([this.state.selectedNodeId], this.state.graph);
      }
    });

    i18n.subscribe(() => {
      if (this.state.selectedNodeId) {
        this.renderNodeDetails(this.state.selectedNodeId);
      }
    });
  }

  subscribeState() {
    this.state.subscribe((event, data) => {
      if (event === 'node_selected') {
        if (data.nodeId) {
          this.state.knowledgeTracker?.markDiscovered(data.nodeId);
          this.open();
          this.renderNodeDetails(data.nodeId);
        } else {
          this.close();
        }
      }
    });
  }

  isOpen() {
    return this.container && !this.container.classList.contains('hidden');
  }

  open() {
    if (this.container) {
      this.container.classList.remove('hidden');
      sfx.playClick();
    }
  }

  close() {
    if (this.container) {
      this.container.classList.add('hidden');
    }
    if (this.state.selectedNodeId) {
      this.state.setSelectedNode(null);
    }
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

    if (this.elName) this.elName.textContent = node.name;
    if (this.elPath) this.elPath.textContent = node.path;
    
    if (this.elRarity) {
      this.elRarity.textContent = localizedRarity;
      this.elRarity.className = `rarity-tag rarity-${stat.rarity}`;
    }

    if (this.elBiome) {
      this.elBiome.textContent = localizedBiome;
    }

    if (this.elCentrality) this.elCentrality.textContent = `${stat.centralityPct}%`;
    if (this.elImportance) this.elImportance.textContent = (stat.importance || 0.5).toFixed(2);
    
    if (this.elRisk) {
      this.elRisk.textContent = `${stat.riskScore}%`;
      this.elRisk.className = `stat-val ${stat.riskScore > 65 ? 'risk-high' : stat.riskScore > 35 ? 'risk-medium' : 'risk-low'}`;
    }

    if (this.elComplexity) {
      this.elComplexity.textContent = `${stat.cyclomaticMass} (LOC: ${stat.loc})`;
    }

    if (this.elDependentsCount) this.elDependentsCount.textContent = callers.length;
    if (this.elDependenciesCount) this.elDependenciesCount.textContent = deps.length;

    // Render Callers List
    if (this.elCallersList) {
      if (callers.length === 0) {
        this.elCallersList.innerHTML = `<li class="empty-list">${i18n.currentLang === 'es' ? 'Sin llamadas entrantes (Nodo Raiz / Entrypoint)' : 'No inbound callers (Root / Entrypoint)'}</li>`;
      } else {
        this.elCallersList.innerHTML = callers.slice(0, 15).map(id => {
          const n = this.state.graph.getNode(id);
          const name = n ? n.name : id.split('/').pop();
          return `<li class="entity-link" data-node-id="${id}"><span class="link-arrow">&lt;-</span> ${name}</li>`;
        }).join('');

        this.elCallersList.querySelectorAll('.entity-link').forEach(el => {
          el.addEventListener('click', (e) => {
            const targetId = e.currentTarget.dataset.nodeId;
            this.state.setSelectedNode(targetId);
            const targetNode = this.state.graph.getNode(targetId);
            if (targetNode) this.camera.centerOn(targetNode.x, targetNode.y, 2.8);
          });
        });
      }
    }

    // Render Dependencies List
    if (this.elDepsList) {
      if (deps.length === 0) {
        this.elDepsList.innerHTML = `<li class="empty-list">${i18n.currentLang === 'es' ? 'Sin dependencias externas (Modulo Hoja)' : 'No external dependencies (Leaf Module)'}</li>`;
      } else {
        this.elDepsList.innerHTML = deps.slice(0, 15).map(id => {
          const n = this.state.graph.getNode(id);
          const name = n ? n.name : id.split('/').pop();
          return `<li class="entity-link" data-node-id="${id}"><span class="link-arrow">-&gt;</span> ${name}</li>`;
        }).join('');

        this.elDepsList.querySelectorAll('.entity-link').forEach(el => {
          el.addEventListener('click', (e) => {
            const targetId = e.currentTarget.dataset.nodeId;
            this.state.setSelectedNode(targetId);
            const targetNode = this.state.graph.getNode(targetId);
            if (targetNode) this.camera.centerOn(targetNode.x, targetNode.y, 2.8);
          });
        });
      }
    }

    // Diagnosis Text
    if (this.elDiagnosis) {
      if (stat.isCyclic) {
        this.elDiagnosis.textContent = i18n.currentLang === 'es'
          ? `ALERTA CRITICA: Este modulo participa en un bucle circular de dependencias (SCC). Romper esta circularidad reducira el riesgo en 35%.`
          : `CRITICAL ALERT: This module is part of a cyclic dependency loop (SCC). Breaking this cycle will reduce structural risk by 35%.`;
      } else if (stat.centralityPct >= 85) {
        this.elDiagnosis.textContent = i18n.currentLang === 'es'
          ? `LANDMARK CENTRAL: Modulo de alta centralidad (${stat.centralityPct}%). Un cambio aqui impacta directamente a ${callers.length} componentes del sistema.`
          : `CENTRAL LANDMARK: High centrality module (${stat.centralityPct}%). Breaking changes here directly cascade to ${callers.length} downstream components.`;
      } else {
        this.elDiagnosis.textContent = i18n.currentLang === 'es'
          ? `Modulo funcional estable. Nivel de acoplamiento controlado (${callers.length} entrantes, ${deps.length} salientes).`
          : `Stable functional module. Balanced coupling (${callers.length} inbound, ${deps.length} outbound).`;
      }
    }
  }
}
