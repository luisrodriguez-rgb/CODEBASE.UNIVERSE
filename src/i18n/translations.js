/**
 * Comprehensive Bilingual Translation Engine (EN / ES) for CODEBASE.UNIVERSE.
 */

export const TRANSLATIONS = {
  en: {
    brand_title: 'CODEBASE.UNIVERSE',
    brand_subtitle: 'Explore your software as a living system.',
    brand_version: 'v2.1.0',
    system_online: 'SYSTEM // ONLINE',
    
    // Header telemetry
    project_label: 'PROJECT:',
    status_developing: 'DEVELOPING',
    status_stable: 'STABLE',
    status_critical: 'CRITICAL',
    stat_entities: 'ENTITIES',
    stat_edges: 'EDGES',
    stat_risk: 'RISK',
    stat_knowledge: 'KNOWLEDGE',
    stat_rank: 'RANK',
    
    // Floating controls
    search_placeholder: 'Search function, module, class, file...',
    filter_all: 'ALL',
    filter_modules: 'MODULES',
    filter_functions: 'FUNCTIONS',
    filter_hotspots: 'HOTSPOTS',
    filter_cycles: 'ANOMALIES (CYCLES)',
    filter_threats: 'THREATS',
    filter_unused: 'DEAD CODE',
    
    // Zoom badges
    level_project: 'LEVEL: PROJECT',
    level_subsystem: 'LEVEL: SUBSYSTEM',
    level_module: 'LEVEL: MODULE',
    level_detail: 'LEVEL: FUNCTION / DETAIL',
    cam_reset: 'RESET',
    radar_title: 'RADAR // TOPOLOGY',
    
    // Dock tabs
    dock_world: 'WORLD MAP',
    dock_codedex: 'CODEDEX',
    dock_quests: 'QUESTS',
    dock_threats: 'THREAT ARENA',
    dock_whatif: 'WHAT-IF LAB',
    dock_timeline: 'TIME MACHINE',
    dock_switch_repo: 'SWITCH REPO',
    dock_manual: 'MANUAL',
    active_badge: 'ACTIVE',
    detected_badge: 'DETECTED',
    
    // Biomes
    biome_core: 'CORE CITADEL',
    biome_core_desc: 'Central Orchestration & Execution Pipeline',
    biome_ui: 'METROPOLIS GRID (UI)',
    biome_ui_desc: 'Components, Viewports, Templates & Themes',
    biome_power: 'POWER GRID (STATE)',
    biome_power_desc: 'State Stores, Action Dispatchers & History Bus',
    biome_bunker: 'SUBTERRANEAN BUNKER',
    biome_bunker_desc: 'Database, Storage Engines & Persistence',
    biome_network: 'TRANSMISSION HUB (API)',
    biome_network_desc: 'Network Protocols, AI Pipeline & Gateways',
    biome_lab: 'RESEARCH LABS',
    biome_lab_desc: 'Test Suites, Mocks & Benchmarks',
    biome_hazard: 'HAZARD SECTOR',
    biome_hazard_desc: 'High Risk Hotspots & Circular Anomalies',
    biome_ruins: 'FORGOTTEN RUINS',
    biome_ruins_desc: 'Dead Code & Deprecated Utilities',

    // Rarities
    rarity_common: 'COMMON',
    rarity_uncommon: 'UNCOMMON',
    rarity_rare: 'RARE',
    rarity_epic: 'EPIC',
    rarity_legendary: 'LEGENDARY',
    rarity_mythic: 'MYTHIC',

    // Inspector
    inspect_centrality: 'CENTRALITY',
    inspect_importance: 'IMPORTANCE',
    inspect_risk: 'STRUCTURAL RISK',
    inspect_complexity: 'CYCLOMATIC MASS',
    inspect_dependents: 'DEPENDENTS (FAN-IN)',
    inspect_dependencies: 'DEPENDENCIES (FAN-OUT)',
    inspect_knowledge: 'KNOWLEDGE STATE',
    tag_discovered: 'DISCOVERED',
    tag_understood: 'UNDERSTOOD',
    tag_mastered: 'MASTERED',
    btn_sim_failure: 'SIMULATE FAILURE',
    btn_sim_change: 'SIMULATE CONTRACT CHANGE',
    inspect_callers: 'DIRECT CALLERS / DEPENDENTS',
    inspect_deps: 'OUTGOING DEPENDENCIES',
    inspect_diagnosis: 'ARCHITECTURAL DIAGNOSIS',

    // CodeDex
    codedex_title: 'CODEDEX // ENTITY REGISTRY',
    codedex_collected: 'COLLECTED:',
    codedex_completion: 'COMPLETION:',
    codedex_search_placeholder: 'Filter CodeDex entries...',
    codedex_undiscovered: '??? [UNDISCOVERED]',
    codedex_explore_hint: 'Explore world to reveal location',

    // Quests
    quests_title: 'ARCHITECTURE QUESTS // ONBOARDING & BOUNTIES',
    quests_rewards_available: 'TOTAL REWARDS AVAILABLE:',
    quest_tab_all: 'ALL QUESTS',
    quest_tab_onboarding: 'ONBOARDING (LEARN THIS REPO)',
    quest_tab_detective: 'CODE DETECTIVE',
    quest_tab_daily: 'DAILY CHALLENGE',
    btn_track: 'TRACK // LOCATE',
    btn_completed: 'COMPLETED ✓',
    quest_hint_prefix: 'HINT:',

    // Threats & Refactor
    threat_title: 'ARCHITECTURAL THREAT ARENA // REFACTOR SIMULATOR',
    threat_stability: 'SYSTEM STABILITY:',
    threat_detected_heading: 'DETECTED ARCHITECTURAL THREATS',
    threat_locate: 'LOCATE ON MAP',
    threat_why: 'THREAT DIAGNOSIS',
    threat_simulate_heading: 'SIMULATE REFACTORING STRATEGY',
    strat_break_cycle: 'BREAK CYCLE',
    strat_split_module: 'SPLIT MODULE',
    strat_introduce_interface: 'INTRODUCE INTERFACE',
    strat_isolate: 'ISOLATE SUBSYSTEM',
    before_sim: 'BEFORE SIMULATION',
    after_sim: 'AFTER REFACTOR (HYPOTHETICAL)',
    btn_validate_refactor: 'VALIDATE REFACTOR STRATEGY (+500 XP)',

    // What If
    whatif_title: 'WHAT-IF IMPACT LABORATORY // BLAST RADIUS ENGINE',
    whatif_hypothesis: 'HYPOTHESIS SETUP',
    whatif_target_label: 'TARGET MODULE / ENTITY',
    whatif_scenario_label: 'SIMULATION SCENARIO',
    opt_failure: 'Module Deletion / Total Failure',
    opt_contract: 'Interface / Contract Change',
    opt_isolate: 'Subsystem Isolation',
    btn_run_sim: 'EXECUTE SIMULATION',
    whatif_telemetry_heading: 'IMPACT TELEMETRY & BLAST RADIUS',
    whatif_empty_prompt: 'Select a target entity and click Execute Simulation to propagate architectural consequences.',
    stat_affected: 'TOTAL AFFECTED',
    stat_direct: 'DIRECT DEPENDENTS',
    stat_indirect: 'INDIRECT CASUALTIES',
    stat_critical_paths: 'CRITICAL BREAKPOINTS',
    stat_blast_radius: 'ESTIMATED SYSTEM BLAST RADIUS',
    whatif_cascade_log: 'IMPACTED DOWNSTREAM MODULES & CASUALTY LOG',
    btn_view_blackout: 'VIEW BLACKOUT CASCADE IN WORLD MAP',

    // Git Time Machine
    timeline_title: 'GIT TIME MACHINE // ARCHITECTURAL EVOLUTION',
    btn_prev: '◄ PREV',
    btn_play: '▶ PLAY',
    btn_pause: '⏸ PAUSE',
    btn_next: 'NEXT ►',
    tl_evolution: 'EVOLUTION:',
    tl_entities: 'ENTITIES AT COMMIT:',
    tl_connections: 'CONNECTIONS:',
    tl_health: 'ARCHITECTURAL HEALTH:',

    // Title Screen
    splash_title: 'CODEBASE.UNIVERSE',
    splash_subtitle: 'Explore your software as a living system.',
    splash_select_label: 'SELECT CODEBASE UNIVERSE:',
    opt_sketion: 'SKETION ENGINE (568 entities, 1,520 relations, 7 threats)',
    opt_router: 'NEO-API GATEWAY & DISTRIBUTED ROUTER (312 entities, 840 relations)',
    opt_custom: 'IMPORT CUSTOM CODEBASE (JSON / AST / DIRECTORY)',
    custom_drop_hint: 'Drag & drop graph JSON or AST export here, or click to upload',
    btn_enter_world: '[ ENTER WORLD // INITIALIZE SIMULATION ]',
    
    // Manual
    manual_title: "ARCHITECT'S CODEX // SYSTEM MANUAL",
    tab_manual_overview: 'OVERVIEW',
    tab_manual_controls: 'CONTROLS & NAVIGATION',
    tab_manual_biomes: 'BIOMES & SECTORS',
    tab_manual_codedex: 'CODEDEX & RARITY',
    tab_manual_quests: 'QUESTS & PROGRESSION',
    tab_manual_threats: 'THREATS & REFACTOR',
    tab_manual_whatif: 'WHAT-IF & BLAST RADIUS',
    tab_manual_timemachine: 'GIT TIME MACHINE'
  },

  es: {
    brand_title: 'CODEBASE.UNIVERSE',
    brand_subtitle: 'Explora tu software como un sistema vivo.',
    brand_version: 'v2.1.0',
    system_online: 'SISTEMA // EN LÍNEA',
    
    // Header telemetry
    project_label: 'PROYECTO:',
    status_developing: 'EN DESARROLLO',
    status_stable: 'ESTABLE',
    status_critical: 'CRÍTICO',
    stat_entities: 'ENTIDADES',
    stat_edges: 'CONEXIONES',
    stat_risk: 'RIESGO',
    stat_knowledge: 'CONOCIMIENTO',
    stat_rank: 'RANGO',
    
    // Floating controls
    search_placeholder: 'Buscar función, módulo, clase, archivo...',
    filter_all: 'TODO',
    filter_modules: 'MÓDULOS',
    filter_functions: 'FUNCIONES',
    filter_hotspots: 'HOTSPOTS',
    filter_cycles: 'ANOMALÍAS (CICLOS)',
    filter_threats: 'AMENAZAS',
    filter_unused: 'CÓDIGO MUERTO',
    
    // Zoom badges
    level_project: 'NIVEL: PROYECTO',
    level_subsystem: 'NIVEL: SUBSISTEMA',
    level_module: 'NIVEL: MÓDULO',
    level_detail: 'NIVEL: FUNCIÓN / DETALLE',
    cam_reset: 'REINICIAR',
    radar_title: 'RADAR // TOPOLOGÍA',
    
    // Dock tabs
    dock_world: 'MAPA DEL MUNDO',
    dock_codedex: 'CODEDEX',
    dock_quests: 'MISIONES',
    dock_threats: 'ARENA DE AMENAZAS',
    dock_whatif: 'LABORATORIO WHAT-IF',
    dock_timeline: 'MÁQUINA DEL TIEMPO',
    dock_switch_repo: 'CAMBIAR REPOSITORIO',
    dock_manual: 'MANUAL',
    active_badge: 'ACTIVAS',
    detected_badge: 'DETECTADAS',
    
    // Biomes
    biome_core: 'CIUDADELA CENTRAL',
    biome_core_desc: 'Orquestación Central y Pipeline de Ejecución',
    biome_ui: 'METRÓPOLIS GRID (UI)',
    biome_ui_desc: 'Componentes, Vistas, Plantillas y Temas',
    biome_power: 'RED DE ENERGÍA (ESTADO)',
    biome_power_desc: 'Gestión de Estado, Despachadores y Bus de Eventos',
    biome_bunker: 'BÚNKER SUBTERRÁNEO',
    biome_bunker_desc: 'Base de Datos, Motores de Almacenamiento y Caché',
    biome_network: 'CENTRO DE TRANSMISIÓN (API)',
    biome_network_desc: 'Protocolos de Red, Pipeline de IA y Pasarelas',
    biome_lab: 'LABORATORIOS DE INVESTIGACIÓN',
    biome_lab_desc: 'Suites de Pruebas, Mocks y Benchmarks',
    biome_hazard: 'SECTOR DE PELIGRO',
    biome_hazard_desc: 'Hotspots de Alto Riesgo y Anomalías Circulares',
    biome_ruins: 'RUINAS OLVIDADAS',
    biome_ruins_desc: 'Código Muerto y Utilidades Deprecadas',

    // Rarities
    rarity_common: 'COMÚN',
    rarity_uncommon: 'POCO COMÚN',
    rarity_rare: 'RARO',
    rarity_epic: 'ÉPICO',
    rarity_legendary: 'LEGENDARIO',
    rarity_mythic: 'MÍTICO',

    // Inspector
    inspect_centrality: 'CENTRALIDAD',
    inspect_importance: 'IMPORTANCIA',
    inspect_risk: 'RIESGO ESTRUCTURAL',
    inspect_complexity: 'MASA CICLOMÁTICA',
    inspect_dependents: 'DEPENDIENTES (FAN-IN)',
    inspect_dependencies: 'DEPENDENCIAS (FAN-OUT)',
    inspect_knowledge: 'ESTADO DE CONOCIMIENTO',
    tag_discovered: 'DESCUBIERTO',
    tag_understood: 'COMPRENDIDO',
    tag_mastered: 'DOMINADO',
    btn_sim_failure: 'SIMULAR CAÍDA / FALLO',
    btn_sim_change: 'SIMULAR CAMBIO DE CONTRATO',
    inspect_callers: 'QUIÉNES LO LLAMAN (DIRECTOS)',
    inspect_deps: 'DEPENDENCIAS DE SALIDA',
    inspect_diagnosis: 'DIAGNÓSTICO ARQUITECTÓNICO',

    // CodeDex
    codedex_title: 'CODEDEX // REGISTRO DE ENTIDADES',
    codedex_collected: 'COLECCIONADAS:',
    codedex_completion: 'PROGRESO:',
    codedex_search_placeholder: 'Filtrar entidades del CodeDex...',
    codedex_undiscovered: '??? [NO DESCUBIERTO]',
    codedex_explore_hint: 'Explora el mundo para revelar su ubicación',

    // Quests
    quests_title: 'MISIONES DE ARQUITECTURA // ONBOARDING Y CASOS',
    quests_rewards_available: 'RECOMPENSAS TOTALES DISPONIBLES:',
    quest_tab_all: 'TODAS LAS MISIONES',
    quest_tab_onboarding: 'ONBOARDING (APRENDE ESTE REPO)',
    quest_tab_detective: 'DETECTIVE DE CÓDIGO',
    quest_tab_daily: 'DESAFÍO DIARIO',
    btn_track: 'RASTREAR // LOCALIZAR',
    btn_completed: 'COMPLETADO ✓',
    quest_hint_prefix: 'PISTA:',

    // Threats & Refactor
    threat_title: 'ARENA DE AMENAZAS // SIMULADOR DE REFACTORING',
    threat_stability: 'ESTABILIDAD DEL SISTEMA:',
    threat_detected_heading: 'AMENAZAS ARQUITECTÓNICAS DETECTADAS',
    threat_locate: 'LOCALIZAR EN MAPA',
    threat_why: 'DIAGNÓSTICO DE LA AMENAZA',
    threat_simulate_heading: 'SIMULAR ESTRATEGIA DE REFACTORIZACIÓN',
    strat_break_cycle: 'ROMPER CICLO',
    strat_split_module: 'DIVIDIR MÓDULO',
    strat_introduce_interface: 'INTRODUCIR INTERFAZ',
    strat_isolate: 'AISLAR SUBSISTEMA',
    before_sim: 'ANTES DE LA SIMULACIÓN',
    after_sim: 'DESPUÉS DEL REFACTOR (HIPOTÉTICO)',
    btn_validate_refactor: 'VALIDAR ESTRATEGIA (+500 XP)',

    // What If
    whatif_title: 'LABORATORIO WHAT-IF // MOTOR DE BLAST RADIUS',
    whatif_hypothesis: 'CONFIGURACIÓN DE HIPÓTESIS',
    whatif_target_label: 'MÓDULO / ENTIDAD OBJETIVO',
    whatif_scenario_label: 'ESCENARIO DE SIMULACIÓN',
    opt_failure: 'Eliminación de Módulo / Caída Total',
    opt_contract: 'Cambio de Interfaz / Tipo de Contrato',
    opt_isolate: 'Aislamiento de Subsistema',
    btn_run_sim: 'EJECUTAR SIMULACIÓN',
    whatif_telemetry_heading: 'TELEMETRÍA DE IMPACTO Y RADIO DE CHOQUE',
    whatif_empty_prompt: 'Selecciona una entidad objetivo y pulsa Ejecutar Simulación para propagar las consecuencias arquitectónicas.',
    stat_affected: 'ARCHIVOS AFECTADOS',
    stat_direct: 'DEPENDIENTES DIRECTOS',
    stat_indirect: 'BAJAS INDIRECTAS',
    stat_critical_paths: 'PUNTOS CRÍTICOS ROTOS',
    stat_blast_radius: 'RADIO DE IMPACTO DEL SISTEMA',
    whatif_cascade_log: 'MÓDULOS DOWNSTREAM IMPACTADOS',
    btn_view_blackout: 'VER APAGÓN EN EL MAPA DEL MUNDO',

    // Git Time Machine
    timeline_title: 'MÁQUINA DEL TIEMPO // EVOLUCIÓN ARQUITECTÓNICA',
    btn_prev: '◄ ANTERIOR',
    btn_play: '▶ REPRODUCIR',
    btn_pause: '⏸ PAUSA',
    btn_next: 'SIGUIENTE ►',
    tl_evolution: 'EVOLUCIÓN:',
    tl_entities: 'ENTIDADES EN COMMIT:',
    tl_connections: 'CONEXIONES:',
    tl_health: 'SALUD ARQUITECTÓNICA:',

    // Title Screen
    splash_title: 'CODEBASE.UNIVERSE',
    splash_subtitle: 'Explora tu software como un sistema vivo.',
    splash_select_label: 'SELECCIONA EL UNIVERSO DE CÓDIGO:',
    opt_sketion: 'SKETION ENGINE (568 entidades, 1.520 relaciones, 7 amenazas)',
    opt_router: 'NEO-API GATEWAY Y ENRUTADOR (312 entidades, 840 relaciones)',
    opt_custom: 'IMPORTAR CÓDIGO PERSONALIZADO (JSON / AST / DIRECTORIO)',
    custom_drop_hint: 'Arrastra y suelta tu archivo JSON de grafo o AST aquí, o haz clic para subirlo',
    btn_enter_world: '[ ENTRAR AL MUNDO // INICIALIZAR SIMULACIÓN ]',

    // Manual
    manual_title: 'CÓDICE DEL ARQUITECTO // MANUAL DEL SISTEMA',
    tab_manual_overview: 'VISIÓN GENERAL',
    tab_manual_controls: 'CONTROLES Y NAVEGACIÓN',
    tab_manual_biomes: 'BIOMAS Y SECTORES',
    tab_manual_codedex: 'CODEDEX Y RAREZA',
    tab_manual_quests: 'MISIONES Y PROGRESIÓN',
    tab_manual_threats: 'AMENAZAS Y REFACTOR',
    tab_manual_whatif: 'WHAT-IF Y BLAST RADIUS',
    tab_manual_timemachine: 'MÁQUINA DEL TIEMPO'
  }
};

class I18nService {
  constructor() {
    this.currentLang = localStorage.getItem('codebase_universe_lang') || 'es';
    this.listeners = new Set();
  }

  setLanguage(lang) {
    if (lang !== 'en' && lang !== 'es') return;
    this.currentLang = lang;
    localStorage.setItem('codebase_universe_lang', lang);
    this.notify();
  }

  toggleLanguage() {
    this.setLanguage(this.currentLang === 'en' ? 'es' : 'en');
  }

  t(key) {
    const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;
    return dict[key] || key;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    for (const cb of this.listeners) {
      cb(this.currentLang);
    }
  }
}

export const i18n = new I18nService();
