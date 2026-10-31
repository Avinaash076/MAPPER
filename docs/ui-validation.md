# Discovery Lens validation record

Date: 31 October 2026. Branch: `feature/woven-theme`. Latest follow-up: [usability polish](ui-polish-review.md).

## Automated evidence

- `npm.cmd run check`: passed TypeScript, lint, 38 tests and formatting. The test run includes six PostgreSQL policy cases enforcing private ownership and administrator publication.
- `npm.cmd run check:dependencies`: passed; Expo dependencies are compatible.
- `npm.cmd run build:android`: passed; JavaScript/assets exported to `dist/android`.
- `npm.cmd run build:web`: passed; 29 routes exported, including `/assistant`.
- Isolated gallery TypeScript, seven tests and build: passed.
- Added focused tests for assistant example sources, unsupported questions and independent Liberty/Dark map resolution. Existing contrast, duplicate prevention, storage recovery and contribution policy tests remain in the check suite.
- Polish coverage adds ordered undo without duplicates, private-pin geometry and combined-filter result counts. The assistant no longer imports `@react-navigation/elements`; it uses its own safe-area header without adding that dependency.

These results establish compilation and tested logic, not native device behaviour or a complete accessibility audit. Late presentation/documentation refinements are rechecked before commit.

## Visual evidence

Actual app screenshots are captured from the static web export using Chrome at compact and expanded browser sizes, stored locally under `design-exploration/screenshots/app-*.png`. Gallery comparisons use their own preview and `stage4-`/`blue-` screenshots. Capture scripts are included; generated images and ZIPs are ignored by Git.

The actual app capture set covers welcome, map setup, Discover, place details, empty My plan, empty Saved, private contribution entry and AI entry, plus expanded welcome/assistant views. Capturing an actual contribution editor requires creating a local draft, so that screen is assessed through its code and existing draft tests, with its gallery composition available separately.

Inspected captures show real map labels/attribution, the blue theme and decorative artwork, separate AI entry and clearly labelled example prompts. A separate selected-place card initially pushed the contribution action down; final Discover uses a compact map overlay so contribution follows the map directly. Light-theme gallery captures supplement the actual app's system-dark browser captures. These browser layouts do not establish physical phone behaviour.

## Outstanding device acceptance

The polish pass also captured and inspected the actual web app in light and dark appearances: compact Discover, expanded Discover, assistant entry, town setup, populated plan, place details, private draft list and the contribution location step. Files use the `polish-` prefix under the ignored local screenshot folder. These are 520-unit compact and 1440-unit expanded browser captures, not physical-phone screenshots. The local screenshot server can accept a `CAPTURE_STORAGE_FILE` containing key/string-value fixtures, applied only to `?capture=1` requests in disposable Chrome profiles. A clearly fictional draft and a seeded local plan were used; no GPS capture, upload or publication occurred.

Screenshot review identified clipped compact tab labels and an oversized placeholder in thumbnail cards; the follow-up fixes give tabs explicit scalable height and use an icon-only thumbnail fallback. Full conversation interaction, contribution photos/story/review and keyboard behavior still require the acceptance checks below.

- Android/iPhone installations, physical Back and safe areas.
- Keyboard opening/dismissal and reaching the assistant composer or draft fields.
- Accessibility font scaling, screen-reader announcements and keyboard-only web focus.
- GPS denial/low accuracy, photo selection/camera, draft restart and submission interruption.
- Full backend upload, administrator approval and public-photo retrieval against a hosted staging project.
- Map responsiveness and appearance switching on a physical device.

No APK, Play Store release, hosted database deployment or live AI service has been produced by this task. Follow [running.md](running.md), [development.md](development.md) and [hidden-places.md](hidden-places.md) for those next checks.
