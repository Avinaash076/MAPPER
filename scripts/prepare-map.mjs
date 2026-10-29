import { copyFile, mkdir } from 'node:fs/promises';
// Keep executable worker code local rather than fetching it from a CDN.
await mkdir('public', { recursive: true });
await copyFile(
  'node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs',
  'public/maplibre-worker.mjs',
);
