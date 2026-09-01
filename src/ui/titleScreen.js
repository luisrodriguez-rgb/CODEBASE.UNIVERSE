/**
 * Splash & Universe Selector Controller for CODEBASE.UNIVERSE.
 * ZERO EMOJIS.
 */

import { sfx } from '../audio/soundFX.js';
import { i18n } from '../i18n/translations.js';
import { CodeGraph } from '../analysis/graph.js';

export class TitleScreenController {
  constructor(onStartCallback, onDatasetSelectCallback) {
    this.onStart = onStartCallback;
    this.onDatasetSelect = onDatasetSelectCallback;

    this.container = document.getElementById('title-screen');
    this.enterBtn = document.getElementById('enter-world-btn');
    this.projectSelect = document.getElementById('project-select-dropdown');
    this.customBox = document.getElementById('custom-import-box');
    this.fileInput = document.getElementById('custom-file-input');

    this.initEvents();
    this.updateI18n();
  }

  initEvents() {
    this.enterBtn?.addEventListener('click', () => {
      sfx.playWarp();
      this.hide();
      if (this.onStart) this.onStart();
    });

    this.projectSelect?.addEventListener('change', async (e) => {
      sfx.playClick();
      const val = e.target.value;
      if (val === 'custom') {
        this.customBox?.classList.remove('hidden');
      } else if (val === 'live_scan') {
        this.customBox?.classList.add('hidden');
        try {
          const res = await fetch('/api/scan');
          if (res.ok) {
            const raw = await res.json();
            const graph = new CodeGraph();
            for (const n of raw.nodes) graph.addNode(n);
            for (const e of raw.edges) graph.addEdge(e);
            if (this.onDatasetSelect) {
              this.onDatasetSelect('custom_raw', graph);
            }
          }
        } catch (err) {
          console.warn('Live scan endpoint not available, falling back.');
        }
      } else {
        this.customBox?.classList.add('hidden');
        if (this.onDatasetSelect) {
          this.onDatasetSelect(val);
        }
      }
    });

    this.customBox?.addEventListener('click', () => {
      this.fileInput?.click();
    });

    this.fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        sfx.playVictory();
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const customData = JSON.parse(event.target.result);
            const graph = new CodeGraph();
            const nodes = customData.nodes || [];
            const edges = customData.edges || [];
            for (const n of nodes) graph.addNode(n);
            for (const e of edges) graph.addEdge(e);

            if (this.onDatasetSelect) {
              this.onDatasetSelect('custom_raw', graph);
            }
          } catch (err) {
            alert('Invalid JSON file format.');
          }
        };
        reader.readAsText(file);
      }
    });

    i18n.subscribe(() => {
      this.updateI18n();
    });
  }

  updateI18n() {
    const mainH1 = document.getElementById('title-main-h1');
    if (mainH1) mainH1.textContent = i18n.t('splash_title');

    const subtitle = document.getElementById('title-main-subtitle');
    if (subtitle) subtitle.textContent = i18n.t('splash_subtitle');

    const selectLabel = document.getElementById('title-select-label');
    if (selectLabel) selectLabel.textContent = i18n.t('splash_select_label');

    const customHint = document.getElementById('title-custom-hint');
    if (customHint) customHint.textContent = i18n.t('custom_drop_hint');

    const enterBtn = document.getElementById('enter-world-btn');
    if (enterBtn) enterBtn.textContent = i18n.t('btn_enter_world');
  }

  show() {
    this.container?.classList.remove('hidden');
  }

  hide() {
    this.container?.classList.add('hidden');
  }
}
