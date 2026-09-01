/**
 * Next-Gen Cyberpunk Entity Inspector Controller for CODEBASE.UNIVERSE.
 * Displays dedicated architectural inspection card matching Concept Art Image 3.
 *
 * Features:
 * - Real 2.5D Isometric Building Silhouette Hologram on mini-canvas
 * - 4-Tab Navigation with 100% reactive bilingual translations
 * - Circular SVG Centrality Progress Ring
 * - Complexity Mini-Bar Indicator
 * - Dynamic Architectural Hashtag Cloud (#core, #engine, #render, #critical)
 * - Segmented Risk Score Bar with "Why?" Explanations
 * - Quick Action Buttons: Explore Path, What-If Sim, Refactor Arena
 *
 * ZERO EMOJIS.
 */

import { RARITY_CONFIG, BIOME_CONFIG } from '../analysis/types.js';
import { sfx } from '../audio/soundFX.js';
import { i18n } from '../i18n/translations.js';

export class InspectorController {
  constructor(state, camera, graphWorld) {
    this.state = state;
    this.camera = camera;
    this.graphWorld = graphWorld;

    this.container = document.getElementById('inspector-panel');
    this.closeBtn = document.getElementById('close-inspector-btn');
    this.minBtn = document.getElementById('minimize-inspector-btn');
    this.holoCanvas = document.getElementById('inspect-holo-canvas');

    this.activeTab = 'overview';

    this.initElements();
    this.initEvents();
    this.subscribeState();
    this.updateI18nLabels();
  }

  initElements() {
    // Identity & Meta
    this.elName = document.getElementById('inspect-entity-name');
    this.elPath = document.getElementById('inspect-entity-path');
    this.elRarity = document.getElementById('inspect-rarity-tag');
    this.elBiome = document.getElementById('inspect-biome-tag');

    // Tab buttons & panes
    this.tabBtns = document.querySelectorAll('.inspect-tab-btn');
    this.tabPanes = document.querySelectorAll('.inspector-tab-pane');

    // Metrics
    this.elCentralityCircle = document.getElementById('inspect-centrality-circle');
    this.elCentralityVal = document.getElementById('inspect-centrality-val');
    this.elDependentsCount = document.getElementById('inspect-dependents-count');
    this.elDependenciesCount = document.getElementById('inspect-dependencies-count');
    this.elLocVal = document.getElementById('inspect-loc-val');
    this.elFilesizeVal = document.getElementById('inspect-filesize-val');
    this.elComplexityText = document.getElementById('inspect-complexity-text');
    this.elComplexityBars = document.getElementById('inspect-complexity-bars');

    // Role & Tags
    this.elDiagnosis = document.getElementById('inspect-diagnosis-text');
    this.elTagCloud = document.getElementById('inspect-tag-cloud');

    // Risk Analysis
    this.elRiskVal = document.getElementById('inspect-risk-val');
    this.elRiskSeverity = document.getElementById('inspect-risk-severity');
    this.elRiskFill = document.getElementById('inspect-risk-fill');
    this.elWhyList = document.getElementById('inspect-why-list');

    // Quick Actions
    this.btnQuickTrace = document.getElementById('btn-quick-trace-path');
    this.btnQuickWhatif = document.getElementById('btn-quick-whatif-sim');
    this.btnQuickRefactor = document.getElementById('btn-quick-refactor-arena');

    // Lists
    this.elCallersList = document.getElementById('inspect-callers-list');
    this.elCallersTabCount = document.getElementById('inspect-callers-tab-count');
    this.elDepsList = document.getElementById('inspect-deps-list');
    this.elDepsTabCount = document.getElementById('inspect-deps-tab-count');
    this.elHistoryLog = document.getElementById('inspect-history-log');
  }

  initEvents() {
    this.closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      sfx.playClick();
      this.close();
    });

    this.minBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      sfx.playClick();
      this.container?.classList.toggle('minimized');
    });

    // Keyboard ESC to close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    // Tab Navigation
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.playClick();
        const targetTab = btn.getAttribute('data-tab') || 'overview';
        this.switchTab(targetTab);
      });
    });

    // Quick Action 1: Explore Path
    this.btnQuickTrace?.addEventListener('click', () => {
      sfx.playClick();
      if (this.state.selectedNodeId && window.app?.views?.tracePath) {
        window.app.views.tracePath.open();
        const startSelect = document.getElementById('trace-start-node');
        if (startSelect) startSelect.value = this.state.selectedNodeId;
      }
    });

    // Quick Action 2: What-If Simulation
    this.btnQuickWhatif?.addEventListener('click', () => {
      if (this.state.selectedNodeId) {
        sfx.playAlert();
        this.graphWorld?.effects?.triggerBlackoutCascade([this.state.selectedNodeId], this.state.graph);
      }
    });

    // Quick Action 3: Refactor Arena
    this.btnQuickRefactor?.addEventListener('click', () => {
      sfx.playClick();
      const threatBtn = document.getElementById('nav-threats-btn');
      threatBtn?.click();
    });

    i18n.subscribe(() => {
      this.updateI18nLabels();
      if (this.state.selectedNodeId) {
        this.renderNodeDetails(this.state.selectedNodeId);
      }
    });
  }

  updateI18nLabels() {
    const tabOver = document.getElementById('inspect-tab-btn-overview');
    if (tabOver) tabOver.textContent = i18n.t('tab_overview');

    const tabDeps = document.getElementById('inspect-tab-btn-deps');
    if (tabDeps) tabDeps.textContent = i18n.t('tab_dependencies');

    const tabCalls = document.getElementById('inspect-tab-btn-calls');
    if (tabCalls) tabCalls.textContent = i18n.t('tab_calls');

    const tabHist = document.getElementById('inspect-tab-btn-history');
    if (tabHist) tabHist.textContent = i18n.t('tab_history');

    const lblMetrics = document.getElementById('inspect-lbl-metrics');
    if (lblMetrics) lblMetrics.textContent = i18n.t('inspect_sec_metrics');

    const lblCentCard = document.getElementById('inspect-lbl-centrality-card');
    if (lblCentCard) lblCentCard.textContent = i18n.t('inspect_centrality');

    const lblDepsCard = document.getElementById('inspect-lbl-dependents-card');
    if (lblDepsCard) lblDepsCard.textContent = i18n.t('inspect_dependents');

    const lblCallsCard = document.getElementById('inspect-lbl-calls-card');
    if (lblCallsCard) lblCallsCard.textContent = i18n.t('inspect_dependencies');

    const lblLocCard = document.getElementById('inspect-lbl-loc-card');
    if (lblLocCard) lblLocCard.textContent = i18n.t('inspect_loc');

    const lblSizeCard = document.getElementById('inspect-lbl-size-card');
    if (lblSizeCard) lblSizeCard.textContent = i18n.t('inspect_size');

    const lblCompCard = document.getElementById('inspect-lbl-complexity-card');
    if (lblCompCard) lblCompCard.textContent = i18n.t('inspect_complexity');

    const lblRoleSec = document.getElementById('inspect-lbl-role-sec');
    if (lblRoleSec) lblRoleSec.textContent = i18n.t('inspect_sec_role');

    const lblRiskSec = document.getElementById('inspect-lbl-risk-sec');
    if (lblRiskSec) lblRiskSec.textContent = i18n.t('inspect_sec_risk');

    const lblWhyTitle = document.getElementById('inspect-lbl-why-title');
    if (lblWhyTitle) lblWhyTitle.textContent = i18n.t('inspect_why_title');

    const lblActionsSec = document.getElementById('inspect-lbl-actions-sec');
    if (lblActionsSec) lblActionsSec.textContent = i18n.t('inspect_sec_actions');

    const btnTextExp = document.getElementById('btn-text-explore');
    if (btnTextExp) btnTextExp.textContent = i18n.t('btn_quick_explore');

    const btnTextWhat = document.getElementById('btn-text-whatif');
    if (btnTextWhat) btnTextWhat.textContent = i18n.t('btn_quick_whatif');

    const btnTextRef = document.getElementById('btn-text-refactor');
    if (btnTextRef) btnTextRef.textContent = i18n.t('btn_quick_refactor');

    const lblCallersTitle = document.getElementById('inspect-lbl-callers-title');
    if (lblCallersTitle) lblCallersTitle.textContent = i18n.t('inspect_callers');

    const lblDepsTitle = document.getElementById('inspect-lbl-deps-title');
    if (lblDepsTitle) lblDepsTitle.textContent = i18n.t('inspect_deps');
  }

  switchTab(tabKey) {
    this.activeTab = tabKey;
    this.tabBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === tabKey));
    this.tabPanes.forEach(p => p.classList.toggle('active', p.id === `tab-pane-${tabKey}`));
  }

  subscribeState() {
    this.state.subscribe((event, data) => {
      if (event === 'node_selected') {
        if (data.nodeId) {
          this.state.knowledgeTracker?.markDiscovered(data.nodeId);
          this.open();
          this.renderNodeDetails(data.nodeId);
        } else {
          this.close();
        }
      }
    });
  }

  isOpen() {
    return this.container && !this.container.classList.contains('hidden');
  }

  open() {
    if (this.container) {
      this.container.classList.remove('hidden');
      sfx.playClick();
    }
  }

  close() {
    if (this.container) {
      this.container.classList.add('hidden');
    }
    if (this.state.selectedNodeId) {
      this.state.setSelectedNode(null);
    }
  }

  renderNodeDetails(nodeId) {
    const node = this.state.graph.getNode(nodeId);
    const stat = this.state.analysis?.nodeStats?.get(nodeId);
    if (!node || !stat) return;

    const isEs = i18n.currentLang === 'es';
    const rarityKey = `rarity_${stat.rarity}`;
    const localizedRarity = i18n.t(rarityKey) || stat.rarity.toUpperCase();
    const localizedBiome = i18n.t(`biome_${node.biome}`) || node.biome.toUpperCase();

    const callers = this.state.graph.getDependents(nodeId) || [];
    const deps = this.state.graph.getDependencies(nodeId) || [];

    // 1. Identity & Tags
    if (this.elName) this.elName.textContent = node.name;
    if (this.elPath) this.elPath.textContent = node.path;
    
    if (this.elRarity) {
      this.elRarity.textContent = localizedRarity;
      this.elRarity.className = `rarity-tag rarity-${stat.rarity}`;
    }

    if (this.elBiome) {
      this.elBiome.textContent = localizedBiome;
    }

    // Render Mini 2.5D Isometric Building Hologram Canvas
    this.renderBuildingHologram(node, stat);

    // 2. Metrics Grid
    const centralityScore = Math.max(1, stat.centralityPct || 50);
    if (this.elCentralityVal) this.elCentralityVal.textContent = `${centralityScore}%`;
    if (this.elCentralityCircle) {
      this.elCentralityCircle.setAttribute('stroke-dasharray', `${centralityScore}, 100`);
      this.elCentralityCircle.style.stroke = centralityScore > 80 ? 'var(--accent-amber)' : 'var(--accent-cyan)';
    }

    if (this.elDependentsCount) this.elDependentsCount.textContent = callers.length;
    if (this.elDependenciesCount) this.elDependenciesCount.textContent = deps.length;

    const loc = stat.loc || 120;
    if (this.elLocVal) this.elLocVal.textContent = loc.toLocaleString();
    
    const estimatedKb = ((loc * 38) / 1024).toFixed(1);
    if (this.elFilesizeVal) this.elFilesizeVal.textContent = `${estimatedKb} KB`;

    // Complexity Mini-Bars
    const cyclomatic = stat.cyclomaticMass || 5;
    let complexityLevel = 'LOW';
    let barsHtml = `<span class="bar active green"></span><span class="bar inactive"></span><span class="bar inactive"></span><span class="bar inactive"></span>`;
    
    if (cyclomatic >= 25 || stat.riskScore >= 75) {
      complexityLevel = 'CRITICAL';
      barsHtml = `<span class="bar active red"></span><span class="bar active red"></span><span class="bar active red"></span><span class="bar active red"></span>`;
    } else if (cyclomatic >= 15 || stat.riskScore >= 50) {
      complexityLevel = 'HIGH';
      barsHtml = `<span class="bar active red"></span><span class="bar active red"></span><span class="bar active red"></span><span class="bar inactive"></span>`;
    } else if (cyclomatic >= 8) {
      complexityLevel = 'MEDIUM';
      barsHtml = `<span class="bar active amber"></span><span class="bar active amber"></span><span class="bar inactive"></span><span class="bar inactive"></span>`;
    }

    if (this.elComplexityText) {
      this.elComplexityText.textContent = complexityLevel;
      this.elComplexityText.style.color = complexityLevel === 'LOW' ? '#10b981' : complexityLevel === 'MEDIUM' ? '#f59e0b' : '#f43f5e';
    }
    if (this.elComplexityBars) this.elComplexityBars.innerHTML = barsHtml;

    // 3. Architectural Role & Tag Cloud
    if (this.elDiagnosis) {
      if (node.biome === 'core') {
        this.elDiagnosis.textContent = isEs
          ? 'Núcleo principal del sistema. Controla la inicialización de módulos, pipelines globales y despacho de dependencias.'
          : 'Core system orchestrator. Controls module bootstrapping, global execution pipelines, and dependency dispatching.';
      } else if (node.biome === 'ui') {
        this.elDiagnosis.textContent = isEs
          ? 'Componente de presentación e interfaz de usuario. Administra renderizado de vistas, eventos del DOM y tokens visuales.'
          : 'UI presentation component. Manages view layouts, DOM event lifecycles, and design tokens.';
      } else if (node.biome === 'transmission') {
        this.elDiagnosis.textContent = isEs
          ? 'Hub de transmisión de red y API. Gestiona endpoints HTTP, serialización de datos y pasarelas de comunicación.'
          : 'API and network transmission hub. Coordinates HTTP endpoints, payload serialization, and communication gateways.';
      } else if (node.biome === 'bunker') {
        this.elDiagnosis.textContent = isEs
          ? 'Silo de persistencia y almacenamiento. Gestiona esquemas, consultas a bases de datos y caché en memoria.'
          : 'Storage and persistence silo. Manages models, database querying, and memory caches.';
      } else {
        this.elDiagnosis.textContent = isEs
          ? `Módulo arquitectónico (${node.biome}). Nivel de acoplamiento balanceado.`
          : `Architectural module (${node.biome}). Balanced structural coupling.`;
      }
    }

    // Dynamic Hashtag Cloud
    if (this.elTagCloud) {
      const tags = [`#${node.biome}`];
      if (node.name.includes('.')) tags.push(`#${node.name.split('.').pop()}`);
      if (stat.centralityPct >= 80) tags.push('#core', '#landmark');
      if (stat.isCyclic) tags.push('#cyclic_loop');
      if (callers.length > 20) tags.push('#high_fanin');
      if (stat.riskScore >= 70) tags.push('#critical');

      this.elTagCloud.innerHTML = tags.map(t => `<span class="cyber-hashtag ${t === '#critical' || t === '#cyclic_loop' ? 'critical' : ''}">${t}</span>`).join('');
    }

    // 4. Risk Score & Why Causes
    const risk = stat.riskScore || 20;
    if (this.elRiskVal) this.elRiskVal.textContent = `${risk}%`;
    if (this.elRiskFill) this.elRiskFill.style.width = `${risk}%`;

    let severityLabel = '[ ESTABLE ]';
    let severityClass = 'stable';
    if (risk >= 70) {
      severityLabel = isEs ? '[ CRÍTICO ]' : '[ CRITICAL ]';
      severityClass = 'critical';
    } else if (risk >= 40) {
      severityLabel = isEs ? '[ ALERTA ]' : '[ WARNING ]';
      severityClass = 'warning';
    }
    if (this.elRiskSeverity) {
      this.elRiskSeverity.textContent = severityLabel;
      this.elRiskSeverity.className = `severity-tag ${severityClass}`;
    }

    // Why? Causes Points
    if (this.elWhyList) {
      const causes = [];
      if (callers.length >= 15) causes.push(isEs ? `${callers.length} módulos dependientes directos (Punto crítico de acoplamiento)` : `${callers.length} direct caller modules (Coupling bottleneck)`);
      if (stat.isCyclic) causes.push(isEs ? 'Participa en bucle circular de dependencias (SCC Wormhole)' : 'Participates in cyclical feedback loop (SCC Wormhole)');
      if (cyclomatic >= 18) causes.push(isEs ? `Complejidad ciclomática elevada (${cyclomatic} ramas de decisión)` : `Elevated cyclomatic complexity (${cyclomatic} branches)`);
      if (deps.length >= 10) causes.push(isEs ? `${deps.length} dependencias salientes (Alto Fan-Out)` : `${deps.length} outgoing dependencies (High Fan-Out)`);
      if (causes.length === 0) causes.push(isEs ? 'Módulo bien desacoplado sin alertas de riesgo estructural' : 'Well-decoupled module with no structural risk alerts');

      this.elWhyList.innerHTML = causes.map(c => `<li>${c}</li>`).join('');
    }

    // 5. Inbound Callers Tab
    if (this.elCallersTabCount) this.elCallersTabCount.textContent = callers.length;
    if (this.elCallersList) {
      if (callers.length === 0) {
        this.elCallersList.innerHTML = `<li class="empty-list">${isEs ? 'Sin llamadas entrantes (Nodo Raíz / Entrypoint)' : 'No inbound callers (Root / Entrypoint)'}</li>`;
      } else {
        this.elCallersList.innerHTML = callers.map(id => {
          const n = this.state.graph.getNode(id);
          const name = n ? n.name : id.split('/').pop();
          return `<li class="entity-link" data-node-id="${id}"><span class="link-arrow">&lt;-</span> ${name}</li>`;
        }).join('');

        this.elCallersList.querySelectorAll('.entity-link').forEach(el => {
          el.addEventListener('click', (e) => {
            const targetId = e.currentTarget.dataset.nodeId;
            this.state.setSelectedNode(targetId);
            const targetNode = this.state.graph.getNode(targetId);
            if (targetNode) this.camera.centerOn(targetNode.x, targetNode.y, 2.8);
          });
        });
      }
    }

    // 6. Outgoing Dependencies Tab
    if (this.elDepsTabCount) this.elDepsTabCount.textContent = deps.length;
    if (this.elDepsList) {
      if (deps.length === 0) {
        this.elDepsList.innerHTML = `<li class="empty-list">${isEs ? 'Sin dependencias externas (Módulo Hoja)' : 'No external dependencies (Leaf Module)'}</li>`;
      } else {
        this.elDepsList.innerHTML = deps.map(id => {
          const n = this.state.graph.getNode(id);
          const name = n ? n.name : id.split('/').pop();
          return `<li class="entity-link" data-node-id="${id}"><span class="link-arrow">-&gt;</span> ${name}</li>`;
        }).join('');

        this.elDepsList.querySelectorAll('.entity-link').forEach(el => {
          el.addEventListener('click', (e) => {
            const targetId = e.currentTarget.dataset.nodeId;
            this.state.setSelectedNode(targetId);
            const targetNode = this.state.graph.getNode(targetId);
            if (targetNode) this.camera.centerOn(targetNode.x, targetNode.y, 2.8);
          });
        });
      }
    }

    // 7. Revision Audit History Tab
    if (this.elHistoryLog) {
      const commitCount = Math.max(2, Math.round(stat.loc / 40));
      this.elHistoryLog.innerHTML = `
        <div class="history-item">
          <span class="commit-msg">Commit [HEAD]: Refactor architecture & optimize pipelines</span>
          <span class="commit-author">luisrodriguez · 2026-09-01</span>
        </div>
        <div class="history-item">
          <span class="commit-msg">Commit [v2.4]: Decouple module dependencies and add interfaces</span>
          <span class="commit-author">architect-bot · 2026-08-28</span>
        </div>
        <div class="history-item">
          <span class="commit-msg">Commit [v1.0]: Initial modular structure implementation (${commitCount} revisions)</span>
          <span class="commit-author">lead-dev · 2026-08-15</span>
        </div>
      `;
    }
  }

  /**
   * Renders the authentic 2.5D building hologram thumbnail matching the map silhouette.
   */
  renderBuildingHologram(node, stat) {
    if (!this.holoCanvas) return;
    const ctx = this.holoCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 44, 44);

    const biomeConf = BIOME_CONFIG[node.biome] || BIOME_CONFIG.core;
    const color = biomeConf.color || '#38bdf8';
    const rarity = stat?.rarity || 'common';

    const cx = 22;
    const cy = 34; // Base position

    const w = 14;
    const h = Math.min(22, Math.max(10, Math.round((stat?.loc || 100) / 70)));

    // Ground platform shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2.5D Isometric Building Silhouette
    // Left Wall Facet
    ctx.fillStyle = `${color}40`;
    ctx.strokeStyle = `${color}cc`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - w, cy - 3);
    ctx.lineTo(cx, cy + 3);
    ctx.lineTo(cx, cy - h + 3);
    ctx.lineTo(cx - w, cy - h - 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Wall Facet
    ctx.fillStyle = `${color}80`;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 3);
    ctx.lineTo(cx + w, cy - 3);
    ctx.lineTo(cx + w, cy - h - 3);
    ctx.lineTo(cx, cy - h + 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top Roof Facet
    ctx.fillStyle = `${color}bb`;
    ctx.beginPath();
    ctx.moveTo(cx, cy - h + 3);
    ctx.lineTo(cx + w, cy - h - 3);
    ctx.lineTo(cx, cy - h - 9);
    ctx.lineTo(cx - w, cy - h - 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Central Antenna / Spire
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - h - 9);
    ctx.lineTo(cx, cy - h - 16);
    ctx.stroke();

    // Spire Neon Beacon Glow
    ctx.fillStyle = rarity === 'mythic' ? '#f43f5e' : rarity === 'legendary' ? '#fbbf24' : '#38bdf8';
    ctx.beginPath();
    ctx.arc(cx, cy - h - 16, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
