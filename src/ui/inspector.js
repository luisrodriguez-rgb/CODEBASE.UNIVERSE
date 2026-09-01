/**
 * Side Inspector Drawer Controller for CODEBASE.UNIVERSE.
 */

import { RARITY_CONFIG, BIOME_CONFIG } from '../analysis/types.js';
import { sfx } from '../audio/soundFX.js';
import { i18n } from '../i18n/translations.js';

export class InspectorController {
  constructor(state, camera) {
    this.state = state;
    this.camera = camera;

    this.panel = document.getElementById('inspector-panel');
    this.closeBtn = document.getElementById('close-inspector-btn');

    this.rarityTag = document.getElementById('inspect-rarity-tag');
    this.biomeTag = document.getElementById('inspect-biome-tag');
    this.nameEl = document.getElementById('inspect-entity-name');
    this.pathEl = document.getElementById('inspect-entity-path');

    this.centralityEl = document.getElementById('inspect-centrality');
    this.importanceEl = document.getElementById('inspect-importance');
    this.riskEl = document.getElementById('inspect-risk');
    this.complexityEl = document.getElementById('inspect-complexity');
    this.dependentsCountEl = document.getElementById('inspect-dependents-count');
    this.dependenciesCountEl = document.getElementById('inspect-dependencies-count');

    this.callersList = document.getElementById('inspect-callers-list');
    this.callersCount = document.getElementById('inspect-callers-count');
    this.depsList = document.getElementById('inspect-deps-list');
    this.depsCount = document.getElementById('inspect-deps-count');

    this.diagnosisBox = document.getElementById('inspect-diagnosis-text');

    this.simFailureBtn = document.getElementById('quick-simulate-failure-btn');
    this.simChangeBtn = document.getElementById('quick-simulate-change-btn');

    this.initEvents();
    this.subscribeState();
    this.updateI18n();
  }

  initEvents() {
    this.closeBtn?.addEventListener('click', () => {
      sfx.playClick();
      this.close();
    });

    this.simFailureBtn?.addEventListener('click', () => {
      sfx.playAlarm();
      const nodeId = this.state.selectedNodeId;
      if (nodeId) {
        this.close();
        document.getElementById('nav-whatif-btn')?.click();
        const select = document.getElementById('whatif-target-node');
        if (select) select.value = nodeId;
        document.getElementById('run-simulation-btn')?.click();
      }
    });

    this.simChangeBtn?.addEventListener('click', () => {
      sfx.playAlarm();
      const nodeId = this.state.selectedNodeId;
      if (nodeId) {
        this.close();
        document.getElementById('nav-whatif-btn')?.click();
        const select = document.getElementById('whatif-target-node');
        const scenarioSelect = document.getElementById('whatif-simulation-type');
        if (select) select.value = nodeId;
        if (scenarioSelect) scenarioSelect.value = 'contract_change';
        document.getElementById('run-simulation-btn')?.click();
      }
    });

    i18n.subscribe(() => {
      this.updateI18n();
      if (this.state.selectedNodeId) {
        this.renderNode(this.state.selectedNodeId);
      }
    });
  }

  subscribeState() {
    this.state.subscribe((event, data) => {
      if (event === 'node_selected') {
        if (data.nodeId) {
          sfx.playDiscovery();
          this.open();
          this.renderNode(data.nodeId);
        } else {
          this.close();
        }
      }
    });
  }

  open() {
    this.panel?.classList.remove('hidden');
  }

  close() {
    this.panel?.classList.add('hidden');
    this.state.setSelectedNode(null);
  }

  renderNode(nodeId) {
    const graph = this.state.graph;
    const analysis = this.state.analysis;
    if (!graph || !analysis) return;

    const node = graph.getNode(nodeId);
    const stat = analysis.nodeStats.get(nodeId);
    if (!node || !stat) return;

    // Header & Tags
    const rarityConf = RARITY_CONFIG[stat.rarity] || RARITY_CONFIG.common;
    const biomeConf = BIOME_CONFIG[node.biome] || BIOME_CONFIG.core;

    const localizedRarity = i18n.t(`rarity_${stat.rarity}`) || stat.rarity.toUpperCase();
    const localizedBiome = i18n.t(`biome_${node.biome}`) || node.biome.toUpperCase();

    if (this.rarityTag) {
      this.rarityTag.textContent = localizedRarity;
      this.rarityTag.className = `rarity-tag rarity-${stat.rarity}`;
    }

    if (this.biomeTag) {
      this.biomeTag.textContent = localizedBiome;
      this.biomeTag.style.borderColor = biomeConf.color;
      this.biomeTag.style.color = biomeConf.color;
    }

    if (this.nameEl) this.nameEl.textContent = node.name;
    if (this.pathEl) this.pathEl.textContent = node.path;

    // Numerical Metrics
    if (this.centralityEl) this.centralityEl.textContent = `${stat.centralityPct}%`;
    if (this.importanceEl) this.importanceEl.textContent = stat.importance.toFixed(3);
    
    if (this.riskEl) {
      this.riskEl.textContent = `${stat.riskScore}%`;
      this.riskEl.className = `stat-val ${stat.riskScore > 65 ? 'risk-high' : stat.riskScore > 35 ? 'risk-medium' : 'risk-low'}`;
    }

    if (this.complexityEl) this.complexityEl.textContent = `${stat.cyclomaticMass} pts`;
    if (this.dependentsCountEl) this.dependentsCountEl.textContent = stat.fanIn;
    if (this.dependenciesCountEl) this.dependenciesCountEl.textContent = stat.fanOut;

    // Callers List
    const callers = graph.getDependents(nodeId);
    if (this.callersCount) this.callersCount.textContent = callers.length;
    if (this.callersList) {
      this.callersList.innerHTML = callers.slice(0, 30).map(cId => {
        const cNode = graph.getNode(cId);
        return `<li class="entity-link-item" data-node-id="${cId}">
          <span>${cNode ? cNode.name : cId}</span>
          <span style="color:var(--text-muted);font-size:9.5px">${cNode?.biome || ''}</span>
        </li>`;
      }).join('');

      this.callersList.querySelectorAll('.entity-link-item').forEach(item => {
        item.addEventListener('click', () => {
          sfx.playClick();
          const targetId = item.getAttribute('data-node-id');
          this.state.setSelectedNode(targetId);
          const tgt = graph.getNode(targetId);
          if (tgt) this.camera.centerOn(tgt.x, tgt.y, 3.2);
        });
      });
    }

    // Dependencies List
    const deps = graph.getDependencies(nodeId);
    if (this.depsCount) this.depsCount.textContent = deps.length;
    if (this.depsList) {
      this.depsList.innerHTML = deps.slice(0, 30).map(dId => {
        const dNode = graph.getNode(dId);
        return `<li class="entity-link-item" data-node-id="${dId}">
          <span>${dNode ? dNode.name : dId}</span>
          <span style="color:var(--text-muted);font-size:9.5px">${dNode?.biome || ''}</span>
        </li>`;
      }).join('');

      this.depsList.querySelectorAll('.entity-link-item').forEach(item => {
        item.addEventListener('click', () => {
          sfx.playClick();
          const targetId = item.getAttribute('data-node-id');
          this.state.setSelectedNode(targetId);
          const tgt = graph.getNode(targetId);
          if (tgt) this.camera.centerOn(tgt.x, tgt.y, 3.2);
        });
      });
    }

    // Diagnosis
    if (this.diagnosisBox) {
      const isBoss = stat.archetype === 'threat_boss';
      const isCyclic = stat.isCyclic;

      if (isBoss) {
        this.diagnosisBox.textContent = i18n.currentLang === 'es'
          ? `AMENAZA ARQUITECTÓNICA CRÍTICA: Concentra más del 90% de las rutas de ejecución del repositorio con ${stat.fanIn} dependientes. Candidato prioritario para desacoplamiento.`
          : `CRITICAL ARCHITECTURAL THREAT: Controls over 90% of repo execution paths with ${stat.fanIn} inbound dependents. Prime candidate for modular extraction.`;
        this.diagnosisBox.style.borderColor = 'rgba(244, 63, 94, 0.4)';
      } else if (isCyclic) {
        this.diagnosisBox.textContent = i18n.currentLang === 'es'
          ? `ANOMALÍA CIRCULAR: Forma parte de un ciclo fuertemente conectado (SCC). Dificulta el testing aislado y bloquea el tree-shaking.`
          : `CIRCULAR ANOMALY: Trapped in a strongly connected component (SCC) loop. Hinders isolated unit tests and breaks tree-shaking.`;
        this.diagnosisBox.style.borderColor = 'rgba(245, 158, 11, 0.4)';
      } else {
        this.diagnosisBox.textContent = i18n.currentLang === 'es'
          ? `Módulo estructural estándar con acoplamiento balanceado (${stat.fanIn} dependientes, ${stat.fanOut} dependencias).`
          : `Standard structural module with balanced coupling (${stat.fanIn} inbound, ${stat.fanOut} outbound).`;
        this.diagnosisBox.style.borderColor = 'rgba(56, 189, 248, 0.25)';
      }
    }
  }

  updateI18n() {
    const lblCentrality = document.getElementById('inspect-lbl-centrality');
    if (lblCentrality) lblCentrality.textContent = i18n.t('inspect_centrality');

    const lblImportance = document.getElementById('inspect-lbl-importance');
    if (lblImportance) lblImportance.textContent = i18n.t('inspect_importance');

    const lblRisk = document.getElementById('inspect-lbl-risk');
    if (lblRisk) lblRisk.textContent = i18n.t('inspect_risk');

    const lblComplexity = document.getElementById('inspect-lbl-complexity');
    if (lblComplexity) lblComplexity.textContent = i18n.t('inspect_complexity');

    const lblDependents = document.getElementById('inspect-lbl-dependents');
    if (lblDependents) lblDependents.textContent = i18n.t('inspect_dependents');

    const lblDependencies = document.getElementById('inspect-lbl-dependencies');
    if (lblDependencies) lblDependencies.textContent = i18n.t('inspect_dependencies');

    const lblKnowledge = document.getElementById('inspect-lbl-knowledge');
    if (lblKnowledge) lblKnowledge.textContent = i18n.t('inspect_knowledge');

    const lblCallers = document.getElementById('inspect-lbl-callers');
    if (lblCallers) lblCallers.textContent = i18n.t('inspect_callers');

    const lblDeps = document.getElementById('inspect-lbl-deps');
    if (lblDeps) lblDeps.textContent = i18n.t('inspect_deps');

    const lblDiagnosis = document.getElementById('inspect-lbl-diagnosis');
    if (lblDiagnosis) lblDiagnosis.textContent = i18n.t('inspect_diagnosis');

    if (this.simFailureBtn) this.simFailureBtn.textContent = i18n.t('btn_sim_failure');
    if (this.simChangeBtn) this.simChangeBtn.textContent = i18n.t('btn_sim_change');
  }
}
