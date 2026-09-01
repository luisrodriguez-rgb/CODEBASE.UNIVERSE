/**
 * Universal Lightweight AST & Dependency Extraction Engine.
 * Extracts modules, functions, classes, LOC, and import/require dependencies
 * across JavaScript, TypeScript, Python, Go, Rust, and JSON.
 * ZERO EMOJIS.
 */

export class UniversalAstParser {
  /**
   * Parses file content and extracts dependencies and structural metrics.
   * @param {string} filePath Relative path of file
   * @param {string} content Source code string
   * @returns {Object} Extracted entity metadata
   */
  static parseFile(filePath, content) {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const lines = content.split('\n');
    const loc = lines.length;

    const imports = [];
    const exports = [];
    const functions = [];
    const classes = [];

    // Basic heuristic regex parsers per language family
    if (['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs'].includes(ext)) {
      this.parseJavaScript(lines, imports, exports, functions, classes);
    } else if (ext === 'py') {
      this.parsePython(lines, imports, exports, functions, classes);
    } else if (ext === 'go') {
      this.parseGo(lines, imports, exports, functions, classes);
    } else if (ext === 'rs') {
      this.parseRust(lines, imports, exports, functions, classes);
    }

    // Rough cyclomatic complexity estimation based on branching keywords
    const branchKeywords = /\b(if|else|switch|case|for|while|catch|&&|\|\||\?)\b/g;
    const matches = content.match(branchKeywords);
    const cyclomaticEstimate = Math.max(1, matches ? matches.length : 1);

    const fileName = filePath.split('/').pop() || filePath;
    const baseName = fileName.replace(/\.[^/.]+$/, '');

    // Biome domain classification heuristic
    const biome = this.classifyBiome(filePath);

    return {
      id: filePath,
      name: fileName,
      baseName,
      path: filePath,
      biome,
      type: 'module',
      loc,
      cyclomaticEstimate,
      imports,
      exports,
      functions,
      classes
    };
  }

  static parseJavaScript(lines, imports, exports, functions, classes) {
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+[\w$]+|[\w$]+)\s+from\s+)?['"]([^'"]+)['"]/g;
    const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+([\w$]+)/g;
    const funcRegex = /(?:function\s+([\w$]+)|(?:const|let|var)\s+([\w$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)/g;
    const classRegex = /class\s+([\w$]+)/g;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*')) continue;

      let match;
      while ((match = importRegex.exec(line)) !== null) {
        imports.push(match[1]);
      }
      while ((match = requireRegex.exec(line)) !== null) {
        imports.push(match[1]);
      }
      while ((match = exportRegex.exec(line)) !== null) {
        exports.push(match[1]);
      }
      while ((match = funcRegex.exec(line)) !== null) {
        functions.push(match[1] || match[2]);
      }
      while ((match = classRegex.exec(line)) !== null) {
        classes.push(match[1]);
      }
    }
  }

  static parsePython(lines, imports, exports, functions, classes) {
    const importRegex = /^(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))/;
    const defRegex = /^\s*def\s+([\w_]+)\s*\(/;
    const classRegex = /^\s*class\s+([\w_]+)/;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#')) continue;

      const impMatch = trimmed.match(importRegex);
      if (impMatch) {
        imports.push(impMatch[1] || impMatch[2]);
      }

      const defMatch = line.match(defRegex);
      if (defMatch) {
        functions.push(defMatch[1]);
      }

      const clsMatch = line.match(classRegex);
      if (clsMatch) {
        classes.push(clsMatch[1]);
      }
    }
  }

  static parseGo(lines, imports, exports, functions, classes) {
    const importRegex = /import\s+["']([^"']+)["']/;
    const funcRegex = /func\s+(?:\([^)]+\)\s+)?([A-Z]\w*)\s*\(/;

    for (const line of lines) {
      const impMatch = line.match(importRegex);
      if (impMatch) imports.push(impMatch[1]);

      const fnMatch = line.match(funcRegex);
      if (fnMatch) functions.push(fnMatch[1]);
    }
  }

  static parseRust(lines, imports, exports, functions, classes) {
    const useRegex = /use\s+([^;]+);/;
    const fnRegex = /fn\s+([\w_]+)\s*\(/;
    const structRegex = /struct\s+([\w_]+)/;

    for (const line of lines) {
      const uMatch = line.match(useRegex);
      if (uMatch) imports.push(uMatch[1]);

      const fnMatch = line.match(fnRegex);
      if (fnMatch) functions.push(fnMatch[1]);

      const sMatch = line.match(structRegex);
      if (sMatch) classes.push(sMatch[1]);
    }
  }

  static classifyBiome(path) {
    const p = (path || '').toLowerCase();

    // 1. UI Metropolis (Views, Components, Pages, Styles, HUD, Inspector)
    if (p.includes('/ui/') || p.includes('/components/') || p.includes('/views/') || p.includes('/pages/') || p.includes('/styles/') || p.includes('/i18n/') || p.includes('translations') || p.includes('.css') || p.includes('.tsx') || p.includes('.jsx') || p.includes('.vue') || p.includes('index.html')) {
      return 'ui';
    }

    // 2. Power Grid (State, Store, Events, Knowledge Tracker, Audio, SoundFX)
    if (p.includes('/game/') || p.includes('/audio/') || p.includes('/sound') || p.includes('state') || p.includes('tracker') || p.includes('events') || p.includes('/store/') || p.includes('/redux/') || p.includes('/zustand') || p.includes('/bus/')) {
      return 'power';
    }

    // 3. Subterranean Bunker (Data sources, Datasets, SQLite, Models, Persistence, Cache, Ingestion)
    if (p.includes('/data/') || p.includes('dataset') || p.includes('ingest') || p.includes('/db/') || p.includes('/models/') || p.includes('/storage/') || p.includes('/cache/') || p.includes('.json') || p.includes('.sql') || p.includes('.prisma')) {
      return 'bunker';
    }

    // 4. Transmission Hub (APIs, Server, Indexer, AST Parsers, Git Importers, Network, WebSockets, CLI)
    if (p.includes('/indexer/') || p.includes('parser') || p.includes('bridge') || p.includes('scanner') || p.includes('server.js') || p.includes('/bin/') || p.includes('/api/') || p.includes('/routes/') || p.includes('/controllers/') || p.includes('/gateway/') || p.includes('importer')) {
      return 'transmission';
    }

    // 5. Research Labs (Analysis algorithms, Centrality, Cycles, Blast Radius, Archaeology, Test suites)
    if (p.includes('/analysis/') || p.includes('centrality') || p.includes('complexity') || p.includes('cycles') || p.includes('blast') || p.includes('archaeology') || p.includes('history') || p.includes('/test/') || p.includes('/tests/') || p.includes('/spec/') || p.includes('benchmark')) {
      return 'lab';
    }

    // 6. Forgotten Ruins (Dead code, deprecated utilities)
    if (p.includes('/deprecated/') || p.includes('/legacy/') || p.includes('/old/')) {
      return 'ruins';
    }

    // 7. Core Citadel (Main engine loop, World layout, Camera, Minimap, Conduits, Buildings)
    return 'core';
  }
}
