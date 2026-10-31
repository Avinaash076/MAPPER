import http from 'node:http';
import { Buffer } from 'node:buffer';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

const root = path.resolve('dist/web');
const port = Number(process.env.PREVIEW_PORT || 4320);
// Optional fixtures are used only by local screenshot captures, never by an app build.
const captureStorage = process.env.CAPTURE_STORAGE_FILE
  ? JSON.parse(await readFile(process.env.CAPTURE_STORAGE_FILE, 'utf8'))
  : null;
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
};
http
  .createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      if (url.pathname === '/capture-wait.svg') {
        setTimeout(() => {
          response.writeHead(200, { 'Content-Type': 'image/svg+xml' });
          response.end('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>');
        }, 15000);
        return;
      }
      let relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
      if (!path.extname(relative)) relative += '.html';
      const target = path.resolve(root, relative);
      if (!target.startsWith(root + path.sep)) {
        response.writeHead(403).end();
        return;
      }
      let body = await readFile(target);
      if (path.extname(target) === '.html' && url.searchParams.has('capture')) {
        const theme = url.searchParams.get('theme');
        const values = { ...(captureStorage || {}) };
        if (theme === 'light' || theme === 'dark') values['northern-trails:appearance'] = theme;
        const encoded = JSON.stringify(values).replaceAll('<', '\\u003c');
        body = Buffer.from(
          body
            .toString()
            .replace(
              '<head>',
              `<head><script>for(const [key,value] of Object.entries(${encoded})){localStorage.setItem(key,value)}</script>`,
            )
            .replace(
              '</body>',
              '<img src="/capture-wait.svg" alt="" style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none"></body>',
            ),
        );
      }
      response.writeHead(200, {
        'Content-Type': mime[path.extname(target)] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      response.end(body);
    } catch {
      response.writeHead(404).end('Export file not found. Run npm.cmd run build:web first.');
    }
  })
  .listen(port, '127.0.0.1', () => console.log(`Export preview: http://localhost:${port}`));
