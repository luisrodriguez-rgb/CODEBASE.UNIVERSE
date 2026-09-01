/**
 * Side Sliding Inspection Drawer Controller.
 */

import { RARITY_CONFIG, BIOME_CONFIG } from '../analysis/types.js';

export class InspectorUI {
  constructor(state, graph, analysis, world) {
    this.state = state;
    this.graph = graph;
    this.analysis = analysis;
    this.world = world;

    this.panel = document.getElementById('inspector-panel');
    this.closeBtn = document.getElementById('close-inspector-btn');

    this.rarityTag = document.getElementById('inspect-rarity-tag');
    this.biomeTag = document.getElementById('inspect-biome-tag');
    this.entityName = document.getElementById('inspect-entity-name');
    this.entityPath = document.getElementById('inspect-entity-path');

    this.statCentrality = document.getElementById('inspect-centrality');
    this.statImportance = document.getElementById('inspect-importance');
    this.statRisk = document.getElementById('inspect-risk');
    this.statComplexity = document.getElementById('inspect-complexity');
    this.statDependents = document.getElementById('inspect-dependents-count');
    this.statDependencies = document.getElementById('inspect-dependencies-count');

    this.tagDiscovered = document.getElementById('tag-discovered');
    this.tagUnderstood = document.getElementById('tag-understood');
    this.tagMastered = document.getElementById('tag-mastered');

    this.callersList = document.getElementById('inspect-callers-list');
    this.depsList = document.getElementById('inspect-deps-list');
    this.callersCount = document.getElementById('inspect-callers-count');
    this.depsCount = document.getElementById('inspect-deps-count');

    this.diagnosisText = document.getElementById('inspect-diagnosis-text');

    this.simFailureBtn = document.getElementById('quick-simulate-failure-btn');
    this.simChangeBtn = document.getElementById('quick-simulate-change-btn');

    this.initEvents();
  }

  initEvents() {
    this.closeBtn.addEventListener('click', () => {
      this.state.setSelectedNode(null);
    });

    this.simFailureBtn.addEventListener('click', () => {
      if (this.state.selectedNodeId) {
        window.dispatchEvent(new CustomEvent('open-whatif-sim', {
          detail: { targetId: this.state.selectedNodeId, scenario: 'failure' }
        }));
      }
    });

    this.simChangeBtn.addEventListener('click', () => {
      if (this.state.selectedNodeId) {
        window.dispatchEvent(new CustomEvent('open-whatif-sim', {
          detail: { targetId: this.state.selectedNodeId, scenario: 'contract_change' }
        }));
      }
    });

    this.state.subscribe(() => this.render());
  }

  render() {
    const nodeId = this.state.selectedNodeId;
    if (!nodeId) {
      this.panel.classList.add('hidden');
      return;
    }

    const node = this.graph.getNode(nodeId);
    const stat = this.analysis.nodeStats.get(nodeId);
    if (!node || !stat) {
      this.panel.classList.add('hidden');
      return;
    }

    this.panel.classList.remove('hidden');

    const rarityConf = RARITY_CONFIG[stat.rarity] || RARITY_CONFIG.common;
    const biomeConf = BIOME_CONFIG[node.biome] || BIOME_CONFIG.core;

    this.rarityTag.textContent = rarityConf.name.toUpperCase();
    this.rarityTag.className = `rarity-tag rarity-${stat.rarity}`;

    this.biomeTag.textContent = biomeConf.name.toUpperCase();
    this.entityName.textContent = node.name;
    this.entityPath.textContent = node.path;

    this.statCentrality.textContent = `${stat.centralityPct}% (Ranked)`;
    this.statImportance.textContent = (stat.betweenness).toFixed(3);
    
    this.statRisk.textContent = `${stat.riskScore}%`;
    this.statRisk.className = `stat-val ${stat.riskScore > 65 ? 'risk-high' : stat.riskScore > 35 ? 'risk-medium' : 'risk-low'}`;

    this.statComplexity.textContent = `LOC ${stat.loc} | CYCLO ${stat.cyclomatic}`;
    this.statDependents.textContent = String(stat.fanIn);
    this.statDependencies.textContent = String(stat.fanOut);

    // Knowledge Tags
    this.tagDiscovered.className = `k-tag ${this.state.knowledgeTracker.discovered.has(nodeId) ? 'active' : ''}`;
    this.tagUnderstood.className = `k-tag ${this.state.knowledgeTracker.understood.has(nodeId) ? 'active' : ''}`;
    this.tagMastered.className = `k-tag ${this.state.knowledgeTracker.mastered.has(nodeId) ? 'active' : ''}`;

    // Callers / Inbound
    const callers = this.graph.getDependents(nodeId);
    this.callersCount.textContent = String(callers.length);
    this.callersList.innerHTML = callers.map(id => {
      const callerNode = this.graph.getNode(id);
      return `<li class="entity-link-item" data-node-id="${id}">
        <span>${callerNode?.name || id}</span>
        <span style="color:var(--text-muted)">${callerNode?.biome || 'core'}</span>
      </li>`;
    }).join('') || '<li style="padding:6px; color:var(--text-muted); font-size:10px;">No inbound dependents (Leaf/Entry)</li>';

    // Dependencies / Outbound
    const deps = this.graph.getDependencies(nodeId);
    this.depsCount.textContent = String(deps.length);
    this.depsList.innerHTML = deps.map(id => {
      const depNode = this.graph.getNode(id);
      return `<li class="entity-link-item" data-node-id="${id}">
        <span>${depNode?.name || id}</span>
        <span style="color:var(--text-muted)">${depNode?.biome || 'core'}</span>
      </li>`;
    }).join('') || '<li style="padding:6px; color:var(--text-muted); font-size:10px;">No outbound dependencies</li>';

    // Attach click events on link items
    this.panel.querySelectorAll('.entity-link-item').forEach(el => {
      el.addEventListener('click', () => {
        const targetId = el.getAttribute('data-node-id');
        if (targetId) {
          this.state.setSelectedNode(targetId);
          const targetNode = this.graph.getNode(targetId);
          if (targetNode) {
            this.world.camera.centerOn(targetNode.x, targetNode.y);
          }
        }
      });
    });

    // Diagnosis Text
    if (stat.archetype === 'threat_boss') {
      this.diagnosisText.textContent = `CRITICAL ARCHITECTURAL THREAT: Severe dependency bottleneck. ${stat.fanIn} modules depend directly on this entity with ${stat.instability}% instability coefficient.`;
    } else if (stat.isCyclic) {
      this.diagnosisText.textContent = `ANOMALY DETECTED: Entangled in circular dependency loop. Modifications may cause cyclic feedback failures.`;
    } else if (stat.archetype === 'healthy_core') {
      this.diagnosisText.textContent = `HEALTHY CORE: Highly central architectural pillar with stable encapsulation and low coupling volatility.`;
    } else {
      this.diagnosisText.textContent = `Standard structural entity in ${biomeConf.name}. Stable blast footprint.`;
    }
  }
}
