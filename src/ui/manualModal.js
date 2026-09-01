/**
 * Dedicated Interactive Architect's Manual Modal Controller.
 * Replaces the browser alert with a comprehensive 8-tab cyberpunk documentation deck.
 */

import { i18n } from '../i18n/translations.js';

export class ManualModal {
  constructor() {
    this.modal = document.getElementById('manual-modal');
    this.backdrop = document.getElementById('modal-backdrop');
    this.contentContainer = document.getElementById('manual-content-body');
    this.tabButtons = document.querySelectorAll('.manual-nav-tab');
    this.activeTab = 'overview';

    this.initEvents();
  }

  initEvents() {
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.getAttribute('data-manual-tab') || 'overview';
        this.renderContent();
      });
    });

    i18n.subscribe(() => {
      this.updateLabels();
      if (!this.modal.classList.contains('hidden')) {
        this.renderContent();
      }
    });

    this.updateLabels();
  }

  updateLabels() {
    const headerTitle = document.getElementById('manual-modal-header-title');
    if (headerTitle) headerTitle.textContent = i18n.t('manual_title');

    const tabMap = {
      overview: 'tab_manual_overview',
      controls: 'tab_manual_controls',
      biomes: 'tab_manual_biomes',
      codedex: 'tab_manual_codedex',
      quests: 'tab_manual_quests',
      threats: 'tab_manual_threats',
      whatif: 'tab_manual_whatif',
      timemachine: 'tab_manual_timemachine'
    };

    this.tabButtons.forEach(btn => {
      const tabKey = btn.getAttribute('data-manual-tab');
      if (tabMap[tabKey]) {
        btn.textContent = i18n.t(tabMap[tabKey]);
      }
    });
  }

  open() {
    this.modal.classList.remove('hidden');
    this.backdrop.classList.remove('hidden');
    this.renderContent();
  }

  close() {
    this.modal.classList.add('hidden');
    this.backdrop.classList.add('hidden');
  }

  renderContent() {
    const isEs = i18n.currentLang === 'es';

    const contentMap = {
      overview: isEs ? `
        <div class="manual-section">
          <h3>FILOSOFÍA // CODEBASE.UNIVERSE</h3>
          <p><strong>Tu código no es un grafo plano. Es un sistema vivo y explorable.</strong></p>
          <p>CODEBASE.UNIVERSE transforma repositorios de software en mundos interactivos donde cada archivo, función y módulo tiene masa, gravedad, rareza y riesgo arquitectónico calculados en tiempo real.</p>
          <div class="manual-callout">
            <span class="callout-badge">PROPÓSITO</span>
            <span>Aprender código nuevo, resolver onboarding guiado, prevenir deuda técnica y simular consecuencias de refactorización antes de tocar una sola línea de código.</span>
          </div>
          <div class="manual-grid-2">
            <div class="manual-card">
              <h4>1. Análisis Topológico Real</h4>
              <p>Algoritmos de Centralidad de intermediación (Betweenness), PageRank y ciclos de Tarjan aplicados sobre el árbol sintáctico del código.</p>
            </div>
            <div class="manual-card">
              <h4>2. Simulación de Impacto (What-If)</h4>
              <p>Calcula el radio de explosión (Blast Radius) propagando fallos en cascada a través de todos los dependientes directos e indirectos.</p>
            </div>
          </div>
        </div>
      ` : `
        <div class="manual-section">
          <h3>PHILOSOPHY // CODEBASE.UNIVERSE</h3>
          <p><strong>Your codebase is not a flat graph. It is a living, explorable world.</strong></p>
          <p>CODEBASE.UNIVERSE models software architecture through topological physics where every file, function, and module has mass, gravity, calculated rarity, and structural risk.</p>
          <div class="manual-callout">
            <span class="callout-badge">PURPOSE</span>
            <span>Master new codebases, onboard engineers in minutes, diagnose technical debt, and simulate refactoring impact non-destructively.</span>
          </div>
          <div class="manual-grid-2">
            <div class="manual-card">
              <h4>1. Real Topological Analysis</h4>
              <p>Betweenness Centrality, PageRank, and Tarjan's Strongly Connected Components (SCC) computed over the structural AST.</p>
            </div>
            <div class="manual-card">
              <h4>2. What-If Impact Simulation</h4>
              <p>Quantifies collateral damage and cascading failure propagation through all direct and transitive dependents.</p>
            </div>
          </div>
        </div>
      `,

      controls: isEs ? `
        <div class="manual-section">
          <h3>CONTROLES DE NAVEGACIÓN Y CÁMARA</h3>
          <p>Navega fluidamente por el universo de software con control de precisión:</p>
          <div class="controls-table">
            <div class="c-row"><span class="key">Arrastrar Ratón (Click Izquierdo)</span><span>Desplazar la cámara por el espacio (Pan).</span></div>
            <div class="c-row"><span class="key">Rueda del Ratón (Scroll)</span><span>Zoom exponencial profundo (0.05x hasta 12.0x) centrado exactamente en el cursor.</span></div>
            <div class="c-row"><span class="key">Doble Clic en un Nodo</span><span>Centrar cámara y enfocar con aumento (3.0x).</span></div>
            <div class="c-row"><span class="key">W / A / S / D  o  Flechas</span><span>Navegación de cámara por teclado.</span></div>
            <div class="c-row"><span class="key">Click en Nodo</span><span>Seleccionar entidad, fijar retícula de objetivo y abrir el Inspector lateral.</span></div>
            <div class="c-row"><span class="key">Hover sobre Nodo</span><span>Mostrar tarjeta flotante de telemetría (HUD Tooltip).</span></div>
            <div class="c-row"><span class="key">Botón RESET</span><span>Restablecer la vista a la panorámica inicial del sistema.</span></div>
          </div>
        </div>
      ` : `
        <div class="manual-section">
          <h3>NAVIGATION & CAMERA CONTROLS</h3>
          <p>Fluid, high-precision controls for exploring complex software universes:</p>
          <div class="controls-table">
            <div class="c-row"><span class="key">Left Click + Drag</span><span>Pan camera across the spatial universe.</span></div>
            <div class="c-row"><span class="key">Mouse Wheel (Scroll)</span><span>Deep exponential zoom (0.05x to 12.0x) anchored precisely on cursor position.</span></div>
            <div class="c-row"><span class="key">Double Click on Node</span><span>Instantly center camera and zoom in (3.0x magnification).</span></div>
            <div class="c-row"><span class="key">W / A / S / D  or  Arrow Keys</span><span>Smooth keyboard camera panning.</span></div>
            <div class="c-row"><span class="key">Single Click on Node</span><span>Lock target reticle and open side Inspector drawer.</span></div>
            <div class="c-row"><span class="key">Mouse Hover on Node</span><span>Display real-time floating cyber telemetry HUD tooltip.</span></div>
            <div class="c-row"><span class="key">RESET Button</span><span>Reset camera position and zoom back to default system view.</span></div>
          </div>
        </div>
      `,

      biomes: isEs ? `
        <div class="manual-section">
          <h3>BIOMAS Y SECTORES ARQUITECTÓNICOS</h3>
          <p>Cada subsistema del software habita en su propio territorio geográfico delimitado:</p>
          <div class="biome-guide-grid">
            <div class="biome-card" style="border-left:4px solid #38bdf8">
              <h4>CIUDADELA CENTRAL (Core Citadel)</h4>
              <p>Módulos de orquestación, pipelines de renderizado, controladores y bucles principales.</p>
            </div>
            <div class="biome-card" style="border-left:4px solid #a855f7">
              <h4>METRÓPOLIS GRID (UI)</h4>
              <p>Componentes visuales, vistas, widgets, plantillas JSX/TSX y motores de temas.</p>
            </div>
            <div class="biome-card" style="border-left:4px solid #f59e0b">
              <h4>RED DE ENERGÍA (Power Grid / State)</h4>
              <p>Manejadores de estado centralizado, stores, reducers, buses de eventos y gestión de historial.</p>
            </div>
            <div class="biome-card" style="border-left:4px solid #3b82f6">
              <h4>BÚNKER SUBTERRÁNEO (Database & Storage)</h4>
              <p>Persistencia, adaptadores de bases de datos, IndexedDB, Redis y motores de caché.</p>
            </div>
            <div class="biome-card" style="border-left:4px solid #06b6d4">
              <h4>CENTRO DE TRANSMISIÓN (Network & API)</h4>
              <p>Enrutadores, endpoints REST, WebSockets, pasarelas de red y pipeline de IA.</p>
            </div>
            <div class="biome-card" style="border-left:4px solid #10b981">
              <h4>LABORATORIOS DE INVESTIGACIÓN (Tests)</h4>
              <p>Suites de pruebas unitarias, fixtures, mocks, aserciones y benchmarks de rendimiento.</p>
            </div>
            <div class="biome-card" style="border-left:4px solid #f43f5e">
              <h4>SECTOR DE PELIGRO (Hazard Zone)</h4>
              <p>Módulos de alto acoplamiento, cuellos de botella con alto churn y ciclos circulares.</p>
            </div>
            <div class="biome-card" style="border-left:4px solid #64748b">
              <h4>RUINAS OLVIDADAS (Dead Code)</h4>
              <p>Código muerto, utilidades aisladas sin dependientes y funciones deprecadas.</p>
            </div>
          </div>
        </div>
      ` : `
        <div class="manual-section">
          <h3>ARCHITECTURAL BIOMES & SECTORS</h3>
          <p>Every software domain occupies its own dedicated spatial territory:</p>
          <div class="biome-guide-grid">
            <div class="biome-card" style="border-left:4px solid #38bdf8">
              <h4>CORE CITADEL</h4>
              <p>Central orchestrators, execution pipelines, main engines, and kernel loops.</p>
            </div>
            <div class="biome-card" style="border-left:4px solid #a855f7">
              <h4>METROPOLIS GRID (UI)</h4>
              <p>Presentation layer, views, UI widgets, component trees, and theme engines.</p>
            </div>
            <div class="biome-card" style="border-left:4px solid #f59e0b">
              <h4>POWER GRID (STATE)</h4>
              <p>State stores, dispatchers, action reducers, and global event message buses.</p>
            </div>
            <div class="biome-card" style="border-left:4px solid #3b82f6">
              <h4>SUBTERRANEAN BUNKER (STORAGE)</h4>
              <p>Persistence layers, database drivers, IndexedDB, and cluster cache systems.</p>
            </div>
            <div class="biome-card" style="border-left:4px solid #06b6d4">
              <h4>TRANSMISSION HUB (API)</h4>
              <p>Network routers, REST/GraphQL gateways, WebSockets, and AI pipelines.</p>
            </div>
            <div class="biome-card" style="border-left:4px solid #10b981">
              <h4>RESEARCH LABS (TESTS)</h4>
              <p>Unit test fixtures, assertions, mocks, and performance benchmarks.</p>
            </div>
            <div class="biome-card" style="border-left:4px solid #f43f5e">
              <h4>HAZARD SECTOR</h4>
              <p>High-risk bottlenecks, circular dependencies, and high-churn instability hubs.</p>
            </div>
            <div class="biome-card" style="border-left:4px solid #64748b">
              <h4>FORGOTTEN RUINS</h4>
              <p>Dead code clusters, deprecated helpers, and zero-inbound leaf utilities.</p>
            </div>
          </div>
        </div>
      `,

      codedex: isEs ? `
        <div class="manual-section">
          <h3>CODEDEX Y FÓRMULA DE RAREZA</h3>
          <p>La rareza de cada entidad no es arbitraria; se calcula a partir de percentiles relativos del proyecto:</p>
          <div class="formula-box">
            <code>Rarity Score = 0.35 × Centralidad + 0.25 × Influencia + 0.20 × Complejidad + 0.20 × Acoplamiento</code>
          </div>
          <div class="rarity-breakdown-list">
            <div class="r-item"><span class="r-badge rarity-common">COMÚN (0-40)</span><span>Funciones hoja simples, constantes de configuración y utilidades pequeñas.</span></div>
            <div class="r-item"><span class="r-badge rarity-uncommon">POCO COMÚN (40-60)</span><span>Componentes visuales estándar, controladores aislados y adaptadores de datos.</span></div>
            <div class="r-item"><span class="r-badge rarity-rare">RARO (60-75)</span><span>Manejadores de estado, proveedores de contexto y parsers de dominio.</span></div>
            <div class="r-item"><span class="r-badge rarity-epic">ÉPICO (75-90)</span><span>Motores de renderizado, orquestadores de red y pipelines centrales.</span></div>
            <div class="r-item"><span class="r-badge rarity-legendary">LEGENDARIO (90-97)</span><span>Pilares arquitectónicos fundamentales con centralidad superior al 90%.</span></div>
            <div class="r-item"><span class="r-badge rarity-mythic">MÍTICO / BOSS (97-100)</span><span>Entidades ultra-críticas con alta concentración de dependientes y riesgo estructural.</span></div>
          </div>
        </div>
      ` : `
        <div class="manual-section">
          <h3>CODEDEX & RARITY FORMULA</h3>
          <p>Entity rarity is dynamically calculated using relative project percentiles:</p>
          <div class="formula-box">
            <code>Rarity Score = 0.35 × Centrality + 0.25 × Influence + 0.20 × Complexity + 0.20 × Coupling</code>
          </div>
          <div class="rarity-breakdown-list">
            <div class="r-item"><span class="r-badge rarity-common">COMMON (0-40)</span><span>Pure leaf functions, config constants, and simple helpers.</span></div>
            <div class="r-item"><span class="r-badge rarity-uncommon">UNCOMMON (40-60)</span><span>Standard UI components, isolated route handlers, and data models.</span></div>
            <div class="r-item"><span class="r-badge rarity-rare">RARE (60-75)</span><span>State stores, context providers, and domain pipeline adapters.</span></div>
            <div class="r-item"><span class="r-badge rarity-epic">EPIC (75-90)</span><span>Domain engines, protocol coordinators, and major renderers.</span></div>
            <div class="r-item"><span class="r-badge rarity-legendary">LEGENDARY (90-97)</span><span>Cornerstone modules controlling more execution paths than 90% of the repo.</span></div>
            <div class="r-item"><span class="r-badge rarity-mythic">MYTHIC / BOSS (97-100)</span><span>Ultra-central bottlenecks with high fan-in and structural volatility.</span></div>
          </div>
        </div>
      `,

      quests: isEs ? `
        <div class="manual-section">
          <h3>MISIONES DE ARQUITECTURA Y PROGRESIÓN</h3>
          <p>Aprende cualquier repositorio resolviendo misiones guiadas por su topología real:</p>
          <div class="manual-grid-2">
            <div class="manual-card">
              <h4>Misiones de Onboarding</h4>
              <p>Encuentra el punto de entrada (Genesis Point), el motor de renderizado y la capa de persistencia para familiarizarte con el proyecto en minutos.</p>
            </div>
            <div class="manual-card">
              <h4>Detective de Código & Bounties</h4>
              <p>Rastrea causas raíz de anomalías circulares y cuellos de botella con recompensas de XP.</p>
            </div>
          </div>
          <p style="margin-top:14px;"><strong>Rangos del Arquitecto:</strong> <code>Intern (Lvl 1) → Junior (Lvl 2) → Senior (Lvl 4) → Staff Architect (Lvl 6) → Principal (Lvl 8) → Codebase Overlord (Lvl 10)</code>.</p>
        </div>
      ` : `
        <div class="manual-section">
          <h3>ARCHITECTURE QUESTS & PROGRESSION</h3>
          <p>Master any codebase through procedural quests derived from structural topology:</p>
          <div class="manual-grid-2">
            <div class="manual-card">
              <h4>Onboarding Questline</h4>
              <p>Discover the Genesis Point, primary processing engine, and persistence vault to master architecture in minutes.</p>
            </div>
            <div class="manual-card">
              <h4>Code Detective & Bounties</h4>
              <p>Investigate circular anomaly wormholes and high-risk hotspots for high XP rewards.</p>
            </div>
          </div>
          <p style="margin-top:14px;"><strong>Architect Ranks:</strong> <code>Intern (Lvl 1) → Junior (Lvl 2) → Senior (Lvl 4) → Staff Architect (Lvl 6) → Principal (Lvl 8) → Codebase Overlord (Lvl 10)</code>.</p>
        </div>
      `,

      threats: isEs ? `
        <div class="manual-section">
          <h3>ARENA DE AMENAZAS Y SIMULADOR DE REFACTORING</h3>
          <p>Identifica los módulos que nadie se atreve a tocar (The Death Star, Cyclic Wormholes) y simula su desacoplamiento sin alterar el código real:</p>
          <div class="manual-grid-2">
            <div class="manual-card">
              <h4>Estrategias Disponibles</h4>
              <p>• <strong>Romper Ciclo:</strong> Elimina llamadas mutuas inversas.<br>• <strong>Dividir Módulo:</strong> Extrae un worker especializado.<br>• <strong>Introducir Interfaz:</strong> Invierte dependencias.<br>• <strong>Aislar Subsistema:</strong> Elimina acoplamiento de salida.</p>
            </div>
            <div class="manual-card">
              <h4>Telemetría Antes vs Después</h4>
              <p>Calcula la reducción instantánea de Riesgo (ej. 87% → 61%) y Radio de Impacto (41% → 27%) ganando +500 XP al validar.</p>
            </div>
          </div>
        </div>
      ` : `
        <div class="manual-section">
          <h3>THREAT ARENA & REFACTOR SIMULATOR</h3>
          <p>Identify monolithic bottlenecks (The Death Star, Cyclic Wormholes) and simulate decoupling non-destructively:</p>
          <div class="manual-grid-2">
            <div class="manual-card">
              <h4>Available Strategies</h4>
              <p>• <strong>Break Cycle:</strong> Sever circular feedback loops.<br>• <strong>Split Module:</strong> Extract dedicated worker service.<br>• <strong>Introduce Interface:</strong> Invert dependencies via adapters.<br>• <strong>Isolate:</strong> Eliminate outgoing coupling dependencies.</p>
            </div>
            <div class="manual-card">
              <h4>Before vs After Delta</h4>
              <p>Computes instant risk reduction (e.g. 87% → 61%) and blast radius shrinkage (41% → 27%) with +500 XP reward.</p>
            </div>
          </div>
        </div>
      `,

      whatif: isEs ? `
        <div class="manual-section">
          <h3>LABORATORIO WHAT-IF // SIMULADOR DE IMPACTO</h3>
          <p><strong>"¿Qué ocurre si elimino o modifico este módulo?"</strong></p>
          <p>Selecciona cualquier entidad y ejecuta la simulación para calcular el radio de daño colateral:</p>
          <div class="manual-grid-2">
            <div class="manual-card">
              <h4>Escenarios de Simulación</h4>
              <p>1. <strong>Caída / Eliminación Total:</strong> Simula la desaparición de un servicio.<br>2. <strong>Cambio de Contrato:</strong> Simula rotura de interfaces y firmas.<br>3. <strong>Aislamiento:</strong> Simula encapsulamiento independiente.</p>
            </div>
            <div class="manual-card">
              <h4>Onda de Choque y Apagón (Blackout)</h4>
              <p>Visualiza en el mapa una onda expansiva que apaga progresivamente todos los dependientes directos e indirectos afectados.</p>
            </div>
          </div>
        </div>
      ` : `
        <div class="manual-section">
          <h3>WHAT-IF IMPACT LABORATORY</h3>
          <p><strong>"What happens if this module fails or interface changes?"</strong></p>
          <p>Select any entity and execute the simulation to quantify collateral damage:</p>
          <div class="manual-grid-2">
            <div class="manual-card">
              <h4>Simulation Scenarios</h4>
              <p>1. <strong>Module Failure / Deletion:</strong> Simulates total outage.<br>2. <strong>Contract Change:</strong> Simulates broken interface types.<br>3. <strong>Isolation:</strong> Simulates decoupling into a standalone micro-service.</p>
            </div>
            <div class="manual-card">
              <h4>Shockwave & Blackout Cascade</h4>
              <p>Triggers an in-world shockwave that cascades through dependencies, ghosting out affected casualties.</p>
            </div>
          </div>
        </div>
      `,

      timemachine: isEs ? `
        <div class="manual-section">
          <h3>MÁQUINA DEL TIEMPO // EVOLUCIÓN HISTÓRICA GIT</h3>
          <p>Recorre la evolución del software commit a commit desde el Big Bang inicial hasta la versión actual:</p>
          <div class="manual-callout">
            <span class="callout-badge">HISTORIAL</span>
            <span>Observa cuándo nació cada subsistema, cuándo se introdujo el acoplamiento y cómo varió el índice de salud arquitectónica en el tiempo.</span>
          </div>
          <p style="margin-top:10px;">Utiliza los botones <code>PREV</code>, <code>NEXT</code>, <code>PLAY</code> o el slider temporal para reproducir la historia a diferentes velocidades (1x, 2x, 4x).</p>
        </div>
      ` : `
        <div class="manual-section">
          <h3>GIT TIME MACHINE // ARCHITECTURAL EVOLUTION</h3>
          <p>Scrub through historical commit milestones from project genesis to HEAD:</p>
          <div class="manual-callout">
            <span class="callout-badge">HISTORY</span>
            <span>Observe when subsystems were born, when bottlenecks emerged, and track architectural health over releases.</span>
          </div>
          <p style="margin-top:10px;">Use <code>PREV</code>, <code>NEXT</code>, <code>PLAY</code> or the timeline slider to scrub through evolutionary generations at 1x, 2x, or 4x speed.</p>
        </div>
      `
    };

    this.contentContainer.innerHTML = contentMap[this.activeTab] || contentMap.overview;
  }
}
