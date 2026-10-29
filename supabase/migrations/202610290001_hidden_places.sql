-- Private submissions and public reviewed places are deliberately separate.
create table if not exists public.place_submissions (
  id uuid primary key,
  owner_id uuid not null references auth.users(id),
  name text not null check (char_length(name) between 3 and 100),
  locality text not null check (char_length(locality) between 1 and 150),
  description text not null check (char_length(description) between 30 and 3000),
  categories text[] not null check (cardinality(categories) between 1 and 5 and categories <@ array['nature','waterfalls','heritage','spiritual','activities']),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  accuracy_meters double precision check (accuracy_meters >= 0),
  captured_at timestamptz not null,
  location_source text not null check (location_source in ('gps','manual')),
  access text not null check (access in ('public','permission','unknown')),
  access_notes text not null default '' check (char_length(access_notes) <= 1500),
  sensitive_location boolean not null default false,
  location_confirmed boolean not null,
  photo_rights_confirmed boolean not null,
  sharing_consent boolean not null,
  photos jsonb not null check (jsonb_typeof(photos) = 'array' and jsonb_array_length(photos) between 1 and 5),
  status text not null default 'draft' check (status in ('draft','pending','approved','rejected')),
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists place_submissions_owner on public.place_submissions(owner_id);
alter table public.place_submissions enable row level security;
revoke all on public.place_submissions from anon, authenticated;
grant select, insert on public.place_submissions to authenticated;
grant update (name,locality,description,categories,latitude,longitude,accuracy_meters,captured_at,location_source,access,access_notes,sensitive_location,location_confirmed,photo_rights_confirmed,sharing_consent,photos,status) on public.place_submissions to authenticated;
create policy "contributors_read_own" on public.place_submissions for select to authenticated using (owner_id = (select auth.uid()));
create policy "contributors_create_draft" on public.place_submissions for insert to authenticated with check (owner_id = (select auth.uid()) and status = 'draft' and review_note is null);
create policy "contributors_edit_before_review" on public.place_submissions for update to authenticated
  using (owner_id = (select auth.uid()) and status in ('draft','rejected'))
  with check (owner_id = (select auth.uid()) and status in ('draft','pending'));

create table if not exists public.community_places (
  id uuid primary key references public.place_submissions(id),
  name text not null,
  locality text not null,
  description text not null,
  categories text[] not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  access_notes text not null,
  photos jsonb not null,
  credit text not null default 'Community contributor',
  reviewed_at timestamptz not null default now()
);
alter table public.community_places enable row level security;
revoke all on public.community_places from anon, authenticated;
grant select on public.community_places to anon, authenticated;
grant all on public.place_submissions, public.community_places to service_role;
create policy "read_reviewed_places" on public.community_places for select to anon, authenticated using (true);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('place-photos','place-photos',false,5242880,array['image/jpeg']) on conflict (id) do nothing;
create policy "read_own_or_reviewed_photos" on storage.objects for select to anon, authenticated using (
  bucket_id = 'place-photos' and (
    (storage.foldername(storage.objects.name))[1] = (select auth.uid())::text or exists (
      select 1 from public.community_places place, jsonb_array_elements(place.photos) photo where photo->>'path' = storage.objects.name
    )
  )
);
create policy "upload_draft_photos" on storage.objects for insert to authenticated with check (
  bucket_id = 'place-photos' and (storage.foldername(storage.objects.name))[1] = (select auth.uid())::text and exists (
    select 1 from public.place_submissions submission where submission.id::text = (storage.foldername(storage.objects.name))[2]
      and submission.owner_id = (select auth.uid()) and submission.status in ('draft','rejected')
  )
);
create policy "replace_draft_photos" on storage.objects for update to authenticated using (
  bucket_id = 'place-photos' and (storage.foldername(storage.objects.name))[1] = (select auth.uid())::text and exists (
    select 1 from public.place_submissions submission where submission.id::text = (storage.foldername(storage.objects.name))[2]
      and submission.owner_id = (select auth.uid()) and submission.status in ('draft','rejected')
  )
) with check (
  bucket_id = 'place-photos' and (storage.foldername(storage.objects.name))[1] = (select auth.uid())::text and exists (
    select 1 from public.place_submissions submission where submission.id::text = (storage.foldername(storage.objects.name))[2]
      and submission.owner_id = (select auth.uid()) and submission.status = 'draft'
  )
);

create or replace function public.check_place_submission() returns trigger language plpgsql security definer set search_path = '' as $$
declare photo jsonb;
begin
  new.updated_at := now();
  if new.status = 'pending' then
    if not (new.location_confirmed and new.photo_rights_confirmed and new.sharing_consent) then
      raise exception 'Confirm the place location, photo rights and private review consent';
    end if;
    for photo in select * from jsonb_array_elements(new.photos) loop
      if not (photo->>'path' like new.owner_id::text || '/' || new.id::text || '/%') or not exists (
        select 1 from storage.objects object where object.bucket_id = 'place-photos' and object.name = photo->>'path'
      ) then raise exception 'Upload every draft photo before submitting'; end if;
    end loop;
  end if;
  return new;
end; $$;
create trigger validate_place_submission before insert or update on public.place_submissions for each row execute function public.check_place_submission();

-- Only the project administrator/service role can invoke approval.
-- Public coordinates are explicitly chosen by the reviewer, never copied automatically.
create or replace function public.approve_place_submission(
  submission_id uuid, public_latitude double precision, public_longitude double precision,
  reviewed_description text, contributor_credit text default 'Community contributor'
) returns void language plpgsql security invoker set search_path = '' as $$
declare submission public.place_submissions;
begin
  select * into strict submission from public.place_submissions where id = submission_id and status = 'pending' for update;
  if char_length(reviewed_description) < 30 then raise exception 'Add a reviewed description'; end if;
  if submission.sensitive_location and abs(public_latitude - submission.latitude) < 0.005 and abs(public_longitude - submission.longitude) < 0.005 then
    raise exception 'Generalize the public location of a sensitive place or withhold publication';
  end if;
  insert into public.community_places(id,name,locality,description,categories,latitude,longitude,access_notes,photos,credit)
    values(submission.id,submission.name,submission.locality,reviewed_description,submission.categories,public_latitude,public_longitude,submission.access_notes,submission.photos,contributor_credit);
  update public.place_submissions set status = 'approved', review_note = 'Approved after review' where id = submission_id;
end; $$;
revoke all on function public.approve_place_submission(uuid,double precision,double precision,text,text) from public, anon, authenticated;
grant execute on function public.approve_place_submission(uuid,double precision,double precision,text,text) to service_role;
