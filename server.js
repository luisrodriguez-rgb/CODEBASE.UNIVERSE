import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { LocalRepositoryScanner } from './src/indexer/localScanner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5173;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // 1. Dynamic Local Repository Ingestion API
  if (pathname === '/api/scan') {
    const scanPath = parsedUrl.searchParams.get('dir') || __dirname;
    try {
      const graphData = LocalRepositoryScanner.scanDirectory(scanPath);
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache'
      });
      res.end(JSON.stringify(graphData));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 2. Codebase-Memory-MCP (CBM) Integration API
  if (pathname === '/api/cbm/projects') {
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const cbmCache = path.join(homeDir, '.cache', 'codebase-memory-mcp');
    let projects = [];
    if (fs.existsSync(cbmCache)) {
      const files = fs.readdirSync(cbmCache);
      projects = files.filter(f => f.endsWith('.db') && !f.startsWith('_')).map(f => {
        const name = f.replace(/\.db$/, '');
        const cleanTitle = name.replace(/^Users-[^-]+-Desktop-Trabajos-/, '').replace(/-/g, ' / ');
        return {
          id: name,
          name: cleanTitle,
          file: f,
          status: 'cached'
        };
      });
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ available: projects.length > 0, projects }));
    return;
  }

  // 2.1 Load Specific CBM SQLite Project Graph
  if (pathname === '/api/cbm/load') {
    const projectName = parsedUrl.searchParams.get('project') || 'Users-leonfeliperodriguez-Desktop-Trabajos-CODEBASE.UNIVERSE';
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const dbPath = path.join(homeDir, '.cache', 'codebase-memory-mcp', `${projectName}.db`);

    if (!fs.existsSync(dbPath)) {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: `CBM database not found for project ${projectName}` }));
      return;
    }

    const nodeQuery = `sqlite3 -json "${dbPath}" "SELECT id, label, name, qualified_name, file_path, start_line, end_line, properties FROM nodes WHERE label != 'Project';"`;
    const edgeQuery = `sqlite3 -json "${dbPath}" "SELECT source_id, target_id, type, properties FROM edges;"`;

    exec(nodeQuery, { maxBuffer: 1024 * 1024 * 10 }, (errNodes, stdoutNodes) => {
      if (errNodes) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: `Failed to query nodes: ${errNodes.message}` }));
        return;
      }

      exec(edgeQuery, { maxBuffer: 1024 * 1024 * 10 }, (errEdges, stdoutEdges) => {
        try {
          const rawNodes = JSON.parse(stdoutNodes || '[]');
          const rawEdges = JSON.parse(stdoutEdges || '[]');

          const nodeMap = new Map();
          const nodes = rawNodes.map(n => {
            const nodeObj = {
              id: n.qualified_name || `${n.id}`,
              numericId: n.id,
              name: n.name,
              path: n.file_path || n.name,
              label: n.label,
              loc: (n.end_line && n.start_line) ? (n.end_line - n.start_line + 1) : 40,
              complexity: Math.max(1, Math.round(((n.end_line - n.start_line + 1) || 40) * 0.12))
            };
            nodeMap.set(n.id, nodeObj.id);
            return nodeObj;
          });

          const edges = [];
          for (const e of rawEdges) {
            const srcId = nodeMap.get(e.source_id);
            const tgtId = nodeMap.get(e.target_id);
            if (srcId && tgtId && srcId !== tgtId) {
              edges.push({
                source: srcId,
                target: tgtId,
                type: e.type || 'calls'
              });
            }
          }

          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            cbm_schema: true,
            project: projectName,
            totalNodes: nodes.length,
            totalEdges: edges.length,
            nodes,
            edges
          }));
        } catch (parseErr) {
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: `JSON parsing error: ${parseErr.message}` }));
        }
      });
    });
    return;
  }

  // 3. Static File Serving
  let reqPath = pathname;
  if (reqPath === '/') reqPath = '/index.html';

  const filePath = path.join(__dirname, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`404 Not Found: ${reqPath}`);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`500 Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`CODEBASE.UNIVERSE server running at http://localhost:${PORT}`);
});
