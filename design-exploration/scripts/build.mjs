import { build } from 'esbuild';
import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
await mkdir(path.join(root, 'dist'), { recursive: true });
await copyFile(
  path.resolve(root, '../node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs'),
  path.join(root, 'dist/map-worker.js'),
);
await build({
  entryPoints: [path.join(root, 'src/main.tsx')],
  outdir: path.join(root, 'dist'),
  bundle: true,
  splitting: false,
  format: 'iife',
  minify: true,
  jsx: 'automatic',
  target: ['es2022'],
  alias: {
    'react-native-svg': path.join(root, 'src/components/nativeSvg.tsx'),
  },
  external: ['/assets/*'],
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'info',
});
await writeFile(
  path.join(root, 'dist/index.html'),
  `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>MAPPER · Stage 3 design sheets</title><link rel="icon" href="/assets/brand.svg" type="image/svg+xml"><link rel="stylesheet" href="/main.css"></head><body><div id="root"></div><script>
function showPreviewError(error) { var panel = document.createElement('pre'); panel.setAttribute('role','alert'); panel.style.cssText='padding:32px;white-space:pre-wrap;color:#A82F36;background:#fff'; panel.textContent='Preview could not load. Reload after rebuilding the sheets.\\n'+String(error); document.body.appendChild(panel); }
window.addEventListener('error', function(event) { showPreviewError(event.message); });
window.addEventListener('unhandledrejection', function(event) { showPreviewError(event.reason); });
if (new URLSearchParams(location.search).has('capture')) { var wait = document.createElement('img'); wait.src='/capture-wait.svg'; wait.alt=''; wait.style.cssText='position:absolute;width:1px;height:1px;opacity:0;pointer-events:none'; document.body.appendChild(wait); }
</script><div id="preview-loading" style="padding:32px;font:16px system-ui;color:#172820">Loading MAPPER design studies…</div><script src="/main.js"></script></body></html>`,
);
