# Metro on Windows: open-file and cache recovery

Updated 5 November 2026 on Windows / Node 22.20.0. Earlier verification is recorded separately below.

## Recurring icon transformation failure

The later failure named `phosphor-react-native/lib/module/defs/CloudWarning.js`, followed by a transformer-cache `EMFILE`. The failed MAPPER Metro process had approximately 21,000 Windows handles. These observations establish resource pressure, not that CloudWarning is a corrupt icon or that every Windows handle is an open file.

The app previously imported Phosphor's root catalog. The installed package exposes 1,512 icons, while this app uses 19. Metro can traverse the entire re-export catalog for a few imports. `src/components/icons.ts` now re-exports only the 19 used icons through the package's supported `src/icons/*` entry points. Components use that registry; the icon family, glyphs and weights are preserved. ESLint rejects new imports from the root catalog. [Phosphor's individual-import guidance](https://github.com/duongdev/phosphor-react-native/blob/main/README.md).

Windows now uses one Metro worker and explicitly disables transformation worker threads. This avoids the extra transformation worker pool and reduces concurrent file activity while web and SSR bundles are requested. Other platforms retain the two-worker cap. Node-version-specific caches and existing exclusions remain in place. No package, lockfile or `node_modules` patch is required.

Restart the old MAPPER terminal with Ctrl+C before running the command below; a running Metro process does not reliably reload its configuration. Do not start an export concurrently with the verification server. Existing provider keys, Supabase settings and saved app data do not need to be changed.

## Reported symptoms

- `EMFILE: too many open files` while Metro read Manrope fonts or transformed-module cache entries.
- `Unable to deserialize cloned data due to invalid or unsupported version` when reading the file-map cache. Metro falls back to a full crawl for this message; it does not mean the npm install failed.
- A prompt to use port 8082 because another development server already owns the default port.

The affected MAPPER process was observed with roughly 12,400 Windows handles. That count is diagnostic evidence, not proof that every handle was a font or that a single OS threshold caused the failure.

## Repository fix

`metro.config.js` extends `expo/metro-config` rather than replacing Expo's defaults:

- Uses one worker on Windows and caps other platforms at two workers. Windows transformation worker threads are disabled.
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

## Current verification (5 November)

- A fresh development start with `--clear` compiled the web entry with 1,206 modules and SSR with 1,242 modules. The reported failing web graph had 4,179 modules.
- Real HTTP requests to the home page and web entry bundle returned 200. Destination, trip-options and assistant pages also returned 200. The development JavaScript bundle did not contain the unused CloudWarning icon. No `EMFILE` or `ERROR` entries appeared in this verification server's log.
- The fresh Metro process was observed at roughly 12,800 Windows handles after bundling, versus roughly 21,000 in the failed process. This is a diagnostic snapshot, not a general Windows file-limit benchmark.
- TypeScript, lint, formatting and all 76 tests passed. Regression coverage rejects catalog imports and checks the Windows worker configuration. Expo dependency compatibility passed.
- Sequential Android and web exports passed. The Android export contains JavaScript/assets; it is not an APK or a physical-device test.
- The temporary verification server was stopped before export checks. No provider requests, API-key edits or private-storage changes were part of this fix. HTTP/compilation checks do not establish native device behavior.

## Earlier verification evidence (2 November)

- The actual development welcome page returned HTTP 200 and compiled both server and web bundles.
- All four Manrope font URLs (400, 500, 600 and 700) were fetched concurrently: HTTP 200, valid TrueType headers, approximately 97 KB each. These are real HTTP asset checks, not browser/device interaction tests.
- `npm.cmd run check` passed TypeScript, lint, all 51 tests and formatting. The root Metro/ESLint configuration also passed focused lint.
- Dependency compatibility checks and both Android/web exports passed after the configuration change.

The deprecated ESLint warning printed by npm is a separate tooling-maintenance warning. It did not prevent installation, lint or app compilation in this verification. Do not replace Expo's compatible lint dependencies just to remove that warning during Metro recovery.
