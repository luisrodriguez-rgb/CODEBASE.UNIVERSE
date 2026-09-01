/**
 * Trace Path Controller (Software Dependency GPS) for CODEBASE.UNIVERSE.
 * Calculates shortest execution routes between two selected modules.
 * ZERO EMOJIS.
 */

import { sfx } from '../audio/soundFX.js';
import { i18n } from '../i18n/translations.js';

export class TracePathModalController {
  constructor(state, camera, pathFollower) {
    this.state = state;
    this.camera = camera;
    this.pathFollower = pathFollower;

    this.container = document.getElementById('trace-path-modal');
    this.startSelect = document.getElementById('trace-start-node');
    this.endSelect = document.getElementById('trace-end-node');
    this.calcBtn = document.getElementById('btn-execute-trace');
    this.resultsContainer = document.getElementById('trace-results-box');

    this.initEvents();
    this.subscribeState();
  }

  initEvents() {
    this.calcBtn?.addEventListener('click', () => {
      sfx.playClick();
      this.executeTrace();
    });

    document.getElementById('close-trace-btn')?.addEventListener('click', () => {
      sfx.playClick();
      this.close();
    });
  }

  subscribeState() {
    this.state.subscribe((event, data) => {
      if (event === 'graph_loaded') {
        this.populateDropdowns();
      }
    });
  }

  open() {
    this.container?.classList.remove('hidden');
    document.getElementById('modal-backdrop')?.classList.remove('hidden');
    this.populateDropdowns();
  }

  close() {
    this.container?.classList.add('hidden');
    document.getElementById('modal-backdrop')?.classList.add('hidden');
  }

  populateDropdowns() {
    if (!this.startSelect || !this.endSelect || !this.state.graph) return;

    const nodes = Array.from(this.state.graph.nodes.values()).sort((a, b) => a.name.localeCompare(b.name));
    const optionsHtml = nodes.map(n => `<option value="${n.id}">${n.name} (${n.biome.toUpperCase()})</option>`).join('');

    this.startSelect.innerHTML = optionsHtml;
    this.endSelect.innerHTML = optionsHtml;

    if (nodes.length > 5) {
      this.startSelect.selectedIndex = 0;
      this.endSelect.selectedIndex = Math.min(15, nodes.length - 1);
    }
  }

  executeTrace() {
    const startId = this.startSelect?.value;
    const endId = this.endSelect?.value;
    if (!startId || !endId) return;

    const path = this.pathFollower.findPath(startId, endId);
    const isEs = i18n.currentLang === 'es';

    if (path.length === 0) {
      sfx.playAlarm();
      if (this.resultsContainer) {
        this.resultsContainer.innerHTML = `
          <div class="trace-no-path">
            [!] ${isEs
              ? 'NO EXISTE RUTA DIRECTA DE LLAMADAS ENTRE ESTOS DOS MÓDULOS.'
              : 'NO DIRECT EXECUTION CALL PATH FOUND BETWEEN THESE TWO MODULES.'}
          </div>
        `;
      }
      return;
    }

    sfx.playVictory();
    const hops = path.length - 1;

    if (this.resultsContainer) {
      this.resultsContainer.innerHTML = `
        <div class="trace-summary-card">
          <div class="trace-stats-row">
            <span>${isEs ? 'SALTOS (HOPS)' : 'HOPS'}: <strong>${hops}</strong></span>
            <span>${isEs ? 'MÓDULOS INVOLUCRADOS' : 'MODULES INVOLVED'}: <strong>${path.length}</strong></span>
            <span style="color:var(--accent-cyan);">${isEs ? 'RUTA ÓPTIMA' : 'OPTIMAL ROUTE'}</span>
          </div>

          <div class="trace-step-pipeline">
            ${path.map((nodeId, idx) => {
              const node = this.state.graph.getNode(nodeId);
              return `
                <div class="trace-node-pill" data-node-id="${nodeId}">
                  <span class="step-num">[${idx + 1}]</span>
                  <span class="step-name">${node?.name || nodeId}</span>
                  ${idx < path.length - 1 ? '<span class="step-arrow">-></span>' : ''}
                </div>
              `;
            }).join('')}
          </div>

          <button id="btn-animate-path" class="execute-sim-btn" style="margin-top:12px;background:var(--accent-cyan);color:#050811;">
            [>] ${isEs ? 'ANIMAR RECORRIDO EN MAPA' : 'ANIMATE ROUTE ON MAP'}
          </button>
        </div>
      `;

      document.getElementById('btn-animate-path')?.addEventListener('click', () => {
        sfx.playClick();
        this.close();
        this.pathFollower.startFlow(path, () => {
          sfx.playVictory();
        });
      });
    }
  }
}
