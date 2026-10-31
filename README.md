# Northern Trails · MAPPER

A React Native tourism app for Hubballi, Dharwad and Belagavi, using the Discovery Lens blue UI, light/dark themes, maps, local plans and private drafts for hidden places. The AI assistant interface includes clearly labelled interactive examples.

**Start here:** [PC, Android APK, live reload and phone IP instructions](docs/running.md) · [UI implementation and database next steps](docs/discovery-lens.md).

Latest changes: [Discovery Lens usability polish](docs/ui-polish-review.md) — responsive discovery, contribution review, conversational AI preview and simpler planning.

The independent design comparison gallery is in `design-exploration/`. Run `npm.cmd run build` and `npm.cmd run start` from that directory, then open `http://localhost:4313`. It retains the other visual directions separately from the selected native app.

## Website preview

Use Node 22 and npm. In PowerShell:

```powershell
cd E:\maps
npm.cmd ci
npm.cmd run web
```

Open the URL printed by Expo. Use the sun/moon action to select System, Light or Dark. Choose **Plan my day** or **Explore map**.

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

Real routes, downloadable maps and real AI remain later milestones. Source: [Avinaash076/MAPPER](https://github.com/Avinaash076/MAPPER).
