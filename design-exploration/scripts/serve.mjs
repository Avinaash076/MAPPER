import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.STAGE3_PORT || 4313);
const host = process.argv.includes('--lan') ? '0.0.0.0' : process.env.DESIGN_HOST || '127.0.0.1';
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ttf': 'font/ttf',
};
http
  .createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      // Chrome's screenshot CLI waits for document resources, not asynchronous map workers.
      // This optional local-only resource gives real tiles time to render during capture.
      if (pathname === '/capture-wait.svg') {
        setTimeout(() => {
          response.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' });
          response.end('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>');
        }, 15000);
        return;
      }
      const base = pathname.startsWith('/assets/') ? root : path.join(root, 'dist');
      const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
      const target = path.resolve(base, relative);
      if (!target.startsWith(path.resolve(base) + path.sep)) {
        response.writeHead(403).end('Forbidden');
        return;
      }
      const body = await readFile(target);
      response.writeHead(200, {
        'Content-Type': types[path.extname(target)] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      });
      response.end(body);
    } catch {
      response
        .writeHead(404, { 'Content-Type': 'text/plain' })
        .end('Preview file not found. Run npm.cmd run build first.');
    }
  })
  .listen(port, host, () =>
    console.log(
      `Stage 3 sheets: http://localhost:${port}\nLocal design preview only. Ctrl+C stops the server.`,
    ),
  );
