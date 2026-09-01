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
    // Try to list projects via CBM CLI
    exec('codebase-memory-mcp cli list_projects --json', (err, stdout, stderr) => {
      if (err) {
        // Fallback: check if ~/.cache/codebase-memory-mcp directory exists
        const homeDir = process.env.HOME || process.env.USERPROFILE || '';
        const cbmCache = path.join(homeDir, '.cache', 'codebase-memory-mcp');
        let projects = [];
        if (fs.existsSync(cbmCache)) {
          const files = fs.readdirSync(cbmCache);
          projects = files.filter(f => f.endsWith('.db')).map(f => ({
            name: f.replace(/\.db$/, ''),
            status: 'cached'
          }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ available: projects.length > 0, projects }));
        return;
      }
      try {
        const data = JSON.parse(stdout);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ available: true, projects: data.projects || data }));
      } catch (e) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ available: false, projects: [] }));
      }
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
