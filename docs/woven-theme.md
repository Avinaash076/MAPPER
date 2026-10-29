# Woven design and appearance

The selected design is **B — Pixel/Woven**. The earlier cinematic alternative is not implemented as a second app.

## Screen flow

Welcome → Plan my day → city/interests/optional transport → Discover map or list → place details → My plan / Saved.

Explore map skips setup and uses the last selected city, or Hubballi initially. The discovery header has a small city selector, search, horizontally scrolling interest choices and map/list/filter controls. The plus action opens private place contributions.

The appearance action uses System, Light and Dark choices and stays accessible from the main screens. System is the default. Light uses cream, forest green and muted gold; dark uses charcoal, warm text and soft green. Preferences are stored separately from plans. Changing appearance updates navigation, sheets, text, controls and map style.

## Code boundaries

- `theme/palettes.ts`: semantic colors for each appearance.
- `theme/preferences.ts`: preference decoding, system resolution and ordered writes.
- `ThemeProvider`: reactive appearance and persistence.
- Shared UI controls: 48-unit targets, selected checks, focus indicators and scalable text.
- `DiscoveryControls`, `CityPicker` and the two platform map adapters: presentation kept separate from filtering and route estimates.

Transport defaults to no selection. Without transport, discovery does not apply travel-time filtering; My plan shows suggested visit duration without pretending that travel time is zero. Existing v1 plan snapshots migrate to v2 with bookmarks, order and selected transport preserved.

## Map and performance choices

MapLibre Native renders the Android/iPhone map; MapLibre GL JS renders the website map. Both use the selected OpenFreeMap style and the same GeoJSON place data. The website loads the map library separately and serves its worker locally. The map remains mounted when opening filters or switching to list view. List browsing remains available if the map fails.

The artwork is a bundled WebP of about 492 KB. There is no runtime image generation, shader, video background or continuous decorative animation. Reduced-motion preferences suppress sheet/stack movement. Theme token tests check at least 4.5:1 ordinary-text contrast for active controls and notices.

Compilation and those checks do not establish frame rates or native gesture quality. Profile on the actual Android test phone before release.

## Artwork record

Saved app asset: `assets/artwork/woven-landscape.webp`. Generated with the built-in image-generation tool, then resized/compressed for the app. It depicts an imagined landscape, not a verified destination. Real place cards keep the attributed location photographs.

Generation prompt:

> Use case: illustration-story. Asset type: original decorative background for the Northern Trails native mobile tourism app. Generate a refined pixel-art and woven cross-stitch textile landscape inspired by northern Karnataka, India. A quiet river flows through a lush green rocky valley, with weathered ochre stone temple-like ruins along the bank and distant layered blue-green hills under a luminous pale golden sky. Rich deep teal, dark forest green, warm cream and muted golden ochre palette. Individual embroidered stitches form the image; sophisticated dense textile texture with legible large landscape shapes, not noisy random pixels. Portrait 2:3 composition suitable for a phone welcome screen: the upper third contains an airy dramatic sky and distant hills; the central river guides the eye into the valley; the lower quarter has darker quiet vegetation and rocks, leaving visual room for white headline text that will be added by the app. No people. This is an imagined decorative landscape, not documentary photography of a specific attraction. No text, no letters, no logos, no borders, no watermark, no phone mockup, no UI, no giant foreground object, no neon colors. Crisp and thoughtfully lit, calm, welcoming, artisanal, not childish.

## Run and review

```powershell
npm.cmd ci
npm.cmd run web
```

Open the URL printed by Expo. Compare appearances using the sun/moon action. For native MapLibre, Expo Go is insufficient: build the preview APK with the command in `development.md`.

Screenshots may be captured using Chrome only. Do not use Chrome for browser commands, navigation, DevTools or interaction tests in this session.
