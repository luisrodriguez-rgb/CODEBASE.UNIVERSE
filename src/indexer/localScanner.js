/**
 * Local Repository Scanner & Graph Ingestion Engine.
 * Scans local folders, parses AST, resolves dependency edges, and returns a CodeGraph payload.
 * ZERO EMOJIS.
 */

import fs from 'fs';
import path from 'path';
import { UniversalAstParser } from './astParser.js';

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.github',
  '.vscode',
  'dist',
  'build',
  'out',
  'target',
  'vendor',
  '__pycache__',
  '.next',
  '.nuxt',
  'coverage',
  '.gemini',
  '.agents'
]);

const VALID_EXTENSIONS = new Set([
  'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs',
  'py', 'go', 'rs', 'java', 'cpp', 'c', 'h', 'hpp', 'json'
]);

export class LocalRepositoryScanner {
  /**
   * Scans a target directory and constructs an architectural graph.
   * @param {string} rootDir Root directory path
   * @param {Object} options
   * @returns {Object} Graph payload with nodes and edges
   */
  static scanDirectory(rootDir, options = {}) {
    const files = [];
    this.collectFiles(rootDir, rootDir, files);

    const parsedEntities = [];
    const pathToIdMap = new Map();

    for (const relPath of files) {
      const fullPath = path.join(rootDir, relPath);
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const entity = UniversalAstParser.parseFile(relPath, content);
        parsedEntities.push(entity);
        pathToIdMap.set(relPath, entity.id);
        
        // Also map basename without extension for flexible import resolution
        const base = relPath.replace(/\.[^/.]+$/, '');
        pathToIdMap.set(base, entity.id);
      } catch (err) {
        // Skip binary or unreadable files
      }
    }

    const nodes = [];
    const edges = [];
    const edgeSet = new Set();

    for (const entity of parsedEntities) {
      nodes.push({
        id: entity.id,
        name: entity.name,
        path: entity.path,
        biome: entity.biome,
        type: entity.type,
        loc: entity.loc,
        cyclomaticEstimate: entity.cyclomaticEstimate
      });

      // Resolve imports to graph edges
      for (const rawImp of entity.imports) {
        const resolvedTargetId = this.resolveImportTarget(entity.path, rawImp, pathToIdMap);
        if (resolvedTargetId && resolvedTargetId !== entity.id) {
          const edgeKey = `${entity.id}->${resolvedTargetId}`;
          if (!edgeSet.has(edgeKey)) {
            edgeSet.add(edgeKey);
            edges.push({
              source: entity.id,
              target: resolvedTargetId,
              type: 'imports'
            });
          }
        }
      }
    }

    return {
      projectName: path.basename(path.resolve(rootDir)).toUpperCase(),
      totalFiles: files.length,
      nodes,
      edges
    };
  }

  static collectFiles(rootDir, currentDir, fileList) {
    let entries = [];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
          this.collectFiles(rootDir, fullPath, fileList);
        }
      } else if (entry.isFile()) {
        const ext = entry.name.split('.').pop()?.toLowerCase() || '';
        if (VALID_EXTENSIONS.has(ext)) {
          fileList.push(relPath);
        }
      }
    }
  }

  static resolveImportTarget(sourcePath, rawImport, pathToIdMap) {
    // 1. Direct match
    if (pathToIdMap.has(rawImport)) return pathToIdMap.get(rawImport);

    // 2. Relative import from source file directory
    if (rawImport.startsWith('.')) {
      const sourceDir = path.dirname(sourcePath);
      const normalized = path.normalize(path.join(sourceDir, rawImport)).replace(/\\/g, '/');

      if (pathToIdMap.has(normalized)) return pathToIdMap.get(normalized);

      // Check with extensions
      for (const ext of ['ts', 'js', 'tsx', 'jsx', 'json']) {
        const withExt = `${normalized}.${ext}`;
        if (pathToIdMap.has(withExt)) return pathToIdMap.get(withExt);
        const indexFile = `${normalized}/index.${ext}`;
        if (pathToIdMap.has(indexFile)) return pathToIdMap.get(indexFile);
      }
    }

    // 3. Match by filename
    const targetBaseName = rawImport.split('/').pop()?.replace(/\.[^/.]+$/, '');
    if (targetBaseName) {
      for (const [key, id] of pathToIdMap.entries()) {
        if (key.endsWith(`/${targetBaseName}`) || key === targetBaseName) {
          return id;
        }
      }
    }

    return null;
  }
}
