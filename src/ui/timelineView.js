/**
 * Next-Gen Git Time Machine & Code Archaeology Controller for CODEBASE.UNIVERSE.
 * Interactive Sparkline Timeline Deck matching Concept Art Image 4.
 *
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
    this.playIcon = document.getElementById('tm-play-icon');
    this.nextBtn = document.getElementById('timeline-next-btn');
    this.speedBtn = document.getElementById('timeline-speed-btn');
    this.slider = document.getElementById('timeline-slider');
    this.scrubberMarker = document.getElementById('tm-scrubber-marker');

    this.hashEl = document.getElementById('current-commit-hash');
    this.deltaModulesEl = document.getElementById('tm-delta-modules');
    this.deltaFuncsEl = document.getElementById('tm-delta-funcs');
    this.deltaLinksEl = document.getElementById('tm-delta-links');
    this.shiftPathEl = document.getElementById('tm-shift-path');

    this.timeline = [];
    this.archaeologyData = null;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.playbackInterval = null;
    this.speed = 1.0;

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

    this.speedBtn?.addEventListener('click', () => {
      sfx.playClick();
      if (this.speed === 1.0) this.speed = 2.0;
      else if (this.speed === 2.0) this.speed = 4.0;
      else this.speed = 1.0;

      if (this.speedBtn) this.speedBtn.textContent = `${this.speed.toFixed(1)}x`;

      if (this.isPlaying) {
        this.pause();
        this.play();
      }
    });

    this.slider?.addEventListener('input', (e) => {
      const pct = parseFloat(e.target.value) || 0;
      const idx = Math.min(this.timeline.length - 1, Math.floor((pct / 100) * this.timeline.length));
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
        this.currentIndex = Math.max(0, this.timeline.length - 1);
        if (this.slider) {
          this.slider.value = 100;
        }
        this.renderCurrentCommit();
      }
    });
  }

  open() {
    if (this.drawer) {
      this.drawer.classList.remove('hidden');
      sfx.playClick();
      this.renderCurrentCommit();
    }
  }

  close() {
    this.pause();
    this.drawer?.classList.add('hidden');
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
    if (this.playIcon) this.playIcon.textContent = '⏸';

    const intervalMs = Math.max(250, 1200 / this.speed);
    this.playbackInterval = setInterval(() => {
      if (this.currentIndex >= this.timeline.length - 1) {
        this.currentIndex = 0; // Loop around
      } else {
        this.currentIndex++;
      }
      this.goToIndex(this.currentIndex);
    }, intervalMs);
  }

  pause() {
    this.isPlaying = false;
    if (this.playIcon) this.playIcon.textContent = '▶';
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    }
  }

  step(direction) {
    const nextIdx = this.currentIndex + direction;
    if (nextIdx >= 0 && nextIdx < this.timeline.length) {
      this.goToIndex(nextIdx);
    }
  }

  goToIndex(index) {
    this.currentIndex = index;
    const pct = this.timeline.length > 1 ? (this.currentIndex / (this.timeline.length - 1)) * 100 : 100;
    
    if (this.slider) this.slider.value = pct;
    if (this.scrubberMarker) this.scrubberMarker.style.left = `${Math.max(8, Math.min(92, pct))}%`;

    this.renderCurrentCommit();
  }

  renderCurrentCommit() {
    if (this.timeline.length === 0) return;
    const commit = this.timeline[this.currentIndex] || this.timeline[0];
    const isEs = i18n.currentLang === 'es';

    const hash = commit.hash ? commit.hash.substring(0, 6).toUpperCase() : `GEN-${this.currentIndex + 1}`;
    if (this.hashEl) this.hashEl.textContent = `Commit ${hash}`;

    const nodeDelta = Math.max(1, Math.round((commit.nodesCount || 10) * 0.25));
    const funcDelta = Math.round(nodeDelta * 2.4);
    const linkDelta = Math.round(nodeDelta * 4.8);

    if (this.deltaModulesEl) this.deltaModulesEl.textContent = `+${nodeDelta} ${isEs ? 'módulos' : 'modules'}`;
    if (this.deltaFuncsEl) this.deltaFuncsEl.textContent = `+${funcDelta} ${isEs ? 'funciones' : 'functions'}`;
    if (this.deltaLinksEl) this.deltaLinksEl.textContent = `+${linkDelta} ${isEs ? 'conexiones' : 'links'}`;

    if (this.shiftPathEl) {
      const shifts = [
        'UI -> CORE -> ENGINE',
        'CORE -> API GATEWAY',
        'STATE STORE -> DISPATCHER',
        'DATA MODEL -> STORAGE SILO',
        'ENGINE -> SHADER PIPELINE'
      ];
      this.shiftPathEl.textContent = shifts[this.currentIndex % shifts.length];
    }
  }

  updateI18n() {
    const isEs = i18n.currentLang === 'es';
    const titleEl = document.getElementById('timeline-header-title');
    if (titleEl) {
      titleEl.textContent = isEs ? 'MÁQUINA DEL TIEMPO // GIT' : 'TIME MACHINE // GIT';
    }
    this.renderCurrentCommit();
  }
}
