const path = require('node:path');
const fs = require('node:fs');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Windows can exhaust file handles with simultaneous web/SSR transformation.
// One worker also avoids Metro's extra transformation worker pool on Windows.
config.maxWorkers = process.platform === 'win32' ? 1 : Math.min(config.maxWorkers, 2);
if (process.platform === 'win32') config.transformer.unstable_workerThreads = false;

// File-map snapshots use V8 serialization: don't share them between Node versions.
const runtimeCache = path.join(
  __dirname,
  '.metro-cache',
  `${process.platform}-${process.arch}-node${process.versions.node}`,
);
config.fileMapCacheDirectory = path.join(runtimeCache, 'file-map');
fs.mkdirSync(config.fileMapCacheDirectory, { recursive: true });
config.cacheStores = ({ FileStore }) => [
  new FileStore({ root: path.join(runtimeCache, 'transformer') }),
];

// These folders belong to tooling, exports or the separate browser gallery.
// Keep Expo's existing exclusions and all app assets/node_modules available.
const excludedFolders = [
  'dist',
  'web-build',
  '.tools',
  '.npm-cache',
  '.metro-cache',
  '.expo-user',
  'docs',
  'design-exploration',
];
const existing = config.resolver.blockList;
const escapePattern = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
config.resolver.blockList = [
  ...(Array.isArray(existing) ? existing : existing ? [existing] : []),
  ...excludedFolders.map(
    (folder) => new RegExp(`^${escapePattern(path.resolve(__dirname, folder))}(?:[/\\\\]|$)`),
  ),
];

module.exports = config;
