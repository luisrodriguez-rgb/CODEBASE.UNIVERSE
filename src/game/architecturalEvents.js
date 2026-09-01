/**
 * Live Architectural Events Engine & Notification Ticker for CODEBASE.UNIVERSE.
 * Simulates real-time system events (Hotspot surges, Dead code discoveries, Coupling anomalies).
 * ZERO EMOJIS.
 */

import { sfx } from '../audio/soundFX.js';
import { i18n } from '../i18n/translations.js';

export class ArchitecturalEventManager {
  constructor(state, camera) {
    this.state = state;
    this.camera = camera;
    this.events = [];
    this.tickerEl = null;
    this.timer = null;

    this.initDOM();
  }

  initDOM() {
    let container = document.getElementById('architectural-event-ticker');
    if (!container) {
      container = document.createElement('div');
      container.id = 'architectural-event-ticker';
      container.className = 'event-ticker-box hidden';
      document.body.appendChild(container);
    }
    this.tickerEl = container;

    this.tickerEl.addEventListener('click', () => {
      const activeEvent = this.events[this.events.length - 1];
      if (activeEvent && activeEvent.targetId) {
        sfx.playClick();
        const node = this.state.graph.getNode(activeEvent.targetId);
        if (node) {
          this.state.setSelectedNode(activeEvent.targetId);
          this.camera.centerOn(node.x, node.y, 3.5);
        }
      }
    });
  }

  startEventSimulation() {
    if (this.timer) clearInterval(this.timer);

    // Trigger initial event after 4 seconds, then periodically every 22 seconds
    setTimeout(() => this.triggerNextEvent(), 4000);
    this.timer = setInterval(() => {
      this.triggerNextEvent();
    }, 24000);
  }

  triggerNextEvent() {
    if (!this.state.graph || !this.state.analysis) return;
    const isEs = i18n.currentLang === 'es';

    const samplePool = [
      () => {
        const topThreat = this.state.analysis.threats[0];
        if (!topThreat) return null;
        return {
          type: 'HOTSPOT_ALERT',
          title: isEs ? '[ALERTA] PUNTO CRÍTICO DETECTADO' : '[ALERT] HIGH RISK HOTSPOT',
          message: isEs
            ? `${topThreat.name} concentra ${topThreat.fanIn} dependientes. Riesgo arquitectónico: ${topThreat.riskScore}%.`
            : `${topThreat.name} concentrates ${topThreat.fanIn} dependents. Risk level: ${topThreat.riskScore}%.`,
          targetId: topThreat.id,
          level: 'danger'
        };
      },
      () => {
        const cyclicId = Array.from(this.state.analysis.cycleData.cyclicalNodes)[0];
        if (!cyclicId) return null;
        const node = this.state.graph.getNode(cyclicId);
        return {
          type: 'CYCLE_SURGE',
          title: isEs ? '[ANOMALÍA] BUCLE CIRCULAR ACTIVO' : '[ANOMALY] CIRCULAR FEEDBACK LOOP',
          message: isEs
            ? `Bucle circular detectado en ${node?.name || cyclicId}. Se recomienda desacoplamiento.`
            : `Mutual dependency cycle active in ${node?.name || cyclicId}. Refactoring advised.`,
          targetId: cyclicId,
          level: 'warning'
        };
      },
      () => {
        const entry = Array.from(this.state.analysis.nodeStats.values()).find(n => n.centralityPct >= 95);
        if (!entry) return null;
        return {
          type: 'CORE_PULSE',
          title: isEs ? '[TELEMETRÍA] NÚCLEO ARQUITECTÓNICO' : '[TELEMETRY] ARCHITECTURAL CORE',
          message: isEs
            ? `${entry.name} orquesta el 95% de las rutas de ejecución del sistema.`
            : `${entry.name} orchestrates 95% of all execution routes across subsystems.`,
          targetId: entry.id,
          level: 'info'
        };
      }
    ];

    const pick = samplePool[Math.floor(Math.random() * samplePool.length)]();
    if (pick) {
      this.displayEvent(pick);
    }
  }

  displayEvent(eventObj) {
    this.events.push(eventObj);
    if (this.events.length > 10) this.events.shift();

    if (!this.tickerEl) return;

    this.tickerEl.className = `event-ticker-box visible level-${eventObj.level}`;
    this.tickerEl.innerHTML = `
      <div class="ticker-header">
        <span class="ticker-tag">${eventObj.title}</span>
        <span class="ticker-action">[ VER // LOCATE ]</span>
      </div>
      <div class="ticker-msg">${eventObj.message}</div>
    `;

    sfx.playWarp();

    // Auto-hide after 7 seconds
    setTimeout(() => {
      this.tickerEl.classList.remove('visible');
      setTimeout(() => this.tickerEl.classList.add('hidden'), 300);
    }, 7000);
  }
}
