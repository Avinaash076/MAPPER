# Metro on Windows: open-file and cache recovery

Verified 2 November 2026 on Node 22.20.0.

## Reported symptoms

- `EMFILE: too many open files` while Metro read Manrope fonts or transformed-module cache entries.
- `Unable to deserialize cloned data due to invalid or unsupported version` when reading the file-map cache. Metro falls back to a full crawl for this message; it does not mean the npm install failed.
- A prompt to use port 8082 because another development server already owns the default port.

The affected MAPPER process was observed with roughly 12,400 Windows handles. That count is diagnostic evidence, not proof that every handle was a font or that a single OS threshold caused the failure.

## Repository fix

`metro.config.js` extends `expo/metro-config` rather than replacing Expo's defaults:

- Caps the transformation and file-map worker pools at two workers.
- Preserves built-in exclusions and excludes root build output, tooling caches, docs and the independent design gallery. App source, assets and `node_modules` remain available.
- Keeps file-map and transformer caches under `.metro-cache/<platform>-<architecture>-node<version>/`. This avoids reusing a V8-serialized snapshot from a different Node runtime or the old shared temporary location.
- Excludes this cache from Metro, Git, formatting and lint traversal. No dependency or lockfile change was required.

Configuration references: [Expo Metro customization](https://docs.expo.dev/guides/customizing-metro/), [Metro configuration](https://metrobundler.dev/docs/configuration/) and [Metro caching](https://metrobundler.dev/docs/caching/).

## Run on PC

Stop other MAPPER Metro terminals with **Ctrl+C**. Run one app server:

```powershell
cd E:\maps
npm.cmd run web -- --clear --port 8081
```

Open `http://localhost:8081`. The first build after clearing the cache takes longer. For later starts, use `npm.cmd run web -- --port 8081` without clearing again.

For an installed Android development client, use this instead of the web server:

```powershell
cd E:\maps
npm.cmd run start:dev-client -- --lan --clear
```

MapLibre requires a custom development build, not Expo Go. Follow [running.md](running.md) for APK creation and a fresh-PC setup. The independent design gallery can use port 4313 separately.

## Verification evidence

- The actual development welcome page returned HTTP 200 and compiled both server and web bundles.
- All four Manrope font URLs (400, 500, 600 and 700) were fetched concurrently: HTTP 200, valid TrueType headers, approximately 97 KB each. These are real HTTP asset checks, not browser/device interaction tests.
- `npm.cmd run check` passed TypeScript, lint, all 51 tests and formatting. The root Metro/ESLint configuration also passed focused lint.
- Dependency compatibility checks and both Android/web exports passed after the configuration change.

The deprecated ESLint warning printed by npm is a separate tooling-maintenance warning. It did not prevent installation, lint or app compilation in this verification. Do not replace Expo's compatible lint dependencies just to remove that warning during Metro recovery.
