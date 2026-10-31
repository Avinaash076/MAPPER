# Run MAPPER on PC and Android

Use Node 22 and npm. On this Windows machine use `npm.cmd` / `npx.cmd` in PowerShell. Source branch for this delivery: `feature/woven-theme`.

## First checkout

```powershell
git clone --branch feature/woven-theme https://github.com/Avinaash076/MAPPER.git E:\maps
cd E:\maps
npm.cmd ci
```

If `E:\maps` already contains your checkout, open it and switch to the feature branch rather than cloning over it. Preserve any local work before pulling updates.

## PC: actual app

```powershell
cd E:\maps
npm.cmd run web
```

Open the URL printed by Expo, normally `http://localhost:8081`. The actual app includes the blue UI, one local day plan, bookmarks, private drafts and the interactive AI interface demo. No Supabase or AI key is needed for local browsing and private drafts. Photos, maps and source links have different offline requirements; maps need internet.

## PC: separate design gallery

After installing the root dependencies:

```powershell
cd E:\maps\design-exploration
npm.cmd run build
npm.cmd run start
```

Open `http://localhost:4313/?page=stage4&screen=Discover&variant=1&compare=0`. Select Welcome, Map appearance, Preferences, details, contribution/review or AI assistant in the toolbar. The original foundation sheets and other directions remain available from the Stage 3 link. The gallery uses local React DOM previews; it is not an Android package.

### Gallery on your phone through the PC's IP

```powershell
cd E:\maps\design-exploration
npm.cmd run start:lan
ipconfig
```

Use your active Wi-Fi adapter's IPv4 address. Example: `http://192.168.1.10:4313/?page=stage4&screen=Discover&variant=1&compare=0`. Put phone and PC on the same network. If Windows asks, allow Node on the private network you are using. Keep PowerShell running. `0.0.0.0` is the listening address, not the address to type on your phone. Press Ctrl+C to stop. Stop an existing preview server before changing its listening mode.

## Android: installable preview APK

MapLibre is a native module. Expo Go cannot run this application. Build an APK through the owner's Expo account:

```powershell
cd E:\maps
npx.cmd eas-cli@latest login
npx.cmd eas-cli@latest build:configure
npx.cmd eas-cli@latest build --platform android --profile preview
```

Review the one-time project-linking changes from `build:configure`. Open the successful EAS build link on Android, download and install the APK. The preview APK contains bundled code; it does not need Metro running. Signing/project ownership and any EAS plan requirements belong to the owner's account. No APK was built or installed by this UI task.

## Android: development with live reload

Build and install the custom development client once:

```powershell
cd E:\maps
npx.cmd eas-cli@latest build --platform android --profile development
```

Then start Metro:

```powershell
npm.cmd run start:dev-client -- --lan
```

Keep PC/phone on the same Wi-Fi. Open the installed development client and use its QR/development-server link. This is different from the gallery's port 4313. If LAN access fails, check the printed address, firewall prompt and whether the network isolates connected devices.

## Checks and release

```powershell
cd E:\maps
npm.cmd run check
npm.cmd run check:dependencies
npm.cmd run build:android
npm.cmd run build:web
```

`build:android` exports JavaScript/assets to `dist/android`; it does not create an APK. `build:web` writes a static website to `dist/web`. For web hosting, Play Store AABs and iOS release steps, see [deployment.md](deployment.md). Publishing is a separate release action; a GitHub push does not publish the app.
