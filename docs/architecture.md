# How the system works

## The current boundary

This milestone is a local React Native app with Expo and TypeScript. The same screens can be exported for the web through React Native Web. There is no backend, login, server database, location tracking, route provider or AI provider yet.

The app starts with three curated town centres. It uses a selected centre rather than the phone's GPS position. A distance filter is a circle measured in a straight line, not a road-distance boundary.

## Folders and responsibilities

| Location                         | Responsibility                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| `src/app`                        | Expo Router routes, stack and bottom-tab navigation                                  |
| `src/components/ui`              | Small reusable text, button, field, panel, notice, empty-state and screen primitives |
| `src/components/PlaceCard.tsx`   | Place preview and photo/fallback rendering                                           |
| `src/components/FilterSheet.tsx` | Editable filter draft; commit only when Apply is pressed                             |
| `src/features/places`            | Place types, seed content, photo metadata, repository and discovery filter           |
| `src/features/planning`          | Distance/time calculations, day summary and individual stop UI                       |
| `src/features/state`             | App context, reducer, versioned persistence and storage-error UI                     |
| `src/theme`                      | Colors, typefaces, spacing and corner radii                                          |
| `tests`                          | Logic tests independent of a phone or UI renderer                                    |
| `scripts`                        | Optional content-maintenance tooling; not application runtime                        |

Keep business rules in feature functions. A screen should select data and compose components. UI primitives must not calculate routes or read storage directly. The shared Screen composes the feature-owned StorageBanner; the smaller UI controls remain independent of app state.

## Starting the app

1. Expo Router loads the root layout and bundled Manrope fonts.
2. AppProvider creates a reducer with default discovery filters and empty ID lists.
3. The provider reads `northern-trails:v1` from AsyncStorage.
4. The decoder checks the stored version, record shape, filters and known place IDs.
5. Valid data hydrates the reducer. Missing data means a new local session. Invalid or unreadable data shows a recovery banner and blocks automatic writes.
6. After loading, the three tabs and place-detail route become available.

Bundled fonts and photos require no runtime photo service. The optional photo-fetch script runs only during content maintenance, not when someone opens the app.

## Discovering places

`placeRepository.list()` returns the bundled place records. `filterPlaces(places, filters)` performs these operations without changing the input:

- Trim and case-normalize the search term. Match name, locality or category.
- Match any selected interest. An empty interest list means all interests.
- Check straight-line distance from the selected town centre.
- Check whether the approximate outward travel, visit and return travel fit the available time.
- Sort the remaining places by distance from town.

Different filter dimensions combine with AND; selected interests combine with OR. For example, Nature plus Heritage accepts either interest, but the place must also match the search, distance and time limits.

Changing discovery filters does not delete saved places or plan stops. Changing the town, transport or time budget recalculates the existing plan. The reset action clears the search and restores filter defaults while keeping the selected town.

## Travel estimates

`distanceKm` uses the Haversine formula over latitude and longitude. `estimateTravelMinutes` multiplies that distance by a rough 1.3 detour factor and divides by an assumed speed: walking 4 km/h, bicycle 12 km/h, motorbike/car 35 km/h. These are demonstration assumptions, not local traffic models.

`summarizePlan` walks through stops in their displayed order. It calculates town → first stop → subsequent stops → town, adds each visit duration and compares the total with the time budget. The final element of `legs` is the return to town. An exactly matching budget is allowed; a larger total is flagged.

No road graph, legal access, slope, opening-hours or weather checks are performed. Transport changes the estimate; it does not prove the selected vehicle can reach the entrance. Final walking approaches are described in place notes.

## State changes and saving

AppState contains `filters`, `savedIds` and `planIds`. It stores IDs rather than copied place objects, so content updates appear consistently in every screen.

`appReducer` handles a small action vocabulary: update filters, reset filters, toggle a bookmark, add/remove a stop, move a stop and hydrate. Duplicate stops are ignored. Ordering returns a new array and ignores moves outside the list.

`loadState` is an I/O boundary. `decodeState` validates its unknown JSON input. Removed place IDs and duplicate IDs are pruned while preserving valid order. An unknown storage version is rejected rather than silently interpreted as the current schema.

`createStateWriter` serializes snapshots into one write queue. A slow older write therefore cannot overwrite a newer plan. A failed write rejects to the UI; later writes can still succeed. AppProvider never writes defaults before the initial storage read completes. The save indicator means AsyncStorage acknowledged the write, not that data was backed up to an account.

If loading fails, Retry attempts to load the stored version again. Reset requires an explicit confirmation in the app and starts from empty local state. If saving fails, keep the app open and retry. Data survives ordinary restarts, but uninstalling the app, clearing its data or clearing browser storage removes it.

## Common changes

| Change                                                         | Edit here                                                                           |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Place descriptions, approximate coordinates or visit durations | `features/places/seedPlaces.ts`                                                     |
| Add a town, category, transport label or default               | `features/places/types.ts`                                                          |
| Allowed distance/time choices                                  | `distanceOptions` / `timeOptions` in the same types module; persistence reuses them |
| Discovery matching rules                                       | `features/places/discovery.ts` and related tests                                    |
| Sample speeds or detour assumption                             | `features/planning/travel.ts` and related tests                                     |
| Saved-state shape or schema version                            | `features/state/model.ts` and `persistence.ts`; plan a migration for released apps  |
| App-wide colors, font names or spacing                         | `theme/tokens.ts`                                                                   |
| Shared text/button appearance                                  | `components/ui`                                                                     |
| Store identity or deep-link scheme                             | `app.json`                                                                          |

## Future service boundaries

Replace the place repository when a remote catalog is added. Replace sample travel calculations through a routing adapter when real routes are added. Keep route-provider responses out of screens. Add an offline-download feature next to planning rather than making the reducer store map files.

AI should be a backend-backed question feature grounded in approved place records and source dates. Provider secrets must remain on the backend. See the separate offline and deployment documents before introducing those services.
