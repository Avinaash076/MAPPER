# Offline maps and downloadable routes

## What works offline today

An installed native build includes the fifteen place records, ten licensed destination photos and Manrope fonts. Discovery filters, sample time estimates, bookmarks and the day planner use local data. The other five places show a labelled photo placeholder. External source links require a connection.

During development, Expo Go may still need access to the development server to load the application code. Use the preview APK to test an independently installed app. The website is not guaranteed to open or reload offline because no service worker or offline web app shell is implemented.

There are no downloaded routes, GPS positioning, maps or turn instructions in this milestone.

## Three different offline capabilities

| Capability                | Data required                                                       | What it allows                                    |
| ------------------------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| Downloaded map            | Tiles/vector data, style, glyphs and sprites for a region           | See the map without fetching it again             |
| Saved route               | Route geometry, instructions, mode, stops and metadata              | Display or follow a previously calculated journey |
| Offline route calculation | Routable regional graph, transport profiles and an on-device engine | Calculate a new route or reroute after leaving it |

A map tile package does not contain a routing engine. Saving a route polyline does not automatically enable recalculation when a stop changes. Keep these promises separate in the product UI and tests.

## Recommended staged approach

### Stage 1: online routing with a clean boundary

Introduce a `routing` feature with an adapter that accepts origin, ordered stops and transport. Return route distance, duration, geometry, instructions and provider/data provenance. Keep a small provider-neutral result type. Use sample estimates only as a clearly labelled fallback, never silently present them as a real road route.

Evaluate providers using northern Karnataka coverage, walking/bicycle/motorbike support, route storage rights, cost, data freshness and native compatibility. A driving profile is not automatically a valid motorbike profile. Verify legal road and trail access. Select the provider after a small local trial rather than hard-coding one now.

### Stage 2: save an existing route for offline viewing

Start with “Download this day plan.” Persist the selected route response and the place information needed to display it. Store small indexes in SQLite and route/asset files in the app's file storage. AsyncStorage remains appropriate for preferences and small ID lists; do not put tiles or large route geometry into its JSON snapshot.

A saved route should record a stable route ID, a fingerprint of origin + ordered stop IDs + transport + relevant data revision, download date, dataset/provider version, bounds, expected files and integrity metadata. Editing the start, order or transport makes the old download a different route. Keep the old package until the user replaces it; clearly show whether the current plan has a matching download.

Implement explicit download states: not downloaded, downloading, paused, ready and failed. Write to a temporary location and only mark ready after required files are verified. Interrupted or failed updates must leave a previously complete package usable. Add retry, cancellation, deletion, free-space checks and a visible downloaded-size estimate. Removing a download should not delete the user's day plan or bookmarks.

The first downloaded-route release should promise viewing the planned route offline. Show a clear message if rerouting is unavailable. Do not promise offline turn guidance until location updates, instruction progress and background behavior are actually implemented and tested.

### Stage 3: offline map regions

MapLibre React Native is a candidate to prototype because its documented OfflineManager manages regional resource packs and progress/error events. That is a candidate, not an installed dependency or final provider decision. Offline resource support does not decide the tile data source, its download rights, or routing capabilities. [MapLibre OfflineManager](https://maplibre.org/maplibre-react-native/docs/modules/offline-manager/).

A custom native map module means moving from Expo Go to an Expo development build and testing both platforms. Keep native and web map adapters separate; a mobile pack manager is not automatically a browser download implementation.

Use a tile source that explicitly permits offline distribution or operate a licensed data pipeline. OpenStreetMap's public standard tile server prohibits bulk download and prefetch features; it is not the source for this product's offline region downloads. [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/).

### Stage 4: on-device rerouting, if needed

Run a separate feasibility spike for an on-device routing engine and a northern Karnataka graph. Measure download size, peak memory, battery impact, storage, graph updates and the supported transport profiles on a modest Android phone. Review data and engine licenses. Only then select native bindings and commit to full offline route calculation.

## Code boundaries to preserve now

- Place lookup stays behind `placeRepository`; screens should not need to know whether content came from a bundle or a downloaded catalog.
- Travel rules stay outside UI components. Real routing should enter through a routing adapter, rather than network calls inside cards.
- Plan state keeps small stable IDs; downloaded files and their lifecycle belong to a dedicated download service.
- Display the source of travel information: sample estimate, cached route or freshly calculated route.
- Any future location feature must request permission when used and offer manual town/starting-point selection when permission is denied.
- AI must not invent access conditions or overwrite a route calculation. Offline questions would need a separate local retrieval/model strategy.

No placeholder download buttons or unused map SDKs are added to the current UI. The current architecture supplies the separation needed to add this feature deliberately.

## Acceptance scenarios for the future download milestone

Download a route while online; restart the app in airplane mode; verify geometry, instructions, place details and required map assets. Test leaving the downloaded bounds, changing transport, reordering stops, corrupt/missing files, expired metadata, insufficient disk space, interrupted downloads, duplicate download requests and updates while an older package is in use. Verify the app distinguishes “route unavailable” from “internet unavailable,” and never claims rerouting succeeded when no routing engine ran.
