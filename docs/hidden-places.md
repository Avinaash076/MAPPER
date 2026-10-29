# Hidden places: drafts, photos and reviewed publication

## The user flow

Open Discover and tap the plus icon or **Know a hidden place? Share it**. Create a private draft, capture the location, then finish photos and the description now or later. Incomplete drafts are allowed. Edits are queued into local storage immediately; wait for **Saved privately on this device** before closing the app.

Location permission is requested only after **Use my current location**. There is no background tracking. Coordinates, capture time and the reported GPS accuracy are saved. A 20-second timeout offers manual entry when a fix cannot be obtained. A low-accuracy fix is labelled; it is not silently treated as precise. Users confirm that coordinates identify the place, rather than their current position somewhere else.

Up to five photos can be selected or captured. The app resizes and re-encodes them as JPEGs, then copies them into app-owned document storage on native devices. The website stores image blobs in IndexedDB. Captions are optional. Draft metadata contains image references, not base64 image payloads. Removing a photo removes its copied asset after the metadata write succeeds. Uninstalling the app or clearing website data removes local drafts; they are not an account backup.

## What a useful contribution contains

- The place name and nearest village, town or area.
- Coordinates marking the actual place, with an accuracy check.
- A short original description: what is interesting and what a visitor can do.
- An appropriate category, such as nature, waterfalls, heritage, spiritual or activities.
- Useful photos: an overview and, where helpful, the approach or entrance.
- Access information: public access, permission required or not yet known.
- Seasonal or approach notes, such as a final walking stretch or changing water levels.
- Permission to share the photos and consent to send location and content for private review.

Do not invent opening hours, prices or access guarantees. A hidden place may be on private land, in a fragile habitat or culturally restricted. The extra-care flag asks reviewers to withhold or generalize its public position. Avoid publishing identifiable people, private addresses or sensitive details without appropriate permission. Review image metadata and visible landmarks as well as the written coordinates.

The app suggests existing places within 250 metres as potential duplicates. This is advisory: two different features can be close together.

## What works without a backend

Private drafts, location capture when the device can obtain a fix, photo attachment, captions and descriptions work without community-service configuration. Network connectivity is needed for email sign-in and remote submission. No automatic background upload is claimed. The user explicitly sends a completed draft and can retry a failed upload.

## Connect reviewed sharing

The implementation uses Supabase Auth, a private photo bucket and PostgreSQL row-level security. No hosted project has been created or deployed by this change.

1. Create a project in the owner's Supabase account.
2. Apply `supabase/migrations/202610290001_hidden_places.sql` once through the project SQL editor or your migration workflow. Check that the `place-photos` bucket is private, permits JPEGs and has a 5 MB file limit.
3. Enable email authentication. Configure the email sign-in template to include `{{ .Token }}` so the app's code-entry flow can be used. Configure email delivery and applicable rate limits for your environment.
4. Copy `.env.example` to an ignored `.env.local`. Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
5. Restart Expo so the public client configuration is included in the build.

The publishable key is intended for clients. Never use a service-role key, database password or AI key in an `EXPO_PUBLIC_` variable. Sessions are kept in memory, so signing in again may be necessary after restarting; local drafting does not require a login.

## Submission and retry behavior

The client sends metadata into an owner-only server draft, uploads each photo under the authenticated owner's draft folder, and changes status to pending only after uploads succeed. Stable draft IDs and deterministic photo paths make retries idempotent. A pending or approved submission is not edited by retrying a lost response. A rejected contribution can be corrected and resubmitted.

Public discovery reads only `community_places`. It never reads private submissions. Approved photo URLs are signed and expire after an hour; cached public photo URLs are not a guaranteed offline photo download.

Use **Refresh review status** after signing in to update local pending/approved/rejected labels. Local private drafts are not automatically synchronized across devices.

## Reviewer workflow

There is no public admin screen in this milestone. The project owner reviews submissions in the Supabase dashboard/SQL editor using administrator access.

Inspect the story, duplicate suggestions, actual access, image rights, visible private information and photo metadata. Correct private access notes if necessary. Choose the public coordinates explicitly; the original captured coordinates are never copied into a public row automatically.

After review, an administrator can call:

```sql
select public.approve_place_submission(
  'SUBMISSION_UUID'::uuid,
  15.45, -- reviewer-chosen public latitude
  75.15, -- reviewer-chosen public longitude
  'A reviewed description of at least thirty characters.',
  'Community contributor'
);
```

The coordinates above are examples, not instructions for a real place. Sensitive submissions cannot be approved within 0.005 degrees of both original coordinates; withhold publication if approximate disclosure is still inappropriate.

To request corrections:

```sql
update public.place_submissions
set status = 'rejected', review_note = 'Please clarify access and add a wider overview photo.'
where id = 'SUBMISSION_UUID'::uuid and status = 'pending';
```

Only an administrator/service role can approve. Contributors cannot write public place records or assign approval. Pending photos are readable only by their owner. Reviewers should verify the private bucket settings and server-side media handling before enabling production uploads.

## Validation and limits

Automated tests execute the actual migration in a local PostgreSQL engine with Supabase Auth/Storage interface fixtures. They check owner isolation, denied self-approval, private pending photos, completed uploads before submission, reviewed coordinates and sensitive-location handling. These are database-policy tests, not a hosted Supabase upload test.

Still required before public release: end-to-end email/upload testing in the configured project, actual phone permission tests, moderation operations, withdrawal/reporting flows, retention decisions and production media validation. AI is not used to approve a hidden place.

Official references: [React Native Auth](https://supabase.com/docs/guides/auth/quickstarts/react-native), [row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security), [private storage policies](https://supabase.com/docs/guides/storage/security/access-control).
