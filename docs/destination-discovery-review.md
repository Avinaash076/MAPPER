# Destination discovery redesign and API audit

2 November 2026 · `feature/woven-theme`

Historical milestone audit. Later optional provider integrations, their current limits and activation steps are documented in [online travel services](travel-services.md). They are disabled until configured and deployed.

## Audit before implementation

The project uses Expo Router in `src/app`, React context/reducers, semantic light/dark tokens and React Native primitives. Welcome is composed by `features/welcome/WelcomeScreen.tsx`; Discover is `features/places/DiscoverScreen.tsx`. Existing local bookmarks, day plans, photo drafts, reviewed-publication services, map layers and the isolated design gallery are preserved.

The principal gaps are road routing, worldwide autocomplete, weather, AI recommendations and monetary filtering. Existing filters use a **time budget**, not a spending budget. No routing or live ETA claim can be supported by the existing code.

| API / Service                         | Intended purpose                                                               | Current status            | Evidence in code                                                                                                                                                                                  | Missing work                                                                                                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OpenFreeMap                           | Liberty/Dark styles, tiles, map labels                                         | Integrated and working    | `features/map/model.ts` resolves official styles; web/native map components consume them. Actual web map screenshots were verified in the previous milestone; this is not native-device evidence. | Check current native rendering, network failure and provider availability on devices. No offline downloads.                                                       |
| MapLibre web/native                   | Render maps and selectable markers                                             | Integrated but incomplete | `PlaceMap.web.tsx` dynamically constructs a GL JS map with a local worker; `PlaceMap.native.tsx` uses the native module. Web maps have rendered in captured app screenshots.                      | Physical Android/iPhone validation. No road-routing service or route geometry is present.                                                                         |
| Geoapify                              | Geocoding, autocomplete, places, routing                                       | Not integrated            | No provider client, request, consumed response or environment-variable name found in the application.                                                                                             | Select/configure an appropriate provider later. This pass uses explicitly labelled catalog search.                                                                |
| Open-Meteo                            | Weather/seasonal recommendations                                               | Not integrated            | No client, request, response consumer or variable name found.                                                                                                                                     | Weather integration and location/date validation before seasonal recommendations.                                                                                 |
| Mistral                               | AI discovery                                                                   | Not integrated            | Assistant uses `features/assistant/model.ts` example responses. No Mistral client or credentials configured.                                                                                      | Backend provider integration and sourced-answer validation.                                                                                                       |
| Supabase Auth, PostgreSQL and Storage | Private submissions, administrator approval, published community places/photos | Integrated but incomplete | `services/communityClient.ts`, `contributions/submissionService.ts` and `places/communityRepository.ts` contain actual calls and consume results. SQL migration and policy tests exist.           | No local `.env` configuration was found; hosted authentication, uploads and review were not verified. Only public setting names are documented in `.env.example`. |
| AsyncStorage                          | Local bookmarks, one day plan, theme/map preferences and drafts                | Integrated and working    | Existing repositories and restoration/write tests; used by the running application.                                                                                                               | Physical-device restart/recovery checks; no account-based plan synchronization.                                                                                   |
| Expo Location                         | On-demand foreground GPS capture                                               | Integrated but incomplete | Existing capture service requests permission and consumes device coordinates, with a timeout.                                                                                                     | Physical permission-denial, services-off and GPS accuracy tests.                                                                                                  |

No keys or secret values were read into this report. No new API provider or package is required. Destination photographs have existing credits; source links are background information, not a live places API.

## Implementation scope

The new welcome offers exactly **I know where I want to go** and **Surprise me**. Known-destination search uses towns, bundled places and any reviewed catalog already available. It provides local autocomplete, recents, a selected preview and empty/error states. It does not imply worldwide geocoding or claim popularity.

The destination flow collects an origin, experience and optional discovery settings before opening a trip map. Destination radius and route-corridor radius remain separate. Along-route and Both expose their routing dependency; no straight-line corridor is presented as a real road route.

Surprise me reuses existing discovery/filtering around a town or explicitly captured current position. Spending preference and travel date are saved as intent only; verified prices, weather and season-aware ranking are pending. Optional settings are disclosed rather than required.

The trip map reuses the existing renderer and layers selector. Road geometry and real ETA remain unavailable. Any planning times use the app's existing straight-line distance, detour allowance and assumed speeds, with explicit labels. Selecting/removing a stop recomputes those local estimates; it does not call an absent routing API.

## Architecture and persistence

`features/journey/model.ts` holds local search, typed choices, radius rules and pure planning calculations. `persistence.ts` validates a separate versioned local record and serializes writes. `JourneyProvider` exposes selections to the short route components. Existing trip/bookmark/draft storage keys and publication rules remain intact. Precise GPS origins stay on the device; displaying an online map requests tiles for that vicinity.

The catalog is regional. A remote origin can legitimately produce no nearby results. Manual search covers the catalog and pilot towns; arbitrary-address lookup and tap-to-move map selection remain pending. Current location is requested only after an explicit action, with manual selection available after denial or timeout.

## Validation

- `npm.cmd run check`: TypeScript, lint, formatting and **51 tests passed**. This includes the existing PostgreSQL ownership/publication policy cases.
- `npm.cmd run check:dependencies`: passed; no new dependencies were added.
- `npm.cmd run build:web`: passed, exporting 35 routes, including the six new journey routes.
- `npm.cmd run build:android`: passed JavaScript/assets export. This is not an APK or a native-device test.
- After the small trip-panel deep-link/navigation refinement, TypeScript, focused lint and both exports passed again. No routing type errors or missing-module imports remain in those results.
- New tests cover real catalog matching, recent-history limits, independent geographic scopes, absent routing behavior, stop changes and deduplication, nullable transport, arrival rollover, calendar input validation, journey restoration/write recovery, explicit discovery origins, endpoint geometry, GPS denial, services disabled and GPS timeout. GPS tests use an injected test port, not a physical device.

Local capture script: `design-exploration/scripts/capture-discovery.ps1`. It uses Chrome only for screenshots, with isolated profiles and catalog-based fixture selections. Generated screenshots are ignored by Git; the gallery's older designs are not updated by this production-app redesign.

Inspected actual web-export captures include welcome, local search with a selected destination/photo credit, Surprise me, starting point, all four experience choices, trip settings, a real trip map and its illustrative schedule sheet. Light and dark appearances were used, with 520-unit compact frames and a 1440-unit desktop map. No loading/error overlay was mistaken for a working map. This is screenshot inspection, not interactive browser or device testing.

The map can be opened at `/trip-map?panel=details` or `/trip-map?panel=places` for reviewing its sheets with an existing local journey. These links do not bypass missing-destination guards or connect a routing service.

Device behavior, navigation interactions, keyboard handling, font scaling and hosted backend behavior must not be inferred from compilation or local model tests. Physical Android/iPhone GPS, camera, Back and safe-area acceptance remains required. Live road geometry/traffic/ETA, along-route stops, global geocoding, real prices, weather/season ranking and AI recommendations are pending integrations. They are not simulated as working APIs.

## Files and responsibilities

| Files                                                                                                                              | Responsibility                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `src/app/{destination,surprise,starting-point,trip-experience,trip-options,trip-map}.tsx`                                          | Six thin Expo Router entry points.                                                                  |
| `src/features/journey/{DestinationScreen,SurpriseScreen,StartingPointScreen,ExperienceScreen,TripOptionsScreen,TripMapScreen}.tsx` | Focused presentation for the new flow.                                                              |
| `src/features/journey/{PointSearch,LocationChoices,TravelIntentFields,TripDetails,JourneyNotice}.tsx`                              | Shared local search, on-demand location, optional intent, trip sheet and storage feedback.          |
| `src/features/journey/{model,persistence}.ts`, `JourneyProvider.tsx`                                                               | Pure discovery/estimate logic, validated storage and shared journey selections.                     |
| `src/services/locationRequest.ts`, `src/features/contributions/capture.ts`                                                         | Tested permission/timeout handling reused by existing capture.                                      |
| `src/features/places/{discovery,useDiscoveryOrigin,types}.ts`, `DiscoverScreen.tsx`                                                | Explicit-coordinate filtering and supported radii while preserving old town-based defaults.         |
| `src/features/map/{types,model}.ts`, `PlaceMap.{web,native}.tsx`, `MapStyleChoices.tsx`                                            | Endpoint markers, geographic framing and the existing independent Liberty/Dark selector.            |
| `src/app/_layout.tsx`, `src/features/welcome/WelcomeScreen.tsx`, `src/app/setup.tsx`                                               | Provider composition, navigation and the two welcome choices; legacy setup retains map layers.      |
| `src/components/{FilterSheet,PlaceCard}.tsx`, `src/features/setup/CityPicker.tsx`, `src/features/planning/PlanSettings.tsx`        | Consistent discovery origin, distances and explicit town resets.                                    |
| `app.json`, `tests/journey.test.ts`, `design-exploration/scripts/capture-discovery.ps1`                                            | Broader foreground-location permission wording, regression tests and reproducible capture commands. |
| `README.md`, `docs/{README,running,architecture,destination-discovery-review}.md`                                                  | Current behavior, run instructions and this API audit.                                              |

## Recommended next step

Run the phone acceptance checklist first. Then evaluate and connect a single real geocoding/routing provider behind the existing service boundaries. Route geometry, corridor suggestions and arrival recalculation should be enabled together only after real response handling is verified. Keep AI credentials on a backend and complete hosted contribution review testing before public submissions are promoted.
