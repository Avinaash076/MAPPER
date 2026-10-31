# MAPPER Stage 3 design exploration

This isolated preview compares four visual directions without changing the production Expo application:

- **A — Woven Field Guide:** a subtle, detailed illustrated landscape with warm field-guide surfaces.
- **B — Modern Cartographic Explorer:** search-led, map-first discovery.
- **C — Contemporary Dark Explorer:** restrained, photograph-led discovery with complete light and dark appearances.
- **D — Editorial Travel Journal:** story-led cards and expressive editorial headings.

Every direction has light and dark tokens, Phosphor icon examples, typography, fields, buttons, chips, credited place cards, review-status examples and desktop/mobile compositions. Map comparisons use exactly OpenFreeMap Liberty and Dark. The two preferences are separate in the preview, just as they must be in the eventual app.

## Run locally

From the repository root:

```powershell
cd E:\maps\design-exploration
npm.cmd run build
npm.cmd run start
```

Open `http://localhost:4313` in Chrome. The preview saves app appearance and map appearance only in the browser’s local storage. It does not modify MAPPER’s production storage, routes, data or backend.

Useful pages:

- `/?page=stage4&screen=Discover&variant=1&compare=0` — revised blue Discover: search, map, contribution and optional collection/planning sections. See [research and review](docs/blue-discover-review.md).

- `/` — all four directions
- `/?page=comparison` — the same destination in all four systems
- `/?page=foundation&direction=A` — an individual foundation sheet; replace `A` with `B`, `C` or `D`
- `/?page=compositions&direction=B&mode=light` — mobile and PC composition studies
- `/?page=maps&direction=B` — three map appearance selector concepts

The maps need an internet connection and WebGL. A map error leaves an explicit retry state; the rest of the sheet remains usable. Map previews use sample destination markers and are not live routing, public place coverage, current access information or a safety report.

## Validate

```powershell
cd E:\maps\design-exploration
npm.cmd run check
npm.cmd run build
```

The review uses only genuine destination photos stored in `assets/photos/`, with source/author credits shown below every image. Direction A’s generated decorative landscape is stored separately as `assets/woven-landscape.png`; it is not presented as a real destination or community photo. Static font files and licenses are stored under `assets/fonts/` for consistent Android, iPhone and web review.
