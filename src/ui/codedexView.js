/**
 * CodeDex Entity Registry Modal Controller.
 */

import { RARITY_CONFIG } from '../analysis/types.js';

export class CodeDexView {
  constructor(state, graph, analysis, world) {
    this.state = state;
    this.graph = graph;
    this.analysis = analysis;
    this.world = world;

    this.modal = document.getElementById('codedex-modal');
    this.grid = document.getElementById('codedex-grid');
    this.collectedStat = document.getElementById('codedex-collected-stat');
    this.completionPct = document.getElementById('codedex-completion-pct');
    this.searchInput = document.getElementById('codedex-search');
    this.rarityFilterChips = document.querySelectorAll('.rarity-filters .filter-chip');

    this.activeRarityFilter = 'all';
    this.searchQuery = '';

    this.initEvents();
  }

  initEvents() {
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderGrid();
    });

    this.rarityFilterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.rarityFilterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeRarityFilter = chip.getAttribute('data-rarity') || 'all';
        this.renderGrid();
      });
    });

    this.state.subscribe(() => {
      this.updateStats();
      if (!this.modal.classList.contains('hidden')) {
        this.renderGrid();
      }
    });
  }

  updateStats() {
    const kMetrics = this.state.knowledgeTracker.calculateKnowledgeMetrics(this.graph);
    this.collectedStat.textContent = `${kMetrics.discoveredCount} / ${kMetrics.totalCount}`;
    this.completionPct.textContent = `${kMetrics.discoveredPct}%`;
  }

  open() {
    this.modal.classList.remove('hidden');
    document.getElementById('modal-backdrop').classList.remove('hidden');
    this.updateStats();
    this.renderGrid();
  }

  close() {
    this.modal.classList.add('hidden');
    document.getElementById('modal-backdrop').classList.add('hidden');
  }

  renderGrid() {
    const allNodes = Array.from(this.graph.nodes.values());
    const filtered = allNodes.filter(node => {
      const stat = this.analysis.nodeStats.get(node.id);
      if (!stat) return false;

      if (this.activeRarityFilter !== 'all' && stat.rarity !== this.activeRarityFilter) {
        return false;
      }
      if (this.searchQuery && !node.name.toLowerCase().includes(this.searchQuery) && !node.path.toLowerCase().includes(this.searchQuery)) {
        return false;
      }
      return true;
    });

    // Sort by rarity score descending
    filtered.sort((a, b) => {
      const statA = this.analysis.nodeStats.get(a.id);
      const statB = this.analysis.nodeStats.get(b.id);
      return (statB?.rarityScore || 0) - (statA?.rarityScore || 0);
    });

    this.grid.innerHTML = filtered.map((node, idx) => {
      const stat = this.analysis.nodeStats.get(node.id);
      const isDiscovered = this.state.unlockedCodeDex.has(node.id);
      const rarityConf = RARITY_CONFIG[stat?.rarity] || RARITY_CONFIG.common;

      return `
        <div class="codedex-card" data-node-id="${node.id}" style="border-left: 3px solid ${rarityConf.color}">
          <div class="card-top">
            <span class="card-num">#${String(idx + 1).padStart(3, '0')}</span>
            <span class="rarity-tag rarity-${stat?.rarity}">${rarityConf.name.toUpperCase()}</span>
          </div>
          <div class="card-name">${isDiscovered ? node.name : '??? [UNDISCOVERED]'}</div>
          <div class="card-path">${isDiscovered ? node.path : 'Explore world to reveal location'}</div>
          <div class="card-stats">
            <span>CENTRALITY: <strong>${stat?.centralityPct}%</strong></span>
            <span>RISK: <strong>${stat?.riskScore}%</strong></span>
            <span>CALLS: <strong>${stat?.fanOut}</strong></span>
            <span>USED BY: <strong>${stat?.fanIn}</strong></span>
          </div>
        </div>
      `;
    }).join('');

    this.grid.querySelectorAll('.codedex-card').forEach(card => {
      card.addEventListener('click', () => {
        const nodeId = card.getAttribute('data-node-id');
        if (nodeId) {
          this.close();
          this.state.setSelectedNode(nodeId);
          const node = this.graph.getNode(nodeId);
          if (node) {
            this.world.camera.centerOn(node.x, node.y);
          }
        }
      });
    });
  }
}
