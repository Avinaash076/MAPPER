# Woven design and hidden-place contribution review

Review date: 29 October 2026. Branch: `feature/woven-theme`.

## Implemented

- Woven welcome and setup, city selection, optional interests/transport and direct map entry.
- System/light/dark themes across navigation, text, controls, sheets and map styling.
- MapLibre Native and web adapters, local web worker, GeoJSON markers and list fallback.
- Existing detail, bookmark and ordered-plan behavior, with v1 → v2 migration and no assumed transport.
- Private hidden-place drafts: on-demand location capture, accuracy/timestamp, manual coordinates, photo picking/camera, copied or IndexedDB-backed images, captions, descriptions and access notes.
- Immediate ordered draft writes, save feedback, duplicate proximity suggestions and explicit submission consent.
- Optional Supabase email-code sign-in, private photo uploads, retries and pending/approved/rejected review status.
- Separate public reviewed catalog. Administrators explicitly choose public coordinates; contributors cannot self-approve.
- Clearly labelled sample AI answers. No real AI service or AI key is configured.

## Code structure

Shared primitives and theme tokens control appearance. Screens compose small feature components. Pure filtering, travel, theme resolution, draft validation and payload construction stay independent of I/O. Storage, photo operations and backend submission have separate modules. Native and web photo/map adapters share typed interfaces.

Plan preferences, appearance, private draft metadata, image files/blobs and reviewed catalog cache use separate storage locations. Large photos are not embedded into the plan snapshot. Failed reads do not silently replace damaged drafts with defaults.

The local PostgreSQL policy test caught and corrected an SQL name-resolution issue in the photo-folder policy. Client metadata updates also exclude immutable ownership fields, matching column-level grants.

The first hosted check exposed a fresh-checkout type dependency: local Expo startup had generated CSS declarations that CI did not have. The tracked TypeScript configuration now includes Expo's types directly, so map CSS imports do not depend on a prior development-server run.

## Verification

The final verification record is updated after all checks complete. Successful JavaScript exports are not signed APKs or device tests.

| Check                                                           | Result                                                                |
| --------------------------------------------------------------- | --------------------------------------------------------------------- |
| TypeScript, ESLint, formatting                                  | Passed locally                                                        |
| Logic, storage, theme and map tests                             | Passed: 32 tests, 0 failures                                          |
| Actual PostgreSQL migration/policy execution                    | Passed local owner-isolation, publication and photo-privacy scenarios |
| Expo dependency compatibility                                   | Passed locally                                                        |
| Android JavaScript export                                       | Passed locally                                                        |
| Static web export                                               | Passed locally                                                        |
| Live hosted Supabase Auth/Storage                               | Not performed; owner project configuration required                   |
| Native Android/iPhone permissions, keyboard, Back and rendering | Not performed on a verified device                                    |
| Frame-rate measurement                                          | Not performed                                                         |
| Chrome app screenshots                                          | Not captured                                                          |
| Store or website deployment                                     | Not performed                                                         |

## Practical limits

The map is online; map downloads, route downloads and offline rerouting are not implemented. Bundled content and private native drafts remain usable without a backend. Website offline reloads are not guaranteed. Cached community photo URLs expire.

Travel estimates still use straight-line distance, a detour factor and sample speeds. Community visit durations currently use a clearly suggested 60-minute default. Coordinates, hours, access and content still require human checks.

Hosted community sharing needs the supplied migration, a private bucket, email authentication and the public project settings from `.env.example`. No hosted project, credentials, administrator UI or moderation staffing is provisioned. The local PostgreSQL tests model Supabase interfaces; hosted file delivery and email behavior need an integration pass.

Before public release, verify actual photo transcoding and metadata handling, permissions, content accuracy, physical-device UI, moderation/withdrawal operations and the release materials described in `deployment.md`.

## Next work

Configure and test the owner’s Supabase project; perform Android and iPhone QA; then trial real routing and planned offline packages. Keep AI question answering separate from routing and moderation.

Map resource smoke checks: both OpenFreeMap style endpoints returned HTTP 200 with style version 8; the local worker returned JavaScript successfully. These checks do not replace interactive map or frame-rate testing.
