/**
 * CodeDex Entity Registry Modal Controller for CODEBASE.UNIVERSE.
 */

import { RARITY_CONFIG } from '../analysis/types.js';
import { sfx } from '../audio/soundFX.js';
import { i18n } from '../i18n/translations.js';

export class CodeDexViewController {
  constructor(state, camera) {
    this.state = state;
    this.camera = camera;

    this.container = document.getElementById('codedex-modal');
    this.grid = document.getElementById('codedex-grid');
    this.searchInput = document.getElementById('codedex-search');
    this.rarityFilterChips = document.querySelectorAll('.rarity-filters .filter-chip');

    this.collectedStat = document.getElementById('codedex-collected-stat');
    this.completionPct = document.getElementById('codedex-completion-pct');

    this.activeRarity = 'all';
    this.searchTerm = '';

    this.initEvents();
    this.subscribeState();
    this.updateI18n();
  }

  initEvents() {
    this.searchInput?.addEventListener('input', (e) => {
      this.searchTerm = e.target.value.toLowerCase();
      this.renderGrid();
    });

    this.rarityFilterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        sfx.playClick();
        this.rarityFilterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeRarity = chip.getAttribute('data-rarity') || 'all';
        this.renderGrid();
      });
    });

    i18n.subscribe(() => {
      this.updateI18n();
      this.renderGrid();
    });
  }

  subscribeState() {
    this.state.subscribe((event, data) => {
      if (event === 'graph_loaded' || event === 'knowledge_updated') {
        this.updateStats();
        this.renderGrid();
      }
    });
  }

  updateStats() {
    const tracker = this.state.knowledgeTracker;
    if (!tracker) return;

    if (this.collectedStat) {
      this.collectedStat.textContent = `${tracker.discoveredNodes.size} / ${this.state.graph.nodes.size}`;
    }
    if (this.completionPct) {
      this.completionPct.textContent = `${tracker.getCompletionPercentage()}%`;
    }
  }

  renderGrid() {
    if (!this.grid || !this.state.graph || !this.state.analysis) return;

    const graph = this.state.graph;
    const analysis = this.state.analysis;
    const tracker = this.state.knowledgeTracker;

    const nodesList = Array.from(graph.nodes.values());

    const filtered = nodesList.filter(node => {
      const stat = analysis.nodeStats.get(node.id);
      if (!stat) return false;

      if (this.activeRarity !== 'all' && stat.rarity !== this.activeRarity) return false;
      if (this.searchTerm && !node.name.toLowerCase().includes(this.searchTerm) && !node.path.toLowerCase().includes(this.searchTerm)) {
        return false;
      }
      return true;
    });

    let index = 1;
    this.grid.innerHTML = filtered.map(node => {
      const stat = analysis.nodeStats.get(node.id);
      const isDiscovered = tracker?.discoveredNodes.has(node.id);
      const rarityKey = `rarity_${stat.rarity}`;
      const localizedRarity = i18n.t(rarityKey) || stat.rarity.toUpperCase();
      const rarityConf = RARITY_CONFIG[stat.rarity] || RARITY_CONFIG.common;
      const localizedBiome = i18n.t(`biome_${node.biome}`) || node.biome.toUpperCase();

      const numStr = String(index++).padStart(3, '0');

      return `
        <div class="codedex-card" data-node-id="${node.id}" style="border-left: 4px solid ${rarityConf.color}">
          <div class="card-top">
            <span class="card-num">[${numStr}]</span>
            <span class="rarity-tag rarity-${stat.rarity}">${localizedRarity}</span>
          </div>
          <div class="card-name" title="${node.name}">${isDiscovered ? node.name : i18n.t('codedex_undiscovered')}</div>
          <div class="card-path" title="${node.path}">${isDiscovered ? node.path : i18n.t('codedex_explore_hint')}</div>
          <div class="card-stats">
            <span>${i18n.t('inspect_centrality')}: <strong>${isDiscovered ? stat.centralityPct + '%' : '???'}</strong></span>
            <span>${i18n.t('stat_risk')}: <strong>${isDiscovered ? stat.riskScore + '%' : '???'}</strong></span>
            <span>FAN-IN: <strong>${isDiscovered ? stat.fanIn : '???'}</strong></span>
            <span>${localizedBiome}</span>
          </div>
        </div>
      `;
    }).join('');

    this.grid.querySelectorAll('.codedex-card').forEach(card => {
      card.addEventListener('click', () => {
        sfx.playClick();
        const nodeId = card.getAttribute('data-node-id');
        if (nodeId) {
          this.container?.classList.add('hidden');
          document.getElementById('modal-backdrop')?.classList.add('hidden');
          this.state.setSelectedNode(nodeId);
          const targetNode = graph.getNode(nodeId);
          if (targetNode) {
            this.camera.centerOn(targetNode.x, targetNode.y, 3.5);
          }
        }
      });
    });
  }

  updateI18n() {
    const title = document.getElementById('codedex-header-title');
    if (title) title.textContent = i18n.t('codedex_title');

    const lblCollected = document.getElementById('codedex-lbl-collected');
    if (lblCollected) lblCollected.textContent = i18n.t('codedex_collected');

    const lblCompletion = document.getElementById('codedex-lbl-completion');
    if (lblCompletion) lblCompletion.textContent = i18n.t('codedex_completion');

    if (this.searchInput) this.searchInput.placeholder = i18n.t('codedex_search_placeholder');
  }
}
