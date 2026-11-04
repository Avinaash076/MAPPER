import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseEnv } from 'node:util';
import { Buffer } from 'node:buffer';

export interface BackendConfig {
  app: Record<string, string | undefined>;
  server: Record<string, string | undefined>;
  serverFile: string;
}
export interface SetupCheck {
  name: string;
  ok: boolean;
  detail: string;
}
async function readEnv(file: string): Promise<Record<string, string | undefined>> {
  if (!existsSync(file)) return {};
  try {
    return parseEnv(await readFile(file, 'utf8'));
  } catch {
    throw new Error('An environment file could not be read. Check its permissions and syntax.');
  }
}
export async function readBackendConfig(
  root: string,
  environment: Record<string, string | undefined> = process.env,
): Promise<BackendConfig> {
  const serverFile = existsSync(path.join(root, 'supabase/functions/.env.local'))
    ? 'supabase/functions/.env.local'
    : 'supabase/functions/.env';
  return {
    app: {
      ...(await readEnv(path.join(root, '.env'))),
      ...(await readEnv(path.join(root, '.env.local'))),
      ...environment,
    },
    server: await readEnv(path.join(root, serverFile)),
    serverFile,
  };
}
export async function prepareBackendFiles(root: string): Promise<string[]> {
  const reports: string[] = [];
  for (const folder of ['', 'supabase/functions']) {
    const base = path.join(root, folder);
    if (existsSync(path.join(base, '.env')) || existsSync(path.join(base, '.env.local'))) {
      reports.push(`${folder || 'App'}: kept existing environment files.`);
      continue;
    }
    await writeFile(
      path.join(base, '.env.local'),
      await readFile(path.join(base, '.env.example')),
      { flag: 'wx' },
    );
    reports.push(`${folder || 'App'}: created .env.local from the public template.`);
  }
  return reports;
}
export function publicConfigChecks(config: BackendConfig): SetupCheck[] {
  let validUrl = false;
  try {
    const url = new URL(config.app.EXPO_PUBLIC_SUPABASE_URL ?? '');
    validUrl =
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      !/your_/i.test(url.hostname) &&
      (url.pathname === '/' || url.pathname === '');
  } catch {}
  const key = config.app.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
  let publicKey = key.startsWith('sb_publishable_');
  if (!publicKey && key.split('.').length === 3) {
    try {
      publicKey =
        JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role === 'anon';
    } catch {}
  }
  const unsafe = Object.entries(config.app).some(
    ([name, value]) =>
      Boolean(value) &&
      /^EXPO_PUBLIC_.*(MISTRAL|GEOAPIFY|SERVICE_ROLE|SECRET_KEY|OPEN_METEO_API_KEY)/.test(name),
  );
  return [
    {
      name: 'Supabase URL',
      ok: validUrl,
      detail: validUrl ? 'Set; value hidden.' : 'Set a project URL in root .env.local.',
    },
    {
      name: 'Public publishable key',
      ok: publicKey,
      detail: publicKey
        ? 'Public client key detected; value hidden.'
        : 'Use a publishable key or legacy anon key, never a secret/service-role key.',
    },
    {
      name: 'No provider secrets in public variables',
      ok: !unsafe,
      detail: unsafe
        ? 'Move provider/admin secrets to the server environment file.'
        : 'No known secret variable names found.',
    },
    {
      name: 'Online services switch',
      ok: config.app.EXPO_PUBLIC_TRAVEL_SERVICES_ENABLED === 'true',
      detail: 'Enable EXPO_PUBLIC_TRAVEL_SERVICES_ENABLED=true after backend deployment.',
    },
  ];
}
export function serverConfigChecks(
  config: BackendConfig,
  origin = 'http://localhost:8081',
): SetupCheck[] {
  return [
    ...['GEOAPIFY_API_KEY', 'MISTRAL_API_KEY', 'MISTRAL_MODEL'].map((name) => ({
      name,
      ok: Boolean(config.server[name]?.trim()),
      detail: 'Server setting presence only; value hidden and remote upload not verified.',
    })),
    {
      name: 'Open-Meteo mode',
      ok:
        config.server.OPEN_METEO_MODE === 'prototype' ||
        (config.server.OPEN_METEO_MODE === 'commercial' &&
          Boolean(config.server.OPEN_METEO_API_KEY)),
      detail: 'Prototype needs no key; commercial requires a subscribed server key.',
    },
    {
      name: 'Browser origin',
      ok: (config.server.ALLOWED_APP_ORIGINS ?? '')
        .split(',')
        .map((value) => value.trim())
        .includes(origin),
      detail:
        'Include the exact app origin in ALLOWED_APP_ORIGINS. Default: http://localhost:8081.',
    },
  ];
}
