# Northern Trails · MAPPER

A React Native discovery app for Hubballi, Dharwad and Belagavi. Choose interests, transport and time, then save a local day plan.

## Run locally

Use Node 22 and npm. In PowerShell:

```powershell
npm.cmd ci
npm.cmd start
```

Install Expo Go on your Android phone and scan the terminal QR code. Keep your phone and computer on the same network. Use `npm.cmd run web` for a local website preview.

The project uses Expo SDK 57. Follow the matching Expo Go version guidance in [the setup guide](https://docs.expo.dev/get-started/create-a-project/).

## Included

- Discover, My plan and Saved tabs; place details and filter sheet.
- Fifteen sample places; ten attributed photos bundled for offline use.
- Walking, bicycle, motorbike and car estimates, including the trip back to town.
- Local bookmarks, plan ordering, time-budget feedback and storage recovery.
- TypeScript, lint, formatting, focused tests, and GitHub Actions checks.

Travel times and coordinates are sample estimates. Map downloads, routing, GPS, accounts and AI are later milestones.

## Learn, maintain and release

Start with the [documentation index](docs/README.md). It links to the system walkthrough, guided exercises, implementation review, deployment instructions and offline-routing roadmap.

```powershell
npm.cmd run check
npm.cmd run check:dependencies
npm.cmd run build:android
npm.cmd run build:web
```

Source: [Avinaash076/MAPPER](https://github.com/Avinaash076/MAPPER).
