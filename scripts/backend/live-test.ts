import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { createClient } from '@supabase/supabase-js';
import { publicConfigChecks, readBackendConfig } from './config';
import type { TravelAction, TravelRequests } from '../../src/services/travel/types';

const safeErrorCodes = new Set([
  'SIGN_IN_REQUIRED',
  'NOT_CONFIGURED',
  'RATE_LIMITED',
  'PROVIDER_BUSY',
  'FORECAST_DATE_UNAVAILABLE',
  'UNKNOWN_PLACE',
  'INVALID_REQUEST',
  'INVALID_DATA',
  'SERVICE_UNAVAILABLE',
  'PROVIDER_UNAVAILABLE',
  'ORIGIN_NOT_ALLOWED',
  'METHOD_NOT_ALLOWED',
]);

async function main() {
  if (!stdin.isTTY || !stdout.isTTY)
    throw new Error('Run this command in an interactive terminal. No email was sent.');
  const config = await readBackendConfig(process.cwd());
  if (
    publicConfigChecks(config)
      .slice(0, 3)
      .some((check) => !check.ok)
  )
    throw new Error('Configure the public Supabase URL/key first. Run backend:check.');
  const client = createClient(
    config.app.EXPO_PUBLIC_SUPABASE_URL!,
    config.app.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    },
  );
  const prompt = createInterface({ input: stdin, output: stdout });
  try {
    const email = (
      await prompt.question('Your test account email (sends one sign-in code): ')
    ).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new Error('Enter a valid email. No email was sent.');
    const sent = await client.auth.signInWithOtp({ email });
    if (sent.error)
      throw new Error(
        'Code could not be sent. Check email provider/template, SMTP restrictions and Auth rate limits.',
      );
    const token = (await prompt.question('Code from your email: ')).trim();
    const verified = await client.auth.verifyOtp({ email, token, type: 'email' });
    if (verified.error || !verified.data.session)
      throw new Error('Code verification failed. Check the code and expiry.');
    const session = verified.data.session;
    const user = await client.auth.getUser();
    if (user.error || !user.data.user?.email_confirmed_at)
      throw new Error('Confirmed account could not be verified.');
    console.log(
      'PASS · Email sign-in and server-verified confirmed account. Tokens are not printed or stored.',
    );
    const privateRows = await client.from('place_submissions').select('id').limit(0);
    if (privateRows.error)
      throw new Error(
        'Private submission table check failed. Apply migrations and check authenticated permissions.',
      );
    console.log(
      'PASS · Authenticated submission table access. No submission data printed or written.',
    );
    if (!process.argv.includes('--providers')) {
      console.log(
        'Provider calls skipped. To opt into one request per provider action, run backend:test -- --providers.',
      );
      return;
    }
    console.log(
      'Provider tests: one address search, one route, one forecast and one AI question. These consume quotas/credits.',
    );
    const approved = (
      await prompt.question('Type TEST to run these staging provider requests: ')
    ).trim();
    if (approved !== 'TEST') {
      console.log('Provider requests cancelled.');
      return;
    }
    const start = { latitude: 15.4589, longitude: 75.0078 };
    const end = { latitude: 15.3833, longitude: 75.1207 };
    const cases: { action: TravelAction; data: TravelRequests[TravelAction] }[] = [
      { action: 'search', data: { query: 'Dharwad Karnataka' } },
      { action: 'route', data: { points: [start, end], transport: 'car' } },
      { action: 'weather', data: { coordinates: end, date: '' } },
      {
        action: 'assistant',
        data: {
          question: 'What should I check before visiting this place?',
          area: 'Hubballi',
          placeIds: ['unkal-lake'],
        },
      },
    ];
    let failed = false;
    for (const item of cases) {
      try {
        const response = await fetch(
          `${config.app.EXPO_PUBLIC_SUPABASE_URL!.replace(/\/$/, '')}/functions/v1/travel-services`,
          {
            method: 'POST',
            redirect: 'error',
            signal: AbortSignal.timeout(45000),
            headers: {
              apikey: config.app.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
          },
        );
        const body = await response.json();
        const ok = response.ok && body?.data !== undefined;
        const code =
          typeof body?.error === 'string' && safeErrorCodes.has(body.error)
            ? body.error
            : 'See staging function logs';
        console.log(
          `${ok ? 'PASS' : 'FAIL'} · ${item.action}: HTTP ${response.status}${ok ? ', response received.' : `, ${code}.`}`,
        );
        failed ||= !ok;
      } catch {
        failed = true;
        console.log(`FAIL · ${item.action}: network request failed or timed out.`);
      }
    }
    if (failed) process.exitCode = 1;
  } finally {
    prompt.close();
    // Drop only this process's in-memory session; do not sign out other app/device sessions.
    await client.auth.signOut({ scope: 'local' }).catch(() => {});
  }
}
main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'Test failed. See docs/supabase-setup.md.',
  );
  process.exitCode = 1;
});
