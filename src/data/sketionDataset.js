/**
 * High-Fidelity Dataset: SKETION ENGINE ARCHITECTURE.
 * Models a production modular rendering, projection, template, AI, and UI engine (568 entities, 1,520 relations).
 */

import { CodeGraph } from '../analysis/graph.js';

export function buildSketionGraph() {
  const graph = new CodeGraph();

  // Subsystem Sector Definitions
  const subsystems = [
    { prefix: 'core', biome: 'core', locBase: 250, count: 65, label: 'Core Kernel & Orchestrators' },
    { prefix: 'renderer', biome: 'core', locBase: 380, count: 85, label: 'Canvas & SVG Rendering Pipeline' },
    { prefix: 'projection', biome: 'core', locBase: 220, count: 55, label: 'Geometric Projection & Transforms' },
    { prefix: 'template', biome: 'ui', locBase: 140, count: 75, label: 'Template Engine & DSL Synthesizer' },
    { prefix: 'ui', biome: 'ui', locBase: 95, count: 90, label: 'Metropolis UI & Widget Tree' },
    { prefix: 'ai', biome: 'network', locBase: 310, count: 48, label: 'AI Prompt & Vector Spatial Pipeline' },
    { prefix: 'theme', biome: 'ui', locBase: 80, count: 40, label: 'Theme Tokens & Palette Engine' },
    { prefix: 'store', biome: 'power', locBase: 180, count: 45, label: 'Power Grid State & History Bus' },
    { prefix: 'db', biome: 'bunker', locBase: 210, count: 35, label: 'Persistence & Cache Bunker' },
    { prefix: 'lab', biome: 'lab', locBase: 110, count: 30, label: 'Test Suites & Assertions' }
  ];

  // Specific Key Landmark Nodes
  const keyNodes = [
    { id: 'sketion.app', name: 'sketion.app.ts', path: 'src/sketion.app.ts', type: 'project', biome: 'core', loc: 420, churn: 18 },
    { id: 'engine.renderer', name: 'renderer.ts', path: 'src/engine/renderer.ts', type: 'module', biome: 'core', loc: 680, cyclomatic: 38, churn: 42 },
    { id: 'engine.projection', name: 'projection_engine.ts', path: 'src/engine/projection_engine.ts', type: 'module', biome: 'core', loc: 390, cyclomatic: 22, churn: 15 },
    { id: 'engine.template', name: 'template_engine.ts', path: 'src/engine/template_engine.ts', type: 'module', biome: 'ui', loc: 340, cyclomatic: 18, churn: 12 },
    { id: 'engine.exporter', name: 'export_engine.ts', path: 'src/engine/export_engine.ts', type: 'module', biome: 'core', loc: 290, cyclomatic: 14, churn: 8 },
    { id: 'engine.ai', name: 'ai_engine.ts', path: 'src/ai/ai_engine.ts', type: 'module', biome: 'network', loc: 450, cyclomatic: 24, churn: 28 },
    { id: 'store.root', name: 'rootStore.ts', path: 'src/store/rootStore.ts', type: 'module', biome: 'power', loc: 310, cyclomatic: 16, churn: 20 },
    { id: 'store.history', name: 'historyManager.ts', path: 'src/store/historyManager.ts', type: 'module', biome: 'power', loc: 260, cyclomatic: 12, churn: 9 },
    { id: 'db.storage', name: 'indexedDbStorage.ts', path: 'src/db/indexedDbStorage.ts', type: 'module', biome: 'bunker', loc: 380, cyclomatic: 19, churn: 7 },
    { id: 'theme.registry', name: 'themeRegistry.ts', path: 'src/theme/themeRegistry.ts', type: 'module', biome: 'ui', loc: 190, cyclomatic: 8, churn: 5 },
    { id: 'ui.canvasView', name: 'CanvasViewport.tsx', path: 'src/ui/CanvasViewport.tsx', type: 'module', biome: 'ui', loc: 480, cyclomatic: 26, churn: 31 },
    { id: 'ui.toolbar', name: 'MainToolbar.tsx', path: 'src/ui/MainToolbar.tsx', type: 'module', biome: 'ui', loc: 220, cyclomatic: 11, churn: 14 }
  ];

  for (const node of keyNodes) {
    graph.addNode(node);
  }

  // Generate procedural sub-entities (Functions, Classes, Slices) across subsystems
  let entityIndex = 1;
  for (const sys of subsystems) {
    for (let i = 1; i <= sys.count; i++) {
      const id = `${sys.prefix}.${i}`;
      if (graph.nodes.has(id)) continue;

      const types = ['function', 'function', 'class', 'interface', 'variable'];
      const type = types[i % types.length];
      const loc = Math.round(sys.locBase * (0.5 + (i % 7) * 0.15));

      graph.addNode({
        id,
        name: `${sys.prefix}_${type}_${i}.ts`,
        path: `src/${sys.prefix}/${type}s/${sys.prefix}_${i}.ts`,
        type,
        biome: sys.biome,
        loc,
        cyclomatic: Math.max(1, Math.round(loc / 18)),
        churn: (i % 5) + 1
      });
      entityIndex++;
      if (entityIndex >= 568) break;
    }
  }

  // Generate Topological Edges & Key Connections
  // 1. Central Core Connections (Renderer has huge fan-in, becoming the Death Star Monolith)
  const allNodeIds = Array.from(graph.nodes.keys());
  
  // Connect app entry to major subsystem hubs
  graph.addEdge({ source: 'sketion.app', target: 'engine.renderer', type: 'imports' });
  graph.addEdge({ source: 'sketion.app', target: 'engine.projection', type: 'imports' });
  graph.addEdge({ source: 'sketion.app', target: 'engine.template', type: 'imports' });
  graph.addEdge({ source: 'sketion.app', target: 'store.root', type: 'imports' });
  graph.addEdge({ source: 'sketion.app', target: 'ui.canvasView', type: 'imports' });

  // Renderer connections (High fan-in: 37+ nodes depend on renderer)
  const rendererDependents = allNodeIds.filter(id => id.startsWith('ui.') || id.startsWith('projection.') || id.startsWith('template.')).slice(0, 38);
  for (const depId of rendererDependents) {
    graph.addEdge({ source: depId, target: 'engine.renderer', type: 'calls' });
  }

  // Outgoing dependencies from renderer
  graph.addEdge({ source: 'engine.renderer', target: 'engine.projection', type: 'imports' });
  graph.addEdge({ source: 'engine.renderer', target: 'engine.template', type: 'imports' });
  graph.addEdge({ source: 'engine.renderer', target: 'engine.exporter', type: 'calls' });
  graph.addEdge({ source: 'engine.renderer', target: 'store.root', type: 'calls' });
  graph.addEdge({ source: 'engine.renderer', target: 'theme.registry', type: 'imports' });

  // AI Pipeline connections
  graph.addEdge({ source: 'engine.ai', target: 'engine.template', type: 'generates' });
  graph.addEdge({ source: 'engine.ai', target: 'engine.projection', type: 'transforms' });
  graph.addEdge({ source: 'engine.ai', target: 'store.root', type: 'dispatches' });

  // Introduce Circular Dependency Wormhole Anomaly (Renderer <-> Projection <-> Template <-> Renderer)
  graph.addEdge({ source: 'engine.projection', target: 'engine.template', type: 'imports' });
  graph.addEdge({ source: 'engine.template', target: 'engine.renderer', type: 'calls' }); // Closes cycle!
  graph.addEdge({ source: 'core.1', target: 'core.2', type: 'imports' });
  graph.addEdge({ source: 'core.2', target: 'core.3', type: 'imports' });
  graph.addEdge({ source: 'core.3', target: 'core.1', type: 'imports' }); // Second cycle anomaly!

  // Database & Storage bunker connections
  for (let i = 1; i <= 20; i++) {
    graph.addEdge({ source: `store.${i % 30 + 1}`, target: 'db.storage', type: 'persists' });
    graph.addEdge({ source: `db.${i}`, target: 'db.storage', type: 'manages' });
  }

  // Metropolis UI components calling Store & Themes
  for (let i = 1; i <= 60; i++) {
    const uiId = `ui.${i}`;
    if (graph.nodes.has(uiId)) {
      graph.addEdge({ source: uiId, target: 'store.root', type: 'selects' });
      graph.addEdge({ source: uiId, target: 'theme.registry', type: 'styles' });
      if (i % 3 === 0) {
        graph.addEdge({ source: uiId, target: 'ui.canvasView', type: 'renders_in' });
      }
    }
  }

  // Inter-cluster intra-module edges to reach ~1,520 edges
  for (let i = 0; i < allNodeIds.length; i++) {
    const srcId = allNodeIds[i];
    const targetIdx1 = (i * 7 + 3) % allNodeIds.length;
    const targetIdx2 = (i * 13 + 11) % allNodeIds.length;
    const targetIdx3 = (i * 19 + 5) % allNodeIds.length;

    if (allNodeIds[targetIdx1] !== srcId) {
      graph.addEdge({ source: srcId, target: allNodeIds[targetIdx1], type: 'imports' });
    }
    if (i % 2 === 0 && allNodeIds[targetIdx2] !== srcId) {
      graph.addEdge({ source: srcId, target: allNodeIds[targetIdx2], type: 'references' });
    }
    if (i % 3 === 0 && allNodeIds[targetIdx3] !== srcId) {
      graph.addEdge({ source: srcId, target: allNodeIds[targetIdx3], type: 'calls' });
    }
  }

  return graph;
}
