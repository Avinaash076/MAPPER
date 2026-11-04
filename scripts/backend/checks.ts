import type { BackendConfig, SetupCheck } from './config';

async function probe(
  config: BackendConfig,
  route: string,
  init: RequestInit,
  fetcher: typeof fetch,
): Promise<Response> {
  const url = config.app.EXPO_PUBLIC_SUPABASE_URL!.replace(/\/$/, '') + route;
  const headers = new Headers(init.headers);
  headers.set('apikey', config.app.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  const response = await fetcher(url, {
    ...init,
    redirect: 'error',
    signal: AbortSignal.timeout(15000),
    headers,
  });
  await response.body?.cancel();
  return response;
}
export async function checkRemoteBackend(
  config: BackendConfig,
  origin = 'http://localhost:8081',
  fetcher: typeof fetch = fetch,
): Promise<SetupCheck[]> {
  const checks: SetupCheck[] = [];
  async function check(
    name: string,
    run: () => Promise<Response>,
    expected: number[],
    detail: string,
    requiredOrigin?: string,
  ) {
    try {
      const response = await run();
      const cors =
        !requiredOrigin || response.headers.get('Access-Control-Allow-Origin') === requiredOrigin;
      checks.push({
        name,
        ok: expected.includes(response.status) && cors,
        detail: `HTTP ${response.status}. ${detail}${cors ? '' : ' Missing or incorrect CORS origin header.'}`,
      });
    } catch {
      checks.push({
        name,
        ok: false,
        detail: 'Connection failed or timed out. Check project status, URL and network.',
      });
    }
  }
  await check(
    'Public catalog table',
    () => probe(config, '/rest/v1/community_places?select=id&limit=0', {}, fetcher),
    [200],
    'An empty catalog is valid. A missing table needs migrations.',
  );
  await check(
    'Anonymous private submission access blocked',
    () => probe(config, '/rest/v1/place_submissions?select=id&limit=0', {}, fetcher),
    [401, 403],
    'Anonymous clients must not read private submissions.',
  );
  await check(
    'Anonymous quota access blocked',
    () => probe(config, '/rest/v1/travel_service_usage?select=scope&limit=0', {}, fetcher),
    [401, 403],
    'Quota counters must stay server-only.',
  );
  await check(
    'Function accepts the app origin',
    () =>
      probe(
        config,
        '/functions/v1/travel-services',
        { method: 'OPTIONS', headers: { Origin: origin } },
        fetcher,
      ),
    [204],
    '403 means the exact origin is not allowed; 404 means the function is missing.',
    origin,
  );
  await check(
    'Function requires sign-in',
    () =>
      probe(
        config,
        '/functions/v1/travel-services',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Origin: origin },
          body: JSON.stringify({ action: 'diagnostic-auth-check', data: {} }),
        },
        fetcher,
      ),
    [401],
    'A 401 is expected here. This unknown action cannot invoke a paid provider.',
  );
  return checks;
}
