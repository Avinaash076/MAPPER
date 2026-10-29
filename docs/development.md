# Development and guided exercises

## Local setup

Use Node 22 and npm. Start with `npm.cmd ci` and `npm.cmd run web`. Open the URL printed by Expo. This version includes native MapLibre and therefore requires a custom Android build, not Expo Go.

For a standalone APK, configure the owner's Expo project with `npx.cmd eas-cli@latest login` and `npx.cmd eas-cli@latest build:configure`, then run `npx.cmd eas-cli@latest build --platform android --profile preview`.

For hot reload, build with `--profile development`, install it, then run `npm.cmd run start:dev-client`. Windows does not need an execution-policy change; use the `.cmd` commands. Native local compilation requires an Android toolchain; EAS can perform the cloud build.

Private contributions require no service keys. To send for review, follow hidden-places.md and restart Expo after changing `.env.local`.

## Learn in five working steps

### 1. Boot and navigation

Read the root layout, then the tabs layout. Understand the difference between the stack containing place details and the tab navigator containing Discover, My plan and Saved.

Exercise: change a tab label and verify that navigation still works. Explain why changing its visible title does not require changing the route filename.

### 2. Theme and components

Read the theme tokens and shared Label, Button, Chip, Panel and Field components. Notice that accessibility labels, touch sizes and type scaling are configured centrally.

Exercise: change the green token once. Confirm buttons, icons and selected chips still agree. Restore the intended color afterward.

### 3. Content and discovery

Read one named seed record and trace it through the repository into `filterPlaces`. A place ID is stable identity; its display name can change without deleting bookmarks.

Exercise: adjust one visit duration. Select Walking and a short time budget, then Car and a longer budget. Explain why the place appears or disappears. Add a focused test if you change the rule itself.

### 4. State and planning

Read the reducer actions, travel summary and persistence functions. Follow Add to plan from the detail screen through the reducer to the saved snapshot.

Exercise: add two places, move the second upward, restart the app and check the order. Try adding the same place again. Explain which function prevents duplicates.

### 5. Recovery and polish

Read the StorageBanner and empty states. Notice that no writes are allowed after a failed initial read until the user resolves recovery.

Exercise: use the persistence unit tests to supply malformed JSON and a failing storage adapter. Do not damage real saved data to test this. Then test the smallest phone text setting and a large accessibility text setting on a device.

## Automated checks

```powershell
npm.cmd run check
npm.cmd run check:dependencies
npm.cmd run build:android
npm.cmd run build:web
```

`check` runs TypeScript, ESLint, the focused tests and the formatter check. Android export compiles JavaScript and bundles assets. Web export prerenders all known place paths. Neither command signs an installable native binary.

Use `npm.cmd run format` after edits. The photo-maintenance script is optional; existing images are bundled and should not be downloaded on every build.

## Device acceptance checklist

These items require actual device observation. Do not mark them passed based on compilation.

- Open every tab, a place detail, and Android Back. Verify the filter sheet closes with Back and cancelling it does not apply a draft.
- Search while the keyboard is open; scroll and select a result. Check no controls become unreachable.
- Use a large text setting, a narrow screen and landscape. Check cards, filter choices and reorder controls do not overlap.
- Toggle a bookmark, add multiple stops, reorder, remove, and restart. Check saved state and save-status feedback.
- Select each transport mode, change town, reduce the time budget and check the over-budget message.
- Disable networking after installing a native build. Check bundled content, photos, local filtering and plan editing. External source links should fail gracefully.
- On iPhone, check safe areas, swipe/back behavior, modal dismissal and larger text separately.

Only Chrome may be used for app screenshots in this working session. Browser screenshots do not establish native-device validation.

## GitHub maintenance

Before a change, inspect `git status` and pull remote changes when the working tree permits it. Make a small branch for a feature, keep code and matching docs together, run checks, then commit and push normally. The initial bootstrap may go directly to an empty repository; future collaborative work should use reviewed pull requests.

The GitHub Actions workflow runs validation and both exports. It does not publish a website or release an app. Keep store credentials and API tokens in the appropriate secret store, never source files or `EXPO_PUBLIC_` variables.

## Additional acceptance checks

Test all three appearance choices, a system-theme change, theme persistence and selected-chip checks. With transport unselected, confirm no travel time is invented. Test location denial, services off, timeout, manual coordinates, low GPS accuracy, photo cancellation, five-photo limit, partial draft recovery, upload interruption and retry, email-code sign-in, rejection/resubmission and reviewed publication. Check privately captured coordinates never appear through the public catalog. Run native photo capture and restart tests on a real phone; localhost/HTTPS is required for browser geolocation/camera features.
