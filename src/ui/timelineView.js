/**
 * Next-Gen Git Time Machine & Code Archaeology Controller for CODEBASE.UNIVERSE.
 * Interactive Sparkline Timeline Deck matching Concept Art Image 4.
 *
 * Features:
 * - Live 2.5D World Synchronization: Watch the citadel grow commit by commit!
 * - Purpose and Value Explanation for software architects
 * - Commit Dossier: Message, Author, Date, and Health Score Gauge
 * - Quick Era Jump Chips (2024 Genesis -> 2026 Current HEAD)
 * - Playback Cluster with loop, speed toggle, and step controls
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

    this.purposeBanner = document.getElementById('tm-purpose-banner');
    this.hashEl = document.getElementById('current-commit-hash');
    this.dateEl = document.getElementById('current-commit-date');
    this.authorEl = document.getElementById('current-commit-author');
    this.msgEl = document.getElementById('current-commit-msg');
    this.healthValEl = document.getElementById('tl-stat-health');
    this.healthBadgeEl = document.getElementById('tl-stat-health-badge');
    this.populationFillEl = document.getElementById('tm-population-fill');
    this.activeNodesStatEl = document.getElementById('tm-active-nodes-stat');
    this.commitTagEl = document.getElementById('current-commit-tag');

    this.deltaModulesEl = document.getElementById('tm-delta-modules');
    this.deltaFuncsEl = document.getElementById('tm-delta-funcs');
    this.deltaLinksEl = document.getElementById('tm-delta-links');
    this.shiftPathEl = document.getElementById('tm-shift-path');
    this.eraChips = document.querySelectorAll('.era-chip');

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
      this.close();
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

    this.eraChips.forEach(chip => {
      chip.addEventListener('click', () => {
        sfx.playClick();
        const genIdx = parseInt(chip.getAttribute('data-gen'), 10) || 0;
        this.goToIndex(Math.min(this.timeline.length - 1, genIdx));
      });
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
    // Restore full present-day world
    this.state.setTimelineCommit(null);
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

    const intervalMs = Math.max(250, 1400 / this.speed);
    this.playbackInterval = setInterval(() => {
      if (this.currentIndex >= this.timeline.length - 1) {
        this.currentIndex = 0; // Loop around to Genesis
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

    // Highlight active era chip
    this.eraChips.forEach(chip => {
      const g = parseInt(chip.getAttribute('data-gen'), 10);
      chip.classList.toggle('active', Math.abs(g - index) <= 1);
    });

    const commit = this.timeline[this.currentIndex];
    // Sync with Reactive Game State & World Canvas!
    this.state.setTimelineCommit(commit);

    this.renderCurrentCommit();
  }

  renderCurrentCommit() {
    if (this.timeline.length === 0) return;
    const commit = this.timeline[this.currentIndex] || this.timeline[0];
    const isEs = i18n.currentLang === 'es';

    const hash = commit.hash ? commit.hash.substring(0, 6).toUpperCase() : `GEN-${this.currentIndex + 1}`;
    
    if (this.hashEl) this.hashEl.textContent = `Commit ${hash}`;
    if (this.commitTagEl) this.commitTagEl.textContent = `Commit ${hash}`;
    if (this.dateEl) this.dateEl.textContent = commit.date || '2024-03-15';
    if (this.authorEl) this.authorEl.textContent = commit.author || 'architect';
    if (this.msgEl) this.msgEl.textContent = `"${commit.message || 'Architectural structural evolution'}"`;

    // Health Score Bar
    const health = commit.healthScore || 75;
    if (this.healthValEl) this.healthValEl.textContent = `${health}%`;
    if (this.healthBadgeEl) {
      if (health >= 75) {
        this.healthBadgeEl.textContent = isEs ? '[ESTABLE]' : '[STABLE]';
        this.healthBadgeEl.className = 'health-badge good';
      } else if (health >= 60) {
        this.healthBadgeEl.textContent = isEs ? '[ALERTA]' : '[WARNING]';
        this.healthBadgeEl.className = 'health-badge warn';
      } else {
        this.healthBadgeEl.textContent = isEs ? '[DEUDA ALTA]' : '[HIGH DEBT]';
        this.healthBadgeEl.className = 'health-badge debt';
      }
    }

    // Population & Node Count
    const totalGraphNodes = this.state.graph?.nodes.size || 500;
    const activeCount = commit.nodeCount || Math.round(totalGraphNodes * ((this.currentIndex + 1) / this.timeline.length));
    const popPct = Math.min(100, Math.round((activeCount / totalGraphNodes) * 100));

    if (this.populationFillEl) this.populationFillEl.style.width = `${popPct}%`;
    if (this.activeNodesStatEl) {
      this.activeNodesStatEl.textContent = isEs
        ? `${activeCount} / ${totalGraphNodes} módulos activos en este commit (${popPct}%)`
        : `${activeCount} / ${totalGraphNodes} active modules in this commit (${popPct}%)`;
    }

    // Delta telemetry
    const nodeDelta = Math.max(1, Math.round(activeCount * 0.22));
    const funcDelta = Math.round(nodeDelta * 2.4);
    const linkDelta = Math.round(nodeDelta * 4.8);

    if (this.deltaModulesEl) this.deltaModulesEl.textContent = `+${nodeDelta} ${isEs ? 'módulos' : 'modules'}`;
    if (this.deltaFuncsEl) this.deltaFuncsEl.textContent = `+${funcDelta} ${isEs ? 'funciones' : 'functions'}`;
    if (this.deltaLinksEl) this.deltaLinksEl.textContent = `+${linkDelta} ${isEs ? 'conexiones' : 'links'}`;

    if (this.shiftPathEl) {
      const shifts = [
        'GENESIS -> CORE BOOTSTRAP',
        'CORE -> METROPOLIS GRID (UI)',
        'UI -> STORAGE BUNKER',
        'BUNKER -> TRANSMISSION HUB (API)',
        'API -> POWER GRID (STATE)',
        'POWER -> AI ENGINE PIPELINE',
        'AI -> RESEARCH LABS (TESTS)',
        'LABS -> DEATH STAR MONOLITH',
        'MONOLITH -> MODULAR REFACTOR',
        'REFACTOR -> WORKER CACHE',
        'CACHE -> CANVAS PROJECTOR',
        'PROJECTOR -> HEAD INTEGRATION'
      ];
      this.shiftPathEl.textContent = shifts[this.currentIndex % shifts.length];
    }
  }

  updateI18n() {
    const isEs = i18n.currentLang === 'es';
    const titleEl = document.getElementById('timeline-header-title');
    if (titleEl) {
      titleEl.textContent = isEs ? 'MÁQUINA DEL TIEMPO // EVOLUCIÓN DE CITADELA GIT' : 'TIME MACHINE // ARCHITECTURAL GIT EVOLUTION';
    }

    if (this.purposeBanner) {
      this.purposeBanner.textContent = isEs
        ? '[?] PROPÓSITO: Reproduce la evolución temporal del software commit a commit. Observa en el mapa 2.5D cómo nacieron los módulos y cómo cambió la salud arquitectónica en cada era.'
        : '[?] PURPOSE: Replay historical software evolution commit-by-commit. Watch the 2.5D citadel expand organically and track how architectural health shifted across eras.';
    }

    const hlthTxt = document.getElementById('tl-lbl-health-txt');
    if (hlthTxt) hlthTxt.textContent = isEs ? 'SALUD:' : 'HEALTH:';

    this.renderCurrentCommit();
  }
}
