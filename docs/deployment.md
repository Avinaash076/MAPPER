# Publish to Google Play or the web

Last checked against the linked official documentation on 28 October 2026. Store requirements and provider pricing can change; recheck them when releasing.

## What is already prepared

- `app.json` identifies the Expo app and both native package identifiers.
- `eas.json` has a preview profile producing an Android APK and a production profile producing an Android App Bundle.
- `netlify.toml` defines a static website build and its output folder.
- The place-detail route generates static parameters for every bundled place so direct website links can be exported.
- GitHub Actions checks the project without publishing it.

No Expo project, paid account, signing credential, store listing, hosting account or domain has been created by this implementation. No deployment has been performed.

## Test an installable Android app first

This version includes MapLibre and does not run inside Expo Go. Use EAS Build to test it as an installable application. Run these from the repository after reviewing the app identity:

```powershell
npx.cmd eas-cli@latest login
npx.cmd eas-cli@latest build:configure
npx.cmd eas-cli@latest build --platform android --profile preview
```

Login and any account agreements are completed by the account owner. Build configuration links the code to an Expo project and may add its project ID. Review and commit those project-specific changes. EAS can manage Android signing credentials; keep ownership and recovery access with the project owner.

The preview build returns an APK download link. Install it on the test Android phone, run the checklist in `development.md`, and test again with airplane mode enabled. An exported JavaScript bundle is not an APK.

Official reference: [EAS production builds and Android build types](https://docs.expo.dev/deploy/build-project/).

## Google Play Store release

1. Choose the final public brand and a unique permanent Android application ID. `com.northerntrails.app` is the current development identifier; verify it is appropriate before the first upload. Changing an application ID after publishing creates a different app identity.
2. Create or use the owner's Google Play Console developer account and complete its verification requirements. Check current account fees in Play Console.
3. Prepare a real app icon, store screenshots, descriptions, support contact and a public privacy-policy page. Review data-safety declarations, content rating, target audience and any permissions against what the actual release collects or shares. This version uses local drafts and on-demand location/camera/photo access. Enabling community sharing adds email authentication, uploaded photos and location/content submissions; review declarations against the actual configured release.
4. Run all checks and physical-device tests. Confirm current target Android API and store policy requirements against the actual EAS build before uploading.
5. Build the signed production bundle:

```powershell
npx.cmd eas-cli@latest build --platform android --profile production
```

6. Download the `.aab` and upload it in Play Console to the appropriate testing track. Manual upload is a clear first-release path. A service-account integration and `eas submit` can be configured later; credentials are not included in this repository.
7. Complete required testing, fix observed issues and submit for review. A successful upload is not production approval. Roll out gradually and monitor crashes and user feedback.

New personal Play Console accounts covered by Google's current policy require a closed test with at least **12 opted-in testers for 14 continuous days** before applying for production access. Account-specific requirements must be checked in the console. [Google's testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465).

`autoIncrement` and remote version tracking in `eas.json` help produce a new build number for subsequent releases. Keep the human-facing version in `app.json` aligned with release notes.

Official references: [build a store binary](https://docs.expo.dev/deploy/build-project/), [submit and promote through store tracks](https://docs.expo.dev/deploy/submit-to-app-stores/).

## Host the website

The first website is a static export of the React Native screens. It has local browser storage, no server and no account synchronization. A saved phone plan does not automatically appear in a browser.

Build it locally:

```powershell
npm.cmd ci
npm.cmd run check
npm.cmd run build:web
```

The website output is `dist/web`. Host that folder, not the repository source or the Android bundle output. Known place-detail pages are generated during the build; rebuild after adding places.

### Recommended initial host: Netlify

Connect the MAPPER GitHub repository in your Netlify account, choose the production branch and review the settings from `netlify.toml`: build command `npm run build:web`, output `dist/web`, Node 22. The connected host can build a preview for future changes. Configure a custom domain and HTTPS through the hosting provider when ready.

Validate the home page, `/plan`, `/saved` and a direct link such as `/place/unkal-lake` after deployment. Refresh the direct link as well as clicking it inside the app. Netlify serves the exported `.html` pages through extensionless URLs. The supplied Netlify configuration includes a scoped `/place/*` fallback to the application shell for newly reviewed community IDs that cannot be known at export time. Existing exported place pages take precedence. On another static host, configure the equivalent client-route fallback or choose an explicitly supported SPA/server deployment.

### Expo hosting alternative

After linking an Expo project, export the website and deploy with EAS Hosting:

```powershell
npm.cmd run build:web
npx.cmd eas-cli@latest deploy --export-dir dist/web
```

Review the preview before promoting it with the production option. Check current EAS CLI options and plan limits when doing this. [Expo web publishing](https://docs.expo.dev/deploy/web/).

Other static hosts can serve the same files if configured to resolve the exported route HTML correctly. GitHub is the code host here; GitHub Pages is not configured, and its subpath routing must be handled explicitly if chosen later.

## iPhone release later

The source supports iOS. Before claiming an iPhone release is ready, test on an actual device or simulator and complete Apple account/signing setup. EAS can build iOS from a Windows-driven workflow; the owner still needs the relevant Apple developer access and App Store Connect setup. Use TestFlight before production review. [Expo submission overview](https://docs.expo.dev/deploy/submit-to-app-stores/).

## Release limits to keep visible

This milestone has sample travel estimates and approximate coordinates, five photo placeholders, and unverified hours/fees. It is suitable for product learning and testing. Complete content verification, native-device QA, branding and store materials before a public release. The website is not yet a PWA with guaranteed offline reloads. See `offline-routing.md` for the download roadmap.

## Community configuration on hosting

Set only the public Supabase URL and publishable key in the web build environment and rebuild. Keep the bucket private and apply the supplied migration before enabling submission. No service-role or AI key belongs in a browser/mobile build. See hidden-places.md.
