/**
 * Git Time Machine & History Scrubber Controller.
 */

import { generateEvolutionaryHistory } from '../analysis/history.js';

export class TimelineView {
  constructor(state, graph, world) {
    this.state = state;
    this.graph = graph;
    this.world = world;

    this.drawer = document.getElementById('timeline-drawer');
    this.slider = document.getElementById('timeline-slider');
    this.closeBtn = document.getElementById('close-timeline-btn');
    this.playBtn = document.getElementById('timeline-play-btn');
    this.prevBtn = document.getElementById('timeline-prev-btn');
    this.nextBtn = document.getElementById('timeline-next-btn');
    this.speedSelect = document.getElementById('timeline-speed-select');

    this.hashLabel = document.getElementById('current-commit-hash');
    this.dateLabel = document.getElementById('current-commit-date');
    this.statGen = document.getElementById('tl-stat-gen');
    this.statNodes = document.getElementById('tl-stat-nodes');
    this.statEdges = document.getElementById('tl-stat-edges');
    this.statHealth = document.getElementById('tl-stat-health');
    this.statNote = document.getElementById('tl-stat-note');

    this.history = generateEvolutionaryHistory(graph);
    this.currentIdx = this.history.length - 1;
    this.isPlaying = false;
    this.playInterval = null;

    this.initEvents();
  }

  initEvents() {
    this.closeBtn.addEventListener('click', () => this.close());

    this.slider.max = String(this.history.length - 1);
    this.slider.value = String(this.currentIdx);

    this.slider.addEventListener('input', (e) => {
      this.currentIdx = parseInt(e.target.value, 10);
      this.applyGeneration(this.currentIdx);
    });

    this.playBtn.addEventListener('click', () => {
      if (this.isPlaying) this.pause();
      else this.play();
    });

    this.prevBtn.addEventListener('click', () => {
      if (this.currentIdx > 0) {
        this.currentIdx--;
        this.slider.value = String(this.currentIdx);
        this.applyGeneration(this.currentIdx);
      }
    });

    this.nextBtn.addEventListener('click', () => {
      if (this.currentIdx < this.history.length - 1) {
        this.currentIdx++;
        this.slider.value = String(this.currentIdx);
        this.applyGeneration(this.currentIdx);
      }
    });
  }

  open() {
    this.drawer.classList.remove('hidden');
    this.applyGeneration(this.currentIdx);
  }

  close() {
    this.pause();
    this.drawer.classList.add('hidden');
    // Restore all nodes on canvas
    this.world.effects.clearBlackout();
  }

  play() {
    this.isPlaying = true;
    this.playBtn.textContent = '⏸ PAUSE';
    this.playBtn.classList.add('highlight');

    const speed = parseFloat(this.speedSelect.value) || 1;
    const intervalMs = Math.round(1500 / speed);

    this.playInterval = setInterval(() => {
      if (this.currentIdx >= this.history.length - 1) {
        this.currentIdx = 0;
      } else {
        this.currentIdx++;
      }
      this.slider.value = String(this.currentIdx);
      this.applyGeneration(this.currentIdx);
    }, intervalMs);
  }

  pause() {
    this.isPlaying = false;
    this.playBtn.textContent = '▶ PLAY';
    this.playBtn.classList.remove('highlight');
    if (this.playInterval) clearInterval(this.playInterval);
  }

  applyGeneration(idx) {
    const gen = this.history[idx];
    if (!gen) return;

    this.hashLabel.textContent = `COMMIT: ${gen.commitHash.toUpperCase()}`;
    this.dateLabel.textContent = gen.date;
    this.statGen.textContent = `GEN ${gen.index} / ${gen.totalGens}`;
    this.statNodes.textContent = String(gen.nodeCount);
    this.statEdges.textContent = String(gen.edgeCount);
    this.statHealth.textContent = `${gen.health}%`;
    this.statNote.textContent = gen.note;

    // Filter canvas nodes visually by active historical generation
    const allNodeIds = Array.from(this.graph.nodes.keys());
    const ghostedIds = allNodeIds.filter(id => !gen.activeNodeIds.has(id));
    this.world.effects.setBlackoutNodes(ghostedIds);
  }
}
