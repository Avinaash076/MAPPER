# Milestone implementation review

Review date: 28 October 2026. This document records what exists, the reasoning behind it, and the evidence still needed before release. It is maintained with the code.

## Implemented behavior

The app has Discover, My plan and Saved tabs with a separate place-detail screen. Discovery combines town selection, text search, interests, distance, transport and available time. Places are nearest first and must fit an estimated return outing. The filter sheet keeps a draft until applied.

The catalog contains fifteen curated sample records across the Hubballi–Dharwad–Belagavi pilot region. Ten destination photos are bundled with credits. Details show access/seasonal notes, approximate visit duration, source links, bookmarks and Add to plan. Unverified hours and fees are visibly unknown. Missing places and photos have explicit fallback states.

The day planner supports ordered stops, upward/downward movement, removal, duplicate prevention, travel/visit totals, the return to town and over-budget feedback. Saved places and plan IDs survive ordinary app restarts through local storage. There is no account sync.

## Maintainability decisions

- Small shared UI modules prevent button/text styling from drifting between screens.
- Theme values have one home. Allowed distance/time choices are shared by filter UI and storage validation.
- Place content uses named fields instead of positional tuples, so editing a duration cannot accidentally replace a coordinate.
- Repository access, filtering, travel math, reducer transitions and storage are separate from presentation.
- Plan summary and stop rendering are independent components rather than a single large screen implementation.
- Pure functions are tested without rendering a native app. Storage is tested through a small injected interface.
- Parsed storage is treated as unknown input. Schema and filters are checked, stale IDs are pruned, and automatic writes wait for successful loading.
- Writes are queued in order. A failed write does not permanently break the queue. Failed initial reads do not silently overwrite previous data.
- A formatter, lockfile and GitHub workflow make the same checks repeatable for future changes.

Two narrowly documented React lint exceptions cover synchronization with external storage in AppProvider. They are not blanket rule exclusions. The async write completion updates are guarded so an older effect cannot report a newer snapshot as saved.

## Validation record

The focused suite covers combined filters, interest matching, distance ordering, transport differences, return travel, exact time budgets, empty plans, duplicate prevention, reorder boundaries, bookmark toggling, reset behavior, storage round trips, corrupt data, read/write errors, write ordering and seed-record integrity.

The final local automated checks passed after the maintainability refactor. Android export means a bundled JavaScript artifact, not a signed APK or a device test.

| Check                                       | Result                                                                                                     |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| TypeScript                                  | Passed                                                                                                     |
| ESLint                                      | Passed                                                                                                     |
| Focused tests                               | Passed: 10 tests, 0 failures after the final refactor                                                      |
| Formatting                                  | Passed                                                                                                     |
| Expo dependency compatibility               | Passed after the final refactor                                                                            |
| Android JavaScript export                   | Passed after the final refactor                                                                            |
| Static web export and direct place pages    | Passed                                                                                                     |
| Native Android interaction and restart test | Not performed; no connected device verified                                                                |
| iPhone layout and interaction test          | Not performed                                                                                              |
| Chrome app screenshots                      | Not captured; browser automation could not verify the current URL; no other browser actions are authorized |
| Play Store or website deployment            | Not performed                                                                                              |

## Current limits and follow-up priorities

Sample travel math does not know roads, trails, traffic, restrictions, opening hours or final walking distance. Coordinates, access notes and visit durations need a real content-verification pass. Motorbike and car currently share an assumed speed; this is intentional sample behavior, not route equivalence.

The catalog is small enough for a ScrollView and in-memory filtering. Move discovery to a virtualized list when the catalog grows; avoid adding that complexity before it is needed. A remote catalog will need freshness, loading, caching and error behavior beyond this bundled repository.

AsyncStorage stores a small local snapshot, is not encrypted storage and is not a backup. Future downloaded assets belong in file storage with a separate index, not this snapshot. Introduce migrations rather than discarding state when released schema versions change.

Before public launch, complete physical Android and iPhone QA, validate keyboard and larger-text behavior, verify catalog content, add final branding and screenshots, and prepare the privacy policy/store listing. The app currently supplies no embedded map, live location, live routes, public transport, bookings, AI questions or downloaded routes.

Next implementation milestone: real location/manual origin and a routing/provider trial. After that, add route downloads following `offline-routing.md`. Keep real-routing work separate from AI question answering so factual journey calculations remain testable.

## Build observations

The final Android JavaScript artifact is approximately 9.2 MB and the web JavaScript artifact approximately 7.1 MB before host transfer compression. These are development-milestone outputs, not measured startup performance or installed app size. Profile on a modest phone before release; reduce unused icon/font/module imports if measurements show a bottleneck. Static export generated 24 route entries, including all 15 known place-detail paths.
