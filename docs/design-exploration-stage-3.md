# Stage 3 design exploration review

The Stage 3 comparison workspace is isolated in [`design-exploration/`](../design-exploration/README.md). It does not alter Expo routes, production components, dependencies, place data, storage, Supabase configuration or MapLibre production integration.

## What can be reviewed

The local gallery includes these complete visual directions:

| ID  | Direction                    | Typography                 | Visual emphasis                                                             |
| --- | ---------------------------- | -------------------------- | --------------------------------------------------------------------------- |
| A   | Woven Field Guide            | Lora + Manrope             | Detailed, subtle woven landscape illustration and calm field-guide surfaces |
| B   | Modern Cartographic Explorer | Manrope                    | Search-led, map-first discovery and compact factual cards                   |
| C   | Contemporary Dark Explorer   | Manrope                    | Restrained dark surfaces, mint accents and strong photography               |
| D   | Editorial Travel Journal     | Playfair Display + Manrope | Photography-led storytelling and editorial hierarchy                        |

For every direction, the gallery shows both light and dark semantic colour tokens; static English and Kannada fonts; the installed Phosphor icon family; buttons, labelled fields, selected chips, credited place cards, navigation, empty states and review-status states. It also includes mobile (390-unit) and PC (1440-unit) composition studies.

The cross-direction comparison uses the same Kelageri Lake image, destination text and actions in all four systems. This makes layout and visual hierarchy differences reviewable without changing content.

## Map appearance design

The map page uses only these OpenFreeMap style URLs:

- Liberty: `https://tiles.openfreemap.org/styles/liberty`
- Dark: `https://tiles.openfreemap.org/styles/dark`

It provides paired-card, large-preview/segmented and stacked-card selector concepts, and keeps `MapAppearance` distinct from `ThemePreference`. The preview retains actual MapLibre integration and labels its destination markers as samples. It does not imply route coverage, public-data coverage, access or safety conditions.

The Chrome screenshot runner displayed the gallery, foundations, cards and controls correctly. It showed the designed fallback on map tiles because that headless environment could not complete WebGL/tile rendering. This verifies the loading/error presentation, but **does not establish successful visual map-label or road rendering**. Check map rendering in regular Chrome before selecting a final direction.

## Artwork and photographs

Direction A uses one generated, Karnataka-inspired decorative landscape. It has small, fine texture rather than coarse pixel blocks and is labelled as an illustration. All destination cards use bundled authentic photographs and show source/author credit links. No photo has been pixelated, filtered or stylised.

## Validation

Run from the repository root:

```powershell
cd E:\maps\design-exploration
npm.cmd run check
npm.cmd run build
npm.cmd run start
```

The Stage 3 check covers the four named systems, safe theme-preference restoration and the exact two-choice map preference. TypeScript and the preview build pass. Automated colour-pair checks were completed when defining the systems; actual rendered checks remain part of review, especially at larger text sizes.

No device test, app-store build, deployment, commit or push was performed for this exploration.
