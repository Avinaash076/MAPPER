# Set up and test Supabase from Windows

Use a **hosted staging project plus the app on localhost** for the first test. The repository already contains the database, upload/auth code and Edge Function. You supply your Supabase project and public connection settings; server provider keys stay in your ignored server file.

This guide uses Supabase CLI **v3**, checked against CLI 3.0.0 on 4 November 2026. In v3, database commands default to a local stack: **include `--remote` for the hosted database**. Functions and secrets target the linked hosted project. See the official [v3 migration guide](https://supabase.com/docs/guides/local-development/cli/migrating-to-v3).

## Test only provider keys without Supabase

You can skip Supabase entirely for a first key check. Save Geoapify/Mistral keys, `MISTRAL_MODEL=mistral-small-latest` and `OPEN_METEO_MODE=prototype` in your existing `supabase/functions/.env`. Leave `OPEN_METEO_API_KEY` blank for prototype mode. Then run:

```powershell
cd E:\maps
npm.cmd run keys:check
```

This Node-only helper checks providers directly using one Geoapify address request, a Mistral model lookup and an Open-Meteo forecast request. It requires internet, but no Supabase project, migrations, sign-in, deployment or `EXPO_PUBLIC_TRAVEL_SERVICES_ENABLED=true`. Keys and raw responses are hidden. The default Mistral check validates access to the selected chat model; it does not generate an answer. [Mistral model lookup contract](https://docs.mistral.ai/api/endpoint/models).

To explicitly test a real sample Mistral answer instead of model lookup:

```powershell
npm.cmd run keys:check -- --chat
```

The chat option makes a real completion request and consumes AI credits/quota. Geoapify/forecast requests also use their provider allowances. These direct checks bypass the app's database quotas and use only a public sample place. Do not run them repeatedly. They do not validate road routing, hosted Auth/CORS/quotas or the mobile UI. To use the online features **inside the app**, follow the Supabase setup below. The app keeps its backend boundary and never bundles provider keys.

Local-check implementation verification on 5 November 2026: all 74 tests, TypeScript, lint and formatting passed. Mocked tests cover provider-only endpoints, no default chat generation, rejected keys/quotas, redacted errors and the explicit sample-chat path. The help command was run without making requests. The owner's real keys were not used for live checks during implementation; run the command yourself to establish your account's actual results.

## 1. Create your staging project

Create a project such as `mapper-staging` in your account at [Supabase](https://supabase.com/dashboard). Save the database password privately; the CLI may ask for it. Wait for the project to be ready.

Find these in the project's connection/API-key settings:

| Value                                                                            | Used for                               |
| -------------------------------------------------------------------------------- | -------------------------------------- |
| Project URL, such as `https://abcdefghijklmnopqrst.supabase.co`                  | Root app environment                   |
| Publishable key, starting `sb_publishable_`                                      | Root app environment; public by design |
| Project reference, such as `abcdefghijklmnopqrst` from the dashboard project URL | Linking the CLI to this project        |

Do not use a secret/service-role key as the app's publishable key. Supabase protects public clients with row-level security, not secrecy of the public key. [API-key guidance](https://supabase.com/docs/guides/getting-started/api-keys).

## 2. Prepare your files without overwriting keys

```powershell
cd E:\maps
npm.cmd run backend:setup
```

This creates missing `.env.local` files from templates. If `.env` or `.env.local` already exists in either location, it preserves it and does not create a blank file that would shadow it. Your existing `supabase/functions/.env` is supported. No values are printed, uploaded or changed by this command.

Edit root `E:\maps\.env.local`:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
EXPO_PUBLIC_TRAVEL_SERVICES_ENABLED=false
```

Keep the switch false until the backend is deployed. In your existing `E:\maps\supabase\functions\.env`, keep:

```dotenv
GEOAPIFY_API_KEY=YOUR_PRIVATE_GEOAPIFY_KEY
MISTRAL_API_KEY=YOUR_PRIVATE_MISTRAL_KEY
MISTRAL_MODEL=mistral-small-latest
OPEN_METEO_MODE=prototype
OPEN_METEO_API_KEY=
ALLOWED_APP_ORIGINS=http://localhost:8081,http://127.0.0.1:8081
```

Prototype weather requires no key and is for non-commercial evaluation. Save editor changes with Ctrl+S. The two real environment files are ignored by Git; `.env.example` files must contain placeholders only. Provider secrets never belong in `EXPO_PUBLIC_*`. The server file is read when uploaded/served explicitly, not automatically by the Expo app.

## 3. Configure email codes

In the hosted project's Authentication settings:

1. Enable the Email provider and allow new email users for this staging test. Keep email confirmation enabled.
2. In email templates, update **Magic Link** and **Confirm signup** to include a code. Copy `supabase/templates/sign-in-code.html`, or use:

```html
<h2>Your MAPPER sign-in code</h2>
<p>Enter this code in MAPPER: <strong>{{ .Token }}</strong></p>
```

3. Set the site URL to `http://localhost:8081` for the web staging test. This flow enters codes directly rather than opening a magic-link callback.
4. For the first delivery test, use the email associated with your project's authorized organization team. Supabase's built-in sender restricts recipients and has low delivery limits. To test other users, configure custom SMTP in Supabase. This is a Supabase Auth setting; SMTP passwords are not app environment variables. [SMTP restrictions](https://supabase.com/docs/guides/auth/auth-smtp).

The app's existing `signInWithOtp` + `verifyOtp` flow accepts the email code. The template change is required because Supabase otherwise sends a magic link. Wait before requesting repeated codes and use the newest code. [Email OTP documentation](https://supabase.com/docs/guides/auth/auth-email-passwordless).

`supabase/config.toml` and the bundled template configure the **local Docker stack**. Merely deploying the travel function does not apply those Auth settings to a hosted project; configure the hosted settings above separately.

## 4. Link and apply the database migrations

CLI login identifies you as the project owner; it is different from an app user's email-code sign-in.

```powershell
cd E:\maps
npx.cmd supabase@3 login
npx.cmd supabase@3 link YOUR_PROJECT_REF
npx.cmd supabase@3 db push --dry-run --remote
```

Review the intended project and migrations. For a new staging project, expect these files:

- `202610290001_hidden_places.sql`: private submissions, public reviewed places, the private photo bucket, policies and administrator review function.
- `202611040001_travel_service_limits.sql`: private quota counters and a service-only quota function.

Apply after reviewing the dry run:

```powershell
npx.cmd supabase@3 db push --remote
```

Confirm the CLI prompt deliberately. Do not run `db reset` against the hosted project or manually reapply migrations already in its history. If you previously created these tables manually in SQL Editor, reconcile migration history before pushing rather than deleting tables to fix an error.

In the dashboard verify that `place_submissions`, `community_places` and `travel_service_usage` exist and have RLS enabled. In Storage verify `place-photos` is **private**, JPEG-only and limited to 5 MB per file. An empty `community_places` table is normal until a real contribution is reviewed.

## 5. Upload secrets and deploy the function

Your current server filename is `.env`, so use that exact path:

```powershell
npx.cmd supabase@3 secrets set --env-file supabase/functions/.env
npx.cmd supabase@3 functions deploy travel-services --use-api
```

Both commands target the linked hosted project and ask for confirmation. `--use-api` bundles through the API, avoiding a Docker requirement for this hosted deployment path. If you use `.env.local` instead, change only the `--env-file` path. Neither command uploads your root app `.env.local`.

Supabase supplies the function's own URL and Auth/service-role settings. The handler verifies confirmed user sessions and applies database quotas before provider calls. Keep its authentication checks in place. Do not run `config push` as a substitute for understanding hosted Auth settings.

## 6. Check configuration and remote connectivity

Change root `EXPO_PUBLIC_TRAVEL_SERVICES_ENABLED=true`, then run:

```powershell
npm.cmd run backend:check
npm.cmd run backend:check -- --online
```

The first command checks local configuration presence/types only. It never prints keys or makes network calls. The second additionally makes safe connection probes:

| Probe                            | Expected                                        |
| -------------------------------- | ----------------------------------------------- |
| Public catalog table             | HTTP 200, even when no approved places exist    |
| Anonymous private submissions    | HTTP 401/403; access blocked                    |
| Anonymous quota table            | HTTP 401/403; access blocked                    |
| Function OPTIONS with app origin | HTTP 204 and the exact CORS allow-origin header |
| Function without user sign-in    | HTTP 401; rejection is a successful check       |

The function probe uses an unknown diagnostic action so it cannot request routes, forecasts or AI. No email, submissions or paid provider requests are sent by `backend:check`. These probes are a staging smoke check, not proof of every owner-isolation rule. PostgreSQL policy tests separately exercise those rules.

For a different browser origin, add it to the server file, re-upload secrets, then:

```powershell
npm.cmd run backend:check -- --online --origin http://localhost:8082
```

The origin includes scheme and port, without a trailing slash.

## 7. Test actual sign-in and providers

Choose one terminal test below, or skip directly to the app test in step 8. The built-in SMTP sender currently permits only two messages per hour; running both terminal variants and then requesting another app code can exhaust that limit. Use custom SMTP for repeated testing or wait for your project's delivery limits to reset. A single app sign-in is shared across its screens.

Run this yourself in an interactive terminal:

```powershell
npm.cmd run backend:test
```

It asks for your test email, sends one code, asks you to enter it, verifies the account with Supabase and checks authenticated access to the submission table. It does not write a place/photo or print/store tokens. A new email can create an Auth account through the normal signup flow. The script drops its own session on completion without signing out your other app sessions. It does not solve CAPTCHA challenges; use the app flow when your staging Auth requires one.

To additionally opt into one address search, one car route, one destination forecast and one Mistral question:

```powershell
npm.cmd run backend:test -- --providers
```

This asks for confirmation before making the four provider requests. They consume provider credits and daily app quotas. They use public town/place coordinates and a generic Unkal Lake question, not private contribution data. Each action prints PASS/FAIL and a safe error code; answer content, tokens and keys are not printed. A successful response does not verify road access or AI factual accuracy. If you just used an OTP, allow the configured resend interval before starting another run.

## 8. Run and test the app

```powershell
npm.cmd run web -- --clear --port 8081
```

Open `http://localhost:8081`. Restart Metro after changing public app settings; changing a server secret requires uploading it, not merely restarting Metro.

| Test                                                                            | Expected result                                                                               |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Destination → Search beyond the catalog → sign in → search Dharwad              | Online address results, or a useful service error                                             |
| Destination/start/transport → trip map → Trip details → Check route and weather | Real route/forecast results labelled with source and fetch time                               |
| Repeat for walking, bicycle, motorbike and car                                  | Mode-specific provider requests; check real-world pilot routes separately                     |
| Change stops, transport or destination                                          | Old mismatched results disappear; request the new trip explicitly                             |
| Assistant → Ask AI → ask about Unkal Lake                                       | Live Mistral label; background references; unknown conditions admitted                        |
| Assistant → Examples                                                            | Explicit samples, no provider request                                                         |
| Discover → Know a place we've missed? → create a draft with your own test photo | Local draft saves privately                                                                   |
| Complete fields and consent → sign in → Send for review                         | Own server submission becomes pending; photo exists in private bucket                         |
| Sign out or use a second account                                                | Pending submission/photo is not exposed to that account or public discovery                   |
| Administrator reviews a real contribution                                       | Publish only through the documented review workflow with explicitly chosen public coordinates |
| Turn internet off                                                               | Local browsing/plans/drafts work; online services fail clearly without fabricated results     |

Do not approve synthetic test places into public discovery. There is no public administrator UI; follow [the reviewer workflow](hidden-places.md). Deleting a local draft is not a remote deletion/withdrawal feature. Use a staging project for test submissions and manage any remote cleanup deliberately in the dashboard.

For Android, start with the same hosted backend. Configure public variables in your custom development/preview build and follow [Android run instructions](running.md). MapLibre does not run in Expo Go. `localhost` on a phone refers to that phone; using a hosted Supabase URL avoids that networking issue. Phone web preview uses `http://YOUR_PC_IPV4:8081` on the same Wi-Fi and needs that exact origin in server CORS settings.

## Optional: a fully local backend later

Windows needs a Docker-compatible runtime such as Docker Desktop for the supported local stack. [Local development requirements](https://supabase.com/docs/guides/local-development). This is separate from the recommended hosted staging path.

```powershell
cd E:\maps
npx.cmd supabase@3 start
npx.cmd supabase@3 db push
npx.cmd supabase@3 status
```

Without `--remote`, the migration push targets only the local stack. Use the local API URL and public/anon key shown by `status` in root `.env.local`; do not paste the status output into chat because it can include privileged local credentials. Confirmed email codes appear in the local email inbox whose URL is printed by the CLI. The repository's local templates include the code for both initial signup and later sign-in.

Serve the function in another terminal:

```powershell
npx.cmd supabase@3 functions serve --env-file supabase/functions/.env
```

Then run the same check/test commands against the configured local URL. Native phones/emulators need a reachable PC/LAN address rather than PC `127.0.0.1`, plus the appropriate local firewall/network configuration. Real Geoapify/Mistral/Open-Meteo calls still require internet even when Supabase itself is local. No Docker stack or physical phone test is claimed by the implementation of these helpers.

## Troubleshooting and implementation review

| Symptom                            | Check                                                                                           |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| No code email                      | Team-authorized recipient or custom SMTP, correct templates, spam folder and Auth rate limits   |
| Email contains only a link         | Add `{{ .Token }}` to Magic Link and Confirm signup templates                                   |
| Public table missing / PGRST error | Migrations applied to the intended hosted project using `--remote`                              |
| `NOT_CONFIGURED`                   | Server secret upload, model setting and deployed function; local presence alone is insufficient |
| `SIGN_IN_REQUIRED`                 | Sign in again; sessions are memory-only and the function requires confirmed accounts            |
| Function 403 in browser            | Exact origin/port in uploaded `ALLOWED_APP_ORIGINS`                                             |
| Function 404                       | Deploy `travel-services` to the same project used by the app URL                                |
| `RATE_LIMITED` / `PROVIDER_BUSY`   | Daily app quota or upstream account limits; repeated retries consume attempts                   |
| AI model unavailable               | Confirm model access in your Mistral account; change the server setting explicitly              |
| App still shows old configuration  | Stop Metro, restart with `--clear`; installed APK public settings require a rebuild             |

Setup code is in `scripts/backend/`. It uses existing dependencies, preserves both supported environment filenames, rejects admin keys in public client configuration and redacts values. Remote diagnostics inspect response status/CORS only and cancel response bodies. Tests cover non-overwriting setup, environment parsing/redaction, public-key validation, prototype weather, origin checks and safe remote probe behavior. Hosted SMTP delivery, deployed providers, real uploads and device behavior require the actual steps above; mocked checks are not those results.

Verification on 4 November 2026: TypeScript, lint, formatting, all 71 tests (including existing PostgreSQL contribution/quota tests), Expo dependency checks and Android/web exports passed. Setup was run twice: it created the missing root `.env.local`, then preserved both existing files, including the user's server `.env`. The local diagnostic found provider settings present but the root Supabase URL/public key absent; its online phase correctly skipped all requests. No hosted migration, deployment, OTP email, provider smoke test or Docker-stack/device test was performed in this setup change. CLI v3.0.0 command help was inspected for link, database push, secrets, deployment and local function serving.
