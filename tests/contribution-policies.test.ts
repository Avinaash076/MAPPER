import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// Execute the actual migration against PostgreSQL. Auth and Storage tables below
// model the documented Supabase interfaces; they do not simulate image delivery.
test('PostgreSQL contribution policies enforce ownership and reviewed publication', async (t) => {
  const database = new PGlite();
  const owner = '11111111-1111-4111-8111-111111111111';
  const other = '22222222-2222-4222-8222-222222222222';
  const submission = '33333333-3333-4333-8333-333333333333';
  const sensitive = '44444444-4444-4444-8444-444444444444';
  const filename = '55555555-5555-4555-8555-555555555555.jpg';
  try {
    await database.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create schema storage;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(bucket_id text,name text,primary key(bucket_id,name));
      alter table storage.objects enable row level security;
      create function storage.foldername(value text) returns text[] language sql immutable as $$ select (string_to_array(value,'/'))[1:array_length(string_to_array(value,'/'),1)-1] $$;
      grant usage on schema public,auth,storage to anon,authenticated,service_role;
      grant select,insert,update on storage.objects to authenticated;
      grant select on storage.objects to anon;
    `);
    await database.exec(
      await readFile('supabase/migrations/202610290001_hidden_places.sql', 'utf8'),
    );
    await database.query('insert into auth.users(id) values ($1),($2)', [owner, other]);
    async function role(name: 'anon' | 'authenticated' | 'service_role', user = '') {
      await database.exec('reset role');
      await database.query("select set_config('request.jwt.claim.sub',$1,false)", [user]);
      await database.exec('set role ' + name);
    }
    async function addDraft(id: string, user: string, isSensitive = false) {
      const path = user + '/' + id + '/' + filename;
      await database.query(
        `insert into public.place_submissions(id,owner_id,name,locality,description,categories,latitude,longitude,captured_at,location_source,access,location_confirmed,photo_rights_confirmed,sharing_consent,photos,sensitive_location)
        values($1,$2,'Hidden river viewpoint','Near Dharwad','A quiet viewpoint with a short walking approach.',array['nature'],15.4,75.1,now(),'gps','unknown',true,true,true,$3::jsonb,$4)`,
        [id, user, JSON.stringify([{ path, caption: 'Viewpoint' }]), isSensitive],
      );
      return path;
    }
    await role('authenticated', owner);
    const path = await addDraft(submission, owner);

    await t.test(
      'contributors see their own draft but cannot impersonate another owner',
      async () => {
        assert.equal(
          (await database.query('select * from public.place_submissions')).rows.length,
          1,
        );
        await assert.rejects(addDraft(sensitive, other), /row-level security/i);
        await role('authenticated', other);
        assert.equal(
          (await database.query('select * from public.place_submissions')).rows.length,
          0,
        );
        await role('authenticated', owner);
      },
    );
    await t.test('contributors cannot approve themselves or write public places', async () => {
      await assert.rejects(
        database.query("update public.place_submissions set status='approved' where id=$1", [
          submission,
        ]),
        /row-level security/i,
      );
      await assert.rejects(
        database.query('select public.approve_place_submission($1,15.4,75.1,$2)', [
          submission,
          'A reviewed description of this quiet local place.',
        ]),
        /permission denied/i,
      );
      await assert.rejects(
        database.exec('insert into public.community_places(id) values (gen_random_uuid())'),
        /permission denied/i,
      );
    });
    await t.test(
      'all photos must exist before review; uploads stay inside the owner draft folder',
      async () => {
        await assert.rejects(
          database.query("update public.place_submissions set status='pending' where id=$1", [
            submission,
          ]),
          /Upload every draft photo/,
        );
        await assert.rejects(
          database.query("insert into storage.objects(bucket_id,name) values('place-photos',$1)", [
            other + '/' + submission + '/' + filename,
          ]),
          /row-level security/i,
        );
        await database.query(
          "insert into storage.objects(bucket_id,name) values('place-photos',$1)",
          [path],
        );
        await database.query("update public.place_submissions set status='pending' where id=$1", [
          submission,
        ]);
        assert.equal(
          (
            await database.query(
              "update public.place_submissions set name='Changed after submission' where id=$1 returning id",
              [submission],
            )
          ).rows.length,
          0,
        );
      },
    );
    await t.test('anonymous users cannot read private submissions or pending photos', async () => {
      await role('anon');
      await assert.rejects(
        database.exec('select latitude from public.place_submissions'),
        /permission denied/i,
      );
      assert.equal(
        (await database.exec('select * from public.community_places'))[0].rows.length,
        0,
      );
      assert.equal((await database.exec('select * from storage.objects'))[0].rows.length, 0);
    });
    await t.test(
      'admin approval publishes reviewed coordinates and permits approved-photo reads',
      async () => {
        await role('service_role');
        await database.query('select public.approve_place_submission($1,15.41,75.12,$2)', [
          submission,
          'A reviewed description of a local river viewpoint.',
        ]);
        await role('anon');
        const result = await database.query<{ latitude: number; longitude: number }>(
          'select * from public.community_places',
        );
        assert.equal(result.rows[0].latitude, 15.41);
        assert.equal(result.rows[0].longitude, 75.12);
        assert.ok(!('owner_id' in result.rows[0]));
        assert.ok(!('accuracy_meters' in result.rows[0]));
        assert.equal((await database.exec('select * from storage.objects'))[0].rows.length, 1);
      },
    );
    await t.test(
      'sensitive locations require generalized coordinates or withheld publication',
      async () => {
        await role('authenticated', owner);
        const path = await addDraft(sensitive, owner, true);
        await database.query(
          "insert into storage.objects(bucket_id,name) values('place-photos',$1)",
          [path],
        );
        await database.query("update public.place_submissions set status='pending' where id=$1", [
          sensitive,
        ]);
        await role('service_role');
        await assert.rejects(
          database.query('select public.approve_place_submission($1,15.4,75.1,$2)', [
            sensitive,
            'A reviewed sensitive location description for visitors.',
          ]),
          /Generalize/,
        );
        await database.query('select public.approve_place_submission($1,15.45,75.15,$2)', [
          sensitive,
          'An approximate location; contact local authorities for access.',
        ]);
      },
    );
  } finally {
    await database.close();
  }
});
