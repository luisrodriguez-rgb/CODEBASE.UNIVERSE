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
    const p = path.toLowerCase();
    if (p.includes('/ui/') || p.includes('/components/') || p.includes('/views/') || p.includes('/pages/') || p.includes('.tsx') || p.includes('.jsx')) {
      return 'ui';
    }
    if (p.includes('/store/') || p.includes('/state/') || p.includes('/redux/') || p.includes('/events/')) {
      return 'power';
    }
    if (p.includes('/db/') || p.includes('/database/') || p.includes('/models/') || p.includes('/storage/') || p.includes('/cache/')) {
      return 'bunker';
    }
    if (p.includes('/api/') || p.includes('/routes/') || p.includes('/network/') || p.includes('/controllers/') || p.includes('/services/')) {
      return 'network';
    }
    if (p.includes('/test/') || p.includes('/tests/') || p.includes('/spec/') || p.includes('test.') || p.includes('spec.')) {
      return 'lab';
    }
    if (p.includes('/legacy/') || p.includes('/deprecated/') || p.includes('/old/')) {
      return 'ruins';
    }
    return 'core';
  }
}
