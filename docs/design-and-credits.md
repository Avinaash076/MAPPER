# Design direction and content credits

## Visual system

The app uses a warm travel-journal direction: cream backgrounds, flat forest-green accents, real destination imagery and quiet touch feedback. Manrope is the primary typeface. Theme tokens control colors, spacing and radii; shared primitives control text sizes and common states.

The mobile navigation is a three-tab bottom bar. Place details use the native stack. Filters use a scrollable sheet with explicit apply/cancel behavior. Touch targets are at least 48 layout units; text scaling is left enabled; icon-only controls have descriptive accessibility labels. Large-text layout and screen-reader behavior still require device verification.

## Supplied references

- [Elaya Design AI Design Skills](https://github.com/elayadesign/ai-design-skills), specifically its landing-page design guidance. Typography, consistent spacing, meaningful motion and complete states informed the native design. Marketing-page section requirements do not apply to this mobile discovery flow.
- [Arc UI](https://uiarc.dev/) and [useLayouts](https://uselayouts.com/) informed the visual direction. Their web components are not copied into the native app or installed as native dependencies.
- [OnePromptDesign](https://onepromptdesign.com/) is a visual reference. Destination imagery in this milestone is actual location photography, not generated imagery.

Icons use Phosphor React Native. Font assets come from the Manrope font package. Their licenses remain with their distributed packages. The repository's own source is marked UNLICENSED pending the owner's public licensing decision; this does not replace third-party asset licenses.

## Place information

`src/features/places/seedPlaces.ts` contains editorial sample records with source URLs. Descriptions are short original summaries, not copied tourism articles. Coordinates and suggested visit times are approximate. Opening hours remain null, and fees are not asserted. Treat source links as research references rather than a guarantee of current entry conditions.

For public launch, verify every location's coordinates, access, categories and content directly. Add last-checked dates and maintain seasonal/access information when a catalog-maintenance process is introduced.

## Photography

`src/features/places/photos.json` is the attribution record for each bundled photo: author, license, source URL and available license URL. `photoAssets.ts` maps stable place IDs to local asset files. Detail screens display author/license and provide source/license actions. Images are resized from the source and may be cropped by the card's cover layout; no location is replaced with unrelated stock imagery.

The optional `scripts/fetch-photos.mjs` script obtains reuse metadata and image files from Wikimedia. Existing photos are retained; an unavailable or unlicensed response is skipped. Do not run this script as part of normal app startup or CI. Review newly fetched images visually and validate their credits before adding them to the catalog.

There are ten bundled photos in this milestone. The remaining places show a clearly labelled placeholder. To add another photo, provide a licensed file, register it in `photoAssets.ts`, add its metadata in `photos.json`, and verify it shows the correct destination. Preserve the original creator attribution and applicable license terms when distributing the app or website.

## Selected woven milestone

The app now uses design B and System/Light/Dark appearance. See woven-theme.md for the generated decorative asset, exact prompt, palette organization and performance choices. Destination photography retains its original credits.
