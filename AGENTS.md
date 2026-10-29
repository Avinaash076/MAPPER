# MAPPER / Northern Trails

This repository contains the React Native tourism app in `src`. Keep work in this repository separate from unrelated PHP projects visible in the editor.

## Working style

- Prefer small named functions, explicit types and readable component props.
- Keep travel calculations and filters pure. Keep storage and network operations outside screen components.
- Keep route files focused on composing components; extract independently meaningful UI into the related feature folder.
- Edit shared theme tokens rather than repeating new colors and spacing.
- Keep place IDs stable. Use named seed records, source links and image credits. Do not invent current hours, fees or access guarantees.
- Add dependencies only for a concrete requirement. Install native modules in versions compatible with the project's Expo SDK.
- Update relevant files under `docs/` whenever behavior, architecture, validation or release steps change. Keep detailed implementation reviews there.
- Never claim a device test, screenshot, deployment or push succeeded without evidence.
- Use Chrome only for app screenshots. Do not use Chrome for browsing, navigation, commands, DevTools or interaction testing.

## Validation

Run `npm run check`, `npm run check:dependencies`, `npm run build:android` and `npm run build:web` for material changes. On Windows use `npm.cmd` and `npx.cmd` if PowerShell blocks the `.ps1` shims.

The Android export builds JavaScript and assets; it is not an APK and does not prove native device behavior. Follow the device checks in `docs/development.md`.

## Repository workflow

The source repository is https://github.com/Avinaash076/MAPPER. Inspect the current branch and remote before changing history. Use ordinary commits and pushes; never force push. Do not commit caches, credentials or generated build output. Automated checks may run on pushes and pull requests; deployment remains a deliberate release action.

## Offline roadmap

The current app supports bundled place data and local plans. It has online maps and private contribution drafts, but does not download maps or routes. Follow `docs/offline-routing.md` when adding that capability; map tiles and a routing graph are different resources.

## Community contributions

Keep drafts/submissions private until administrator review. Never bundle a service-role or AI key. Keep captured coordinates separate from reviewer-chosen public coordinates. Run the PostgreSQL policy tests when changing submission, photo or publication rules.
