# Discovery Lens — UI implementation and next steps

The selected design is now implemented in the React Native application, with separate design studies under `design-exploration/`. The studies retain the four earlier directions and three layout families; their prototype interactions do not share the native app's local storage. Use the native app for real bookmarks, plans and private drafts.

## What changed

- A consistent slate-blue light/dark palette, clear input boundaries and the original M trail mark.
- Welcome: a finer locally bundled landscape illustration with a separate reading/action area; a two-column composition on wide screens.
- Setup: map appearance, town, interests and transport in four small steps. Hardware Back returns through steps on Android. Skipping transport continues to suppress travel estimates.
- Discover: labelled search and filters before the map, one selected-place summary, then the prominent contribution action. Interests and planning guidance are expandable. The assistant opens separately.
- Map appearance: exactly Liberty and Dark, independent of device/app theme and stored in its own AsyncStorage key. Side-by-side geographic previews use the same centre and zoom. Existing theme/trip storage keys remain unchanged.
- Details: primary add/save actions remain visible; access, seasonal information and sources use disclosures.
- Contribution: Location / Photos / Story steps retain the existing draft editor and saving rules. Account/review controls are disclosed at the review step. Publication policies have not changed.
- Saved and My plan retain their working bookmark, ordering, removal and persistence behaviours, using the selected shared theme.
- AI interface: separate route with contextual place/area, three example prompts, a question composer, answer cards, source disclosure and links back to place details. Arbitrary questions receive an honest demo response. No provider request, credentials or generated destination claims are introduced.

## Research applied

These are design decisions informed by published guidance. They are not outcomes from a user study and do not justify claiming an objective 8/10 or 9/10 quality score.

| Principle                                                                                                         | Applied decision                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [Hick's Law](https://lawsofux.com/hicks-law/)                                                                     | Separate setup decisions and contribution fields into steps; preserve selections between steps.                     |
| [Fitts's Law](https://lawsofux.com/fittss-law/)                                                                   | At least 48-unit action targets, labelled controls, explicit next/back actions rather than gesture-only navigation. |
| [Progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/)                                | Keep secondary Discover tools, place facts and account/review controls out of the initial view.                     |
| [Android layout guidance](https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-basics) | Respect safe areas, scrollable keyboard-aware content, flexible width and a separate expanded welcome composition.  |
| [Google PAIR mental models](https://pair.withgoogle.com/guidebook-v2/chapter/mental-models/)                      | Label AI examples, preserve user control, disclose sources and make unknown/live-service limits visible.            |

The finer woven artwork is decorative. Destination photography remains photographic, with existing credits. Dark map labels are provided by the official OpenFreeMap Dark style. Liberty is the default independent map choice, so users can keep a lighter map while using a dark app. Marker fill/outline colours remain distinct from app surface colours.

## Code organisation

Routes compose components in `src/app`. Welcome and assistant presentations live in their feature folders. `src/features/assistant/model.ts` contains the shared, pure example-response logic used by both the native and gallery interfaces. `src/components/ui/Disclosure.tsx` provides the reusable disclosure behaviour. `src/features/map/MapPreferences.tsx` owns map preference storage; `MapStyleChoices.tsx` owns map appearance controls. Palette, spacing and shape values remain shared tokens.

## Database: actual status and next milestone

This repository already contains `supabase/migrations/202610290001_hidden_places.sql`, contribution repositories and PostgreSQL policy tests. That is a database foundation, not evidence of an installed or configured hosted project. No hosted database or production backend was provisioned in this work.

Recommended next sequence:

1. Review the phone UI on an actual Android device: keyboard, Back, large text, denied permissions, offline draft recovery and map responsiveness. Record observations in `docs/development.md` before further schema work.
2. Inspect the supplied migration and policies in a staging Supabase project. Configure authentication and a private photo bucket, then test two separate user accounts plus an administrator. Follow `docs/hidden-places.md`.
3. Verify the full draft → private upload → pending review → approved publication flow. Keep captured coordinates separate from public coordinates. Generalise or withhold sensitive locations. Provide an administrator review interface before allowing public contribution publication.
4. Agree whether bookmarks/plans need account sync. If required, model owner-scoped trips, ordered stops and saved places; define local IDs, conflict handling, deletion and migration behaviour before adding tables. The current app intentionally saves one local day plan.
5. Connect the AI interface through a backend endpoint. Retrieve approved/source-backed place information, validate model output, add rate limits/timeouts and keep provider credentials server-side. Maintain deterministic filters and travel calculations outside the model. Unknown access/hours remain unknown.
6. Plan downloadable regions and routes separately. Offline tile packages, place/photo records and a routing graph are distinct resources; consult `docs/offline-routing.md` before choosing a provider or estimating storage.

## Validation boundary

Run and record `npm.cmd run check`, `npm.cmd run check:dependencies`, `npm.cmd run build:android`, `npm.cmd run build:web`, and the isolated gallery check/build. Android export validates JS/assets, not an installable APK. Browser screenshots do not establish device validation. No store release, hosted backend setup or AI provider integration is part of this UI delivery.

See [PC and Android run instructions](running.md) and [detailed validation record](ui-validation.md).
