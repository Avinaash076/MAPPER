# Northern Trails · MAPPER

A React Native tourism app for Hubballi, Dharwad and Belagavi, using the Discovery Lens blue UI, light/dark themes, maps, local plans and private drafts for hidden places. Optional Geoapify routing, Open-Meteo forecasts and Mistral AI use a signed-in backend; labelled examples and local browsing work without it.

**Start here:** [PC, Android APK, live reload and phone IP instructions](docs/running.md) · [UI implementation and database next steps](docs/discovery-lens.md).

**Study the code:** [File-by-file guide, named functions and reading order](docs/study-guide.md).

**Online services:** [Provider keys, Supabase deployment, privacy and validation](docs/travel-services.md). Keep all provider keys on the server. No hosted service has been deployed by this code change.

**First Supabase test:** [Step-by-step setup, email codes, migrations and test commands](docs/supabase-setup.md). Start with `npm.cmd run backend:setup` and `npm.cmd run backend:check`.

**Check only provider keys:** `npm.cmd run keys:check` reads the ignored server environment and contacts providers directly from Node; no Supabase deployment is needed. Add `-- --chat` to explicitly test a real sample AI completion. This does not activate the app's online UI.

Latest changes: [Destination discovery redesign and API audit](docs/destination-discovery-review.md) — two entry paths, catalog search, current/manual starting points, trip experience and map previews. [Earlier usability polish](docs/ui-polish-review.md) covers the shared blue UI.

The independent design comparison gallery is in `design-exploration/`. Run `npm.cmd run build` and `npm.cmd run start` from that directory, then open `http://localhost:4313`. It retains the other visual directions separately from the selected native app.

## Website preview

Use Node 22 and npm. In PowerShell:

```powershell
cd E:\maps
npm.cmd ci
npm.cmd run web
```

Open the URL printed by Expo. Use the sun/moon action to select System, Light or Dark. Choose **I know where I want to go** or **Surprise me**.

## Android preview

MapLibre requires a custom build; this version does not run in Expo Go.

```powershell
npx.cmd eas-cli@latest login
npx.cmd eas-cli@latest build:configure
npx.cmd eas-cli@latest build --platform android --profile preview
```

Install the resulting APK on the phone. For hot reload, use the development profile and `npm.cmd run start:dev-client` after installing that build. Build configuration requires the owner's Expo account.

## Hidden places

Tap **Know a place we’ve missed?** on Discover to save a location, photos and a description privately. Finish a draft later, then review it before sending. Publication is only after administrator review.

Private drafts work without backend setup. Community uploads need the optional Supabase configuration in [the contribution guide](docs/hidden-places.md); no hosted project has been provisioned.

## Documentation and checks

[Documentation index](docs/README.md) · [Design and themes](docs/woven-theme.md) · [Detailed review](docs/review.md) · [Play Store/web deployment](docs/deployment.md)

```powershell
npm.cmd run check
npm.cmd run check:dependencies
npm.cmd run build:android
npm.cmd run build:web
```

Online routes and AI require the optional backend setup above. Downloaded maps, offline routing and live traffic remain later milestones. Source: [Avinaash076/MAPPER](https://github.com/Avinaash076/MAPPER).
