# Routing, forecasts and Mistral AI

Provider adapters, a Supabase Edge Function and app controls are implemented. Provider accounts, private keys and hosted deployment are not supplied. Local browsing, plans and private drafts still work without this setup. OpenFreeMap maps remain keyless and independent.

## Providers

| Company    | Purpose                                                                                                       | Configuration                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Geoapify   | Indian address search; route geometry, distance and per-leg duration for walking, bicycle, motorcycle and car | Server `GEOAPIFY_API_KEY`                                                                                                   |
| Open-Meteo | Daily destination temperature range and maximum rain probability, today or the next six days, Asia/Kolkata    | Server `OPEN_METEO_MODE=prototype` for non-commercial evaluation; `commercial` with `OPEN_METEO_API_KEY` for subscribed use |
| Mistral    | Structured answers using server-selected public place information                                             | Server `MISTRAL_API_KEY` and `MISTRAL_MODEL`                                                                                |
| Supabase   | Existing email accounts, database and private uploads; new gateway and quota counters                         | Public app URL/publishable key; privileged credentials stay on the server                                                   |

Official contracts: [Geoapify routing](https://apidocs.geoapify.com/docs/routing/), [autocomplete](https://apidocs.geoapify.com/docs/geocoding/address-autocomplete/), [Open-Meteo forecast](https://open-meteo.com/en/docs), [Open-Meteo commercial terms](https://open-meteo.com/en/pricing), [Mistral chat](https://docs.mistral.ai/api/endpoint/chat). Check current account terms, model availability and pilot-region coverage before release.

## Code structure

- `src/services/travel/types.ts`: shared request/result types, no secrets.
- `client.ts`: signed-in requests, cancellation, timeout and actionable error messages.
- `useServiceSession.ts`: observes the existing memory-only Supabase session.
- `supabase/functions/travel-services/index.ts`: server environment and handler registration.
- `supabase/functions/_shared/gateway.ts`: verified authentication, CORS, bounded input, database quota and public catalog lookup.
- `_shared/providers.ts`: Geoapify and Open-Meteo adapters with checked coordinates, geometry, units, dates and durations.
- `_shared/assistant.ts`: Mistral prompt, structured output checks and canonical source links.
- `_shared/http.ts` and `validation.ts`: bounded reads, timeouts and small validation helpers.
- `useOnlineTrip`: temporary request state, cancellation and protection against results for changed trips/accounts.
- `routeModel.ts`: pure corridor-distance and arrival calculations.

The server reuses named seed records, avoiding a second seed catalog. It reads community AI context only from `community_places`, never `place_submissions`, captured coordinates or photographs. Explicit `.ts` type imports support Deno; app TypeScript permits these with no emit. No provider SDK or native dependency was added.

## Staging setup

Use a Supabase project you own. Preserve existing migration history; do not reset a database.

```powershell
cd E:\maps
npx.cmd supabase@latest login
npx.cmd supabase@latest link --project-ref YOUR_PROJECT_REF
npx.cmd supabase@latest db push --dry-run
```

Review the dry-run list for the intended project, then apply pending migrations:

```powershell
npx.cmd supabase@latest db push
Copy-Item supabase\functions\.env.example supabase\functions\.env.local
```

The new migration `202611040001_travel_service_limits.sql` creates counters and a service-only quota function. It does not change contribution publication. A new project also needs the existing hidden-place migration for community sharing.

Edit the ignored **server** file `supabase/functions/.env.local`. Add Geoapify and Mistral keys. Set `MISTRAL_MODEL` to a chat model enabled in your account; no model is silently substituted. Choose prototype weather only for non-commercial testing, or commercial mode with a subscribed key. Set `ALLOWED_APP_ORIGINS` to comma-separated exact website origins, including scheme and port. Native requests have no browser origin but still require verified authentication.

Supabase supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` inside hosted functions. These privileged credentials do not belong in the app. See [function secrets](https://supabase.com/docs/guides/functions/secrets).

```powershell
npx.cmd supabase@latest secrets set --env-file supabase/functions/.env.local --project-ref YOUR_PROJECT_REF
npx.cmd supabase@latest functions deploy travel-services --project-ref YOUR_PROJECT_REF
```

The function's `verify_jwt=false` delegates verification to the handler. The handler calls Supabase Auth `/auth/v1/user` before any provider call and rejects invalid, expired, missing or anonymous sessions and unconfirmed email accounts. This uses Auth-server verification rather than the legacy gateway JWT verifier. Do not remove it. CORS is additional browser restriction, not authentication.

Configure Supabase email delivery and the sign-in email template to include OTP `{{ .Token }}`: the app accepts a code. Review Auth rate limits and CAPTCHA for release. Sessions remain in memory, so restarting requires signing in again; local plans/drafts persist independently.

Copy root `.env.example` to root `.env.local` if needed, then set only public app settings:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
EXPO_PUBLIC_TRAVEL_SERVICES_ENABLED=true
```

Enable the flag after deploying the function and migration. Restart Metro or rebuild the website/APK to include public settings. Never put Mistral, Geoapify, weather customer or service-role keys in `EXPO_PUBLIC_*`, GitHub or chat.

## PC and Android

```powershell
cd E:\maps
npm.cmd ci
npm.cmd run web -- --clear --port 8081
```

Open `http://localhost:8081`. In destination/start search, expand **Search beyond the catalog**, type at least three characters, sign in, and tap **Search online addresses**. Only search text is sent, not GPS. Address results do not become published community places.

Choose start, destination and transport. On the map open **Trip details → Check route and weather**. This sends ordered waypoints, including a captured start if selected, through the backend to Geoapify. The forecast sends the destination rounded to two decimal places to Open-Meteo. Private contribution drafts are excluded. Route and forecast failures are independent. An unsupported forecast date does not change the saved trip date.

In the assistant choose **Ask AI**, sign in and ask a question. **Examples** remains explicitly labelled and sends no request. A live failure never silently becomes a sample answer. Each question is independent; history is not sent. Questions and up to five server-selected public records go to Mistral. No private draft, photograph or captured location is included automatically. Avoid personal details in questions. Links come from canonical source records using validated place IDs, not model-generated URLs. Background links do not prove an AI statement is correct.

MapLibre requires an Android custom build, **not Expo Go**:

```powershell
cd E:\maps
npx.cmd eas-cli@latest login
npx.cmd eas-cli@latest build --platform android --profile preview
```

Install the resulting APK. Set the same **public** app variables in your EAS build environment first. Do not place server provider secrets in the app build environment. Preview APKs run without Metro. For development-client iteration:

```powershell
npx.cmd eas-cli@latest build --platform android --profile development
npm.cmd run start:dev-client -- --lan --clear
```

Use the installed development client and QR code on the same Wi-Fi. Phone website testing uses `http://YOUR_PC_IPV4:8081`; add that exact origin to staging `ALLOWED_APP_ORIGINS`. Production websites should use HTTPS. See [full run instructions](running.md).

## Behavior and limits

- Routes use Geoapify free-flow estimates, **not live traffic**. Ordered stops are included without optimization or a return leg. Legal entry, safe conditions, accessibility and final approaches need local confirmation.
- Limit: 12 waypoints, meaning start, destination and 10 optional stops. Excess stops produce an error rather than being silently discarded.
- Corridor results are catalog places near real returned geometry. Distance is approximate geographic separation, not a drivable detour estimate or access guarantee.
- Arrival labels combine road legs, suggested visits and the saved departure clock. They do not check opening hours. My plan remains its separate town-centre outing with illustrative travel estimates.
- Forecasts cover the destination in Asia/Kolkata, not every stop. The window is today plus six days. Verified prices, date-specific access and seasonal ranking remain unavailable.
- AI is instructed to use supplied public context and admit unknown facts. Output shape, source IDs and generated URLs are checked, but hallucinations remain possible. No browsing, bookings or automatic plan edits. Route/weather evidence is not yet passed into AI; it directs those questions to trip details.
- Each confirmed account has daily UTC caps: 20 AI, 100 search, 40 route and 40 weather attempts. Project caps: 100 AI and 1000 for each other action. Database locks make increments atomic across instances. Failed attempts count; quota/database failure blocks provider calls. Change limits with a deliberate migration and configure provider spending limits too.
- Counters store day/account/action/count, no questions or coordinates. Provider and hosted infrastructure logging/retention still apply. Update the public privacy policy before enabling real services. No custom body/prompt logging is added.
- No downloaded tiles, routing graph or offline rerouting. Returned routes/forecasts are temporary, not persisted offline resources. Local plans/catalog/drafts retain their existing offline behavior.
- No provider accounts or deployment are created by this implementation. No physical Android/iPhone test has been performed for these integrations.

## Validation

Implementation verification: TypeScript, lint, formatting and all 66 tests passed, including actual PostgreSQL quota and existing contribution-policy tests. Deno checked the function successfully. One real keyless prototype request for Dharwad returned daily temperature and rain probability in the expected Open-Meteo format on 4 November 2026. Geoapify/Mistral calls are covered by mocked contracts; no account keys or hosted Supabase project were available to establish live end-to-end results.

Expo dependency checks and final Android/web exports passed. Chrome screenshot inspection covered the light assistant at 520×1100, the dark trip-details fallback at 520×1200 and the dark assistant at 1440×1000. These showed wrapping controls and the honest unconfigured-service state without an error banner. Screenshots use the actual web export and an ignored local sample-town fixture, not live route or AI results. Chrome's narrower headless window cropped the initial 390-wide captures; those were replaced and do not establish a 390-unit layout check. Physical phone widths, larger text, keyboard interaction and native behavior still require device checks.

```powershell
npm.cmd run check
npm.cmd run check:dependencies
npm.cmd run build:android
npm.cmd run build:web
npx.cmd --yes deno@2 check supabase/functions/travel-services/index.ts
```

Focused tests cover input bounds, transport modes, waypoint order, route parsing and units, arrivals, forecast dates/coordinate rounding, commercial configuration, public-only AI context and source links, invalid/anonymous authentication, CORS, quota rejection, bounded reads, sanitized failures, corridor distances, and actual PostgreSQL quota permissions/limits. Fixtures do not establish live Karnataka road coverage or model answer quality.

After staging setup, record actual OTP delivery, expired sessions, all four travel modes, start=destination, multiple stops and changed settings, provider outages, forecast dates, unsupported AI questions, offline recovery, Android Back and large text. Android exports are JavaScript/assets, not APK or device proof. See [device checklist](development.md).
