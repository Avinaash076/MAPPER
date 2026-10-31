# Blue Discover refinement — 31 October 2026

## Decision

Use the blue Discovery Lens direction for a calmer map-oriented Discover screen. The initial phone view follows this order: labelled search, filters/list actions, real map with a single selected-place link, contribution action, collapsed collections, collapsed planning guidance, bottom navigation. The welcome design remains a later decision. The other screen compositions remain available.

This is an isolated design prototype, not a production feature release. No dependency, backend, API, database or production navigation changes are included.

## Research and application

These are design recommendations drawn from published guidance and the existing screen review, not findings from a MAPPER usability study.

| Evidence                                                                                                                                                                                 | Application in this revision                                                                                                                                                               | Trade-off                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [NN/g: Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) recommends deferring advanced choices until needed.                                             | Collections, planning guidance and filters use explicit expandable sections. Remove the large Discover slogan, permanent photo story and always-expanded place index from the blue screen. | Some features take an extra action to reach; clear labels preserve discoverability.                                                                                             |
| [NN/g: Complex Application Design](https://www.nngroup.com/articles/complex-application-design/) discusses prioritising tasks and transitions between primary and secondary information. | Search sits before the map. A single selected place links to details. Desktop adds a secondary side column instead of stretching phone content.                                            | More map area means less destination storytelling in the initial view.                                                                                                          |
| [Google Maps: Add a missing place](https://support.google.com/maps/answer/6320846?hl=en) provides a concrete example of contribution associated with geographic search.                  | “Know a place we’ve missed?” follows the map and is the prominent filled action. It opens the existing contribution study.                                                                 | MAPPER deliberately uses its own review policy: drafts and submissions remain private until administrator approval. Google's publication wording does not define MAPPER policy. |
| [Google PAIR: Mental Models](https://pair.withgoogle.com/guidebook-v2/chapter/mental-models/) emphasises understandable AI capabilities and expectations.                                | Do not automatically open a chatbot when someone changes a collection. A collection selection filters a set of places, which is a predictable operation.                                   | AI has less immediate visibility, but the interface avoids implying live recommendations or route generation.                                                                   |
| [Google PAIR: Feedback and Control](https://pair.withgoogle.com/guidebook-v2/chapter/feedback-controls/) supports explicit user control.                                                 | Search, category and collection combine. Reset restores an unfiltered state. Future AI suggestions should require an explicit add-to-plan action.                                          | Users must deliberately add suggestions rather than receiving an automatically rewritten plan.                                                                                  |
| [W3C: Disclosure Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) specifies understandable expand/collapse controls and keyboard behaviour.                                | Use native `details`/`summary`, visible headings, persistent labels and pressed/expanded states on custom controls.                                                                        | Native disclosure styling is restrained, with no gesture-only interaction.                                                                                                      |
| [WCAG 2.2 target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) sets minimum targets with exceptions.                                              | Keep MAPPER's stronger 48-unit control convention, visible focus and semantic light/dark tokens.                                                                                           | Larger controls occupy more space, so reduce simultaneous controls rather than shrinking them.                                                                                  |

Material's current [search guidelines](https://m3.material.io/components/search/guidelines) were also consulted, but their JavaScript-only body was unavailable to the research tool. No detailed finding is attributed to unread content.

## Why AI is not placed after the collection dropdown

A dropdown should change the collection. Opening a conversation automatically would change the task unexpectedly and add clutter. Keep the initial screen deterministic. Later, offer a separate “Ask about this collection” entry inside the expanded collection panel, opened only when requested.

That future assistant should show its selected area/collection, cite place references, distinguish source dates from current conditions, admit unknown access/hours, and avoid presenting approximate distances as verified routes. Provide explicit controls to add a suggested place, discard a suggestion and return to the map. Provider credentials stay on a backend. Offline mode should show saved information and explain when an answer requires connectivity.

## Days and planning

The expanded planning section explains the existing flow: select place → details → Add to my plan → reorder stops and choose transport. A 1–7 day selector explores placement and language only. Selecting more than one day explicitly states that multi-day planning is future work; it creates no itinerary. The current app supports one local day plan.

When implementing multi-day plans later, put the actual day assignment in My plan: trip length, day tabs, add a stop to a chosen day, and per-day travel/visit totals. Preserve manual ordering and let users revise the day count without silently deleting stops. Do not put all those controls on Discover. Choose travel providers and persistence migrations in that future implementation milestone.

## Small modules

- `src/stage4/BlueDiscover.tsx`: blue screen composition and preview state.
- `src/stage4/blueDiscoveryData.ts`: pure combined filtering of bundled examples.
- `src/stage4/CollectionAndTrip.tsx`: optional collection selection and planning explanation.
- `src/stage4/blue-discover.css`: scoped responsive styling using existing semantic tokens.
- `src/components/MapPreview.tsx`: optional visible marker IDs; retains the map instance while filters, layers and selections change.

The map-style thumbnail defect came from `.style-pair button` styling every nested button, including map markers. Restricting the rule to the direct style-choice buttons fixes that cascade without changing the approved map-selection composition.

## Review

Open `http://localhost:4313/?page=stage4&screen=Discover&variant=1&compare=0`. Switch appearance or the PC control to compare. The new screenshots have `blue-discover-` filenames; the previous Stage 4 ZIP contains the older design.

Validation results and remaining manual checks are recorded after capture below. Browser screenshots are not Android/iPhone device tests or a completed accessibility audit.

### Validation results

- Isolated TypeScript check, seven focused tests and preview build passed. Tests include combined search/category/collection filtering, empty results, non-mutating sample data, colour contrast, credits and independent preferences.
- Repository `npm.cmd run check` passed: TypeScript, lint, 32 tests and formatting. The first formatting run encountered old screenshot-only Chrome profiles. Those task-owned caches were removed, screenshots retained, and the existing Stage 3 note formatted before rerunning successfully.
- `npm.cmd run check:dependencies` passed. Android and web exports passed. Android export is JavaScript/assets, not an APK.
- Five Chrome captures exist: phone light/dark, desktop light/dark, and a 320-unit frame with enlarged control text. The standalone-frame alignment and contribution-action subtitle contrast were corrected during screenshot review.
- No Android/iPhone device testing or keyboard/screen-reader interaction test was performed. Enlarged-text screenshots are a limited layout check, not a substitute for device font-scaling and browser zoom tests.
- No production source files, dependencies or backend rules changed. Nothing was committed or pushed.

### Next review checkpoint

Review the blue Discover hierarchy first. Welcome artwork/layout remains deferred as requested. The earlier screenshot ZIP is unchanged and contains the previous design; use the new `blue-discover-` captures for this revision. Do not advance to Stage 5 until the user reviews this refinement.
