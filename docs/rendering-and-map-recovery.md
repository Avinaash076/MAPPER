# Empty text nodes, map loading and API keys

2 November 2026 · `feature/woven-theme`

## What caused the reported text errors

React Native requires text inside `Text` (the shared `Label` here). A JSX expression such as `error && <Notice>` returns the empty string when `error` is `''`. React Native Web then reports `Unexpected text node: .` under its containing View. `query.trim() && …` has the same problem when the field is empty. These were render-time errors; successful compilation did not establish their absence.

Optional JSX children now use an explicit `condition ? component : null` throughout the app. This fixes the search, starting-location and trip-settings cases and the same pattern in older contribution, assistant and discovery components. The `react/jsx-no-leaked-render` lint rule now requires this safe form. Regression tests cover empty error strings, empty search input, numeric counts and valid null fallbacks.

The original M mark also passed native `accessible={false}` through to the web SVG, producing a non-boolean HTML attribute warning. Web now uses `aria-hidden`; native keeps its intended accessibility prop.

## Map findings and changes

- The local `/maplibre-worker.mjs` URL returned HTTP 200 with JavaScript content, and both official Liberty/Dark style URLs returned valid style JSON without a key.
- A live Metro Discover screenshot, captured with time for real tile/worker loading, showed map labels, tiles, attribution and catalog markers. The capture used headless software WebGL; it does not establish that every user's graphics driver/browser is working.
- The final fresh-profile capture showed no error banner, introduced no new `Web ERROR` log entries, and the verification server recorded zero `Unexpected text node` errors. A temporary localhost capture proxy delayed only a hidden image resource so screenshots could wait for actual tiles; it did not replace map data or execute browser interactions.
- The map now stays in the loading state until its first `load` event rather than declaring success when only the style JSON has loaded.
- Initialization, network, worker and graphics failures have actionable messages, plus a loading timeout. Raw provider errors and URLs are not echoed into the UI. Place-list browsing remains available.
- WebGL availability, graphics acceleration, network restrictions and blocked workers can still affect an individual browser. A separate road-route line will not appear: no routing provider has been integrated.

## Which API keys are needed?

| Feature                                                             | Key/configuration used now                                         | What to do                                                                                                                                                         |
| ------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Map rendering                                                       | MapLibre is a renderer; no provider key                            | Use the installed dependencies.                                                                                                                                    |
| Liberty/Dark basemaps                                               | Public OpenFreeMap styles/tiles; no key                            | Internet and a compatible graphics environment are required.                                                                                                       |
| Catalog autocomplete, local filters, saved plans and private drafts | No key                                                             | Uses bundled/reviewed catalog data and device storage.                                                                                                             |
| Community sign-in, uploads and administrator review                 | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Configure the optional hosted project using [hidden-places.md](hidden-places.md). These settings alone do not create its database/storage policies.                |
| Global geocoding and road routing                                   | Not integrated                                                     | Do not add an arbitrary Google/Mapbox/Geoapify key expecting the existing app to start making requests. A routing/geocoding integration must be implemented first. |
| Weather and seasonal ranking                                        | Not integrated                                                     | No weather configuration is consumed by this app yet.                                                                                                              |
| Live AI                                                             | Not integrated; current assistant is labelled examples             | Select and implement a backend provider later. AI secrets must never enter `EXPO_PUBLIC_` variables.                                                               |

If connecting Supabase, copy `.env.example` to `.env.local` only if that file does not already exist, then fill in the two public settings and restart Expo. Never use a service-role key in the mobile/web client.

## Running and validation

Stop other MAPPER Metro terminals with Ctrl+C, then:

```powershell
cd E:\maps
npm.cmd run web -- --clear --port 8081
```

Open `http://localhost:8081`. For a direct map check, open `/discover`; the destination flow reaches its map after selecting a destination, start, experience and Show my trip. Use List while online map resources load.

The check suite passes 54 tests including the new render-safety lint cases and map-error sanitization. TypeScript/lint/formatting, Expo dependency compatibility and Android/web exports are checked with this change. Chrome is used only for screenshots; no interactive browser or physical-device navigation test is claimed. Native Android still requires a custom MapLibre build rather than Expo Go.

References: [React Native text containment](https://reactnative.dev/docs/text), [OpenFreeMap integration guide](https://openfreemap.org/quick_start/), [the full API audit](destination-discovery-review.md).
