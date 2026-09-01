#!/usr/bin/env node

/**
 * CODEBASE.UNIVERSE - CLI Launcher.
 * Usage: npx codebase-universe [path] [--port 5173] [--no-open]
 * ZERO EMOJIS.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { LocalRepositoryScanner } from '../src/indexer/localScanner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
let targetDirectory = process.cwd();
let port = 5173;
let autoOpen = true;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--port' && args[i + 1]) {
    port = parseInt(args[++i], 10);
  } else if (arg === '--no-open') {
    autoOpen = false;
  } else if (!arg.startsWith('-')) {
    targetDirectory = path.resolve(process.cwd(), arg);
  }
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // Dynamic Repository Ingestion API
  if (pathname === '/api/scan') {
    const scanPath = parsedUrl.searchParams.get('dir') || targetDirectory;
    try {
      const graphData = LocalRepositoryScanner.scanDirectory(scanPath);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(graphData));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Static File Serving
  let filePath = path.join(ROOT_DIR, pathname === '/' ? 'index.html' : pathname);

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(port, () => {
  const url = `http://localhost:${port}`;
  console.log(`========================================================`);
  console.log(`CODEBASE.UNIVERSE // THE ARCHITECTURAL SIMULATION ENGINE`);
  console.log(`Target Repository : ${targetDirectory}`);
  console.log(`Local Dashboard   : ${url}`);
  console.log(`========================================================`);

  if (autoOpen) {
    const startCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${startCmd} ${url}`);
  }
});
