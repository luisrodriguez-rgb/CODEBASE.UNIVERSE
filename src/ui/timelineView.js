/**
 * Git Time Machine & Code Archaeology Controller for CODEBASE.UNIVERSE.
 * ZERO EMOJIS.
 */

import { generateGitEvolutionHistory } from '../analysis/history.js';
import { analyzeArchaeology } from '../analysis/archaeology.js';
import { sfx } from '../audio/soundFX.js';
import { i18n } from '../i18n/translations.js';

export class TimelineViewController {
  constructor(state, graphWorld) {
    this.state = state;
    this.graphWorld = graphWorld;

    this.drawer = document.getElementById('timeline-drawer');
    this.closeBtn = document.getElementById('close-timeline-btn');

    this.prevBtn = document.getElementById('timeline-prev-btn');
    this.playBtn = document.getElementById('timeline-play-btn');
    this.nextBtn = document.getElementById('timeline-next-btn');
    this.speedSelect = document.getElementById('timeline-speed-select');
    this.slider = document.getElementById('timeline-slider');

    this.hashEl = document.getElementById('current-commit-hash');
    this.dateEl = document.getElementById('current-commit-date');
    this.genEl = document.getElementById('tl-stat-gen');
    this.nodesEl = document.getElementById('tl-stat-nodes');
    this.edgesEl = document.getElementById('tl-stat-edges');
    this.healthEl = document.getElementById('tl-stat-health');
    this.noteEl = document.getElementById('tl-stat-note');

    this.archaeologyContainer = document.getElementById('timeline-archaeology-box');

    this.timeline = [];
    this.archaeologyData = null;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.playbackInterval = null;
    this.speed = 1;

    this.initEvents();
    this.subscribeState();
    this.updateI18n();
  }

  initEvents() {
    this.closeBtn?.addEventListener('click', () => {
      sfx.playClick();
      this.pause();
      this.drawer?.classList.add('hidden');
    });

    this.prevBtn?.addEventListener('click', () => {
      sfx.playClick();
      this.step(-1);
    });

    this.nextBtn?.addEventListener('click', () => {
      sfx.playClick();
      this.step(1);
    });

    this.playBtn?.addEventListener('click', () => {
      sfx.playClick();
      this.togglePlay();
    });

    this.speedSelect?.addEventListener('change', (e) => {
      this.speed = parseFloat(e.target.value) || 1;
      if (this.isPlaying) {
        this.pause();
        this.play();
      }
    });

    this.slider?.addEventListener('input', (e) => {
      const idx = parseInt(e.target.value, 10);
      this.goToIndex(idx);
    });

    i18n.subscribe(() => {
      this.updateI18n();
    });
  }

  subscribeState() {
    this.state.subscribe((event, data) => {
      if (event === 'graph_loaded') {
        this.timeline = generateGitEvolutionHistory(this.state.graph, this.state.analysis);
        this.archaeologyData = analyzeArchaeology(this.state.graph, this.state.analysis);
        this.currentIndex = this.timeline.length - 1;
        if (this.slider) {
          this.slider.max = this.timeline.length - 1;
          this.slider.value = this.currentIndex;
        }
        this.renderCurrentCommit();
        this.renderArchaeologyRelics();
      }
    });
  }

  step(delta) {
    const newIdx = Math.max(0, Math.min(this.timeline.length - 1, this.currentIndex + delta));
    this.goToIndex(newIdx);
  }

  goToIndex(idx) {
    this.currentIndex = idx;
    if (this.slider) this.slider.value = idx;
    this.renderCurrentCommit();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.isPlaying = true;
    if (this.playBtn) {
      this.playBtn.textContent = i18n.t('btn_pause');
      this.playBtn.classList.add('highlight');
    }
    const intervalMs = 1200 / this.speed;
    this.playbackInterval = setInterval(() => {
      if (this.currentIndex >= this.timeline.length - 1) {
        this.currentIndex = 0;
      } else {
        this.currentIndex++;
      }
      this.goToIndex(this.currentIndex);
    }, intervalMs);
  }

  pause() {
    this.isPlaying = false;
    if (this.playBtn) {
      this.playBtn.textContent = i18n.t('btn_play');
      this.playBtn.classList.remove('highlight');
    }
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    }
  }

  renderCurrentCommit() {
    const commit = this.timeline[this.currentIndex];
    if (!commit) return;

    if (this.hashEl) this.hashEl.textContent = `COMMIT: ${commit.hash}`;
    if (this.dateEl) this.dateEl.textContent = commit.date;
    if (this.genEl) this.genEl.textContent = `GEN ${commit.generation} / ${this.timeline.length}`;
    if (this.nodesEl) this.nodesEl.textContent = commit.nodeCount;
    if (this.edgesEl) this.edgesEl.textContent = commit.edgeCount;
    if (this.healthEl) this.healthEl.textContent = `${commit.healthScore}%`;
    if (this.noteEl) this.noteEl.textContent = commit.message;
  }

  renderArchaeologyRelics() {
    if (!this.archaeologyContainer || !this.archaeologyData) return;
    const isEs = i18n.currentLang === 'es';
    const relics = this.archaeologyData.relics.slice(0, 10);

    this.archaeologyContainer.innerHTML = `
      <div style="font-size:10px;font-weight:700;color:var(--accent-cyan);letter-spacing:0.05em;margin-bottom:6px;">
        [+] ${isEs ? 'ARQUEOLOGÍA DE CÓDIGO // RELIQUIAS Y FÓSILES' : 'CODE ARCHAEOLOGY // HISTORIC RELICS'}
      </div>
      <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;">
        ${relics.map(r => `
          <div class="relic-card-chip" data-node-id="${r.id}" style="background:rgba(15,23,42,0.8);border:1px solid rgba(56,189,248,0.25);padding:4px 8px;border-radius:3px;font-size:9.5px;cursor:pointer;white-space:nowrap;">
            <span style="color:var(--accent-amber);font-weight:700;">${r.relicBadge}</span>
            <span style="color:#fff;margin-left:4px;">${r.name}</span>
          </div>
        `).join('')}
      </div>
    `;

    this.archaeologyContainer.querySelectorAll('.relic-card-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        sfx.playClick();
        const nId = chip.getAttribute('data-node-id');
        if (nId) {
          this.state.setSelectedNode(nId);
          const node = this.state.graph.getNode(nId);
          if (node) {
            this.graphWorld.camera.centerOn(node.x, node.y, 3.5);
          }
        }
      });
    });
  }

  updateI18n() {
    const title = document.getElementById('timeline-header-title');
    if (title) title.textContent = i18n.t('timeline_title');

    const prevBtn = document.getElementById('timeline-prev-btn');
    if (prevBtn) prevBtn.textContent = i18n.t('btn_prev');

    if (!this.isPlaying && this.playBtn) this.playBtn.textContent = i18n.t('btn_play');
    if (this.isPlaying && this.playBtn) this.playBtn.textContent = i18n.t('btn_pause');

    const nextBtn = document.getElementById('timeline-next-btn');
    if (nextBtn) nextBtn.textContent = i18n.t('btn_next');

    const lblEvolution = document.getElementById('tl-lbl-evolution');
    if (lblEvolution) lblEvolution.textContent = i18n.t('tl_evolution');

    const lblEntities = document.getElementById('tl-lbl-entities');
    if (lblEntities) lblEntities.textContent = i18n.t('tl_entities');

    const lblConnections = document.getElementById('tl-lbl-connections');
    if (lblConnections) lblConnections.textContent = i18n.t('tl_connections');

    const lblHealth = document.getElementById('tl-lbl-health');
    if (lblHealth) lblHealth.textContent = i18n.t('tl_health');
  }
}
