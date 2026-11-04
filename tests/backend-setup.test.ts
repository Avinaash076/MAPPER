import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Buffer } from 'node:buffer';
import {
  prepareBackendFiles,
  publicConfigChecks,
  readBackendConfig,
  serverConfigChecks,
  type BackendConfig,
} from '../scripts/backend/config';
import { checkRemoteBackend } from '../scripts/backend/checks';

const valid: BackendConfig = {
  app: {
    EXPO_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
    EXPO_PUBLIC_TRAVEL_SERVICES_ENABLED: 'true',
  },
  server: {
    GEOAPIFY_API_KEY: 'test-geo-secret',
    MISTRAL_API_KEY: 'test-ai-secret',
    MISTRAL_MODEL: 'mistral-small-latest',
    OPEN_METEO_MODE: 'prototype',
    ALLOWED_APP_ORIGINS: 'http://localhost:8081',
  },
  serverFile: 'supabase/functions/.env',
};

test('setup preserves existing env files and does not create a blank file that shadows server keys', async () => {
  const tools = path.resolve('.tools');
  await mkdir(tools, { recursive: true });
  const root = await mkdtemp(path.join(tools, 'backend-setup-test-'));
  try {
    await mkdir(path.join(root, 'supabase/functions'), { recursive: true });
    await writeFile(path.join(root, '.env.example'), 'EXPO_PUBLIC_SUPABASE_URL=\n');
    await writeFile(path.join(root, 'supabase/functions/.env.example'), 'MISTRAL_API_KEY=\n');
    const original = 'MISTRAL_API_KEY="keep-this-test-value"\n';
    await writeFile(path.join(root, 'supabase/functions/.env'), original);
    await prepareBackendFiles(root);
    assert.equal(await readFile(path.join(root, 'supabase/functions/.env'), 'utf8'), original);
    await assert.rejects(readFile(path.join(root, 'supabase/functions/.env.local')), /ENOENT/);
    await writeFile(
      path.join(root, '.env.local'),
      'EXPO_PUBLIC_SUPABASE_URL=https://saved.supabase.co\n',
    );
    await prepareBackendFiles(root);
    const config = await readBackendConfig(root, {});
    assert.equal(config.app.EXPO_PUBLIC_SUPABASE_URL, 'https://saved.supabase.co');
    assert.equal(config.serverFile, 'supabase/functions/.env');
    assert.equal(config.server.MISTRAL_API_KEY, 'keep-this-test-value');
    const report = JSON.stringify([...publicConfigChecks(config), ...serverConfigChecks(config)]);
    assert.equal(report.includes('keep-this-test-value'), false);
  } finally {
    // This directory was created above; verify its absolute scope before deleting test files.
    if (path.dirname(root) !== tools || !path.basename(root).startsWith('backend-setup-test-'))
      throw new Error('Unexpected test cleanup path');
    await rm(root, { recursive: true, force: true });
  }
});

test('public config refuses admin keys, credential-bearing URLs and exposed provider secrets', () => {
  assert.ok(publicConfigChecks(valid).every((check) => check.ok));
  const unsafe = {
    ...valid,
    app: {
      ...valid.app,
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_do-not-use',
      EXPO_PUBLIC_MISTRAL_API_KEY: 'never-print',
    },
  };
  const checks = publicConfigChecks(unsafe);
  assert.equal(checks[1].ok, false);
  assert.equal(checks[2].ok, false);
  assert.equal(JSON.stringify(checks).includes('never-print'), false);
  const jwt = `header.${Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url')}.signature`;
  assert.equal(
    publicConfigChecks({
      ...valid,
      app: { ...valid.app, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: jwt },
    })[1].ok,
    false,
  );
  assert.equal(
    publicConfigChecks({
      ...valid,
      app: { ...valid.app, EXPO_PUBLIC_SUPABASE_URL: 'https://user:password@project.supabase.co' },
    })[0].ok,
    false,
  );
});

test('prototype weather needs no key and custom origins are checked exactly', () => {
  assert.ok(serverConfigChecks(valid).every((check) => check.ok));
  const commercial = { ...valid, server: { ...valid.server, OPEN_METEO_MODE: 'commercial' } };
  assert.equal(
    serverConfigChecks(commercial).find((check) => check.name === 'Open-Meteo mode')?.ok,
    false,
  );
  assert.equal(serverConfigChecks(valid, 'http://localhost:8082').at(-1)?.ok, false);
});

test('remote diagnostics use no user token, send no email and cannot invoke a paid provider action', async () => {
  const calls: string[] = [];
  const checks = await checkRemoteBackend(valid, 'http://localhost:8081', async (input, init) => {
    const url = new URL(String(input));
    calls.push(url.pathname);
    const headers = new Headers(init?.headers);
    assert.equal(headers.get('Authorization'), null);
    assert.equal(headers.get('apikey'), 'sb_publishable_test');
    assert.equal(url.pathname.startsWith('/auth/'), false);
    if (url.pathname.includes('community_places')) return new Response('[]', { status: 200 });
    if (url.pathname.startsWith('/rest/')) return new Response(null, { status: 403 });
    if (init?.method === 'OPTIONS')
      return new Response(null, {
        status: 204,
        headers: { 'Access-Control-Allow-Origin': 'http://localhost:8081' },
      });
    assert.deepEqual(JSON.parse(String(init?.body)), { action: 'diagnostic-auth-check', data: {} });
    return new Response(null, { status: 401 });
  });
  assert.equal(calls.length, 5);
  assert.ok(checks.every((check) => check.ok));
});

test('diagnostics flag public private-table access and reject a 204 without the CORS header', async () => {
  const checks = await checkRemoteBackend(
    valid,
    undefined,
    async (_input, init) => new Response(null, { status: init?.method === 'OPTIONS' ? 204 : 200 }),
  );
  assert.equal(checks[0].ok, true);
  assert.equal(checks[1].ok, false);
  assert.equal(checks[2].ok, false);
  assert.equal(checks[3].ok, false);
  assert.equal(checks[4].ok, false);
});
