import { seedPlaces } from '../../../src/features/places/seedPlaces.ts';
import type { TravelAction } from '../../../src/services/travel/types.ts';
import { askMistral, type PublicPlaceContext } from './assistant.ts';
import { fetchJson, readJson, type Fetcher } from './http.ts';
import { getRoute, getWeather, searchAddresses, type ProviderSettings } from './providers.ts';
import { list, record, requestData, ServiceError, text } from './validation.ts';

export interface GatewaySettings extends ProviderSettings {
  supabaseUrl?: string;
  authKey?: string;
  serviceKey?: string;
  allowedOrigins: string[];
}
const actions: TravelAction[] = ['search', 'route', 'weather', 'assistant'];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function adminHeaders(settings: GatewaySettings) {
  if (!settings.supabaseUrl || !settings.serviceKey) throw new ServiceError('NOT_CONFIGURED', 503);
  return {
    apikey: settings.serviceKey,
    Authorization: `Bearer ${settings.serviceKey}`,
    'Content-Type': 'application/json',
  };
}
async function userId(request: Request, settings: GatewaySettings, fetcher: Fetcher) {
  const token = request.headers.get('authorization');
  if (!token?.startsWith('Bearer ') || token.length > 8000)
    throw new ServiceError('SIGN_IN_REQUIRED', 401);
  if (!settings.supabaseUrl || !settings.authKey) throw new ServiceError('NOT_CONFIGURED', 503);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetcher(`${settings.supabaseUrl}/auth/v1/user`, {
      headers: { apikey: settings.authKey, Authorization: token },
      signal: controller.signal,
      redirect: 'error',
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw new ServiceError('SIGN_IN_REQUIRED', 401);
    }
    const user = record(await readJson(response, 64000));
    if (
      typeof user.id !== 'string' ||
      !uuid.test(user.id) ||
      user.is_anonymous === true ||
      !user.email_confirmed_at
    )
      throw new ServiceError('SIGN_IN_REQUIRED', 401);
    return user.id;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('PROVIDER_UNAVAILABLE', 503);
  } finally {
    clearTimeout(timeout);
  }
}
async function consumeQuota(
  id: string,
  action: TravelAction,
  settings: GatewaySettings,
  fetcher: Fetcher,
) {
  const allowed = await fetchJson(
    fetcher,
    `${settings.supabaseUrl}/rest/v1/rpc/consume_travel_quota`,
    {
      method: 'POST',
      headers: adminHeaders(settings),
      body: JSON.stringify({ account_id: id, service_action: action }),
    },
  );
  if (allowed !== true) throw new ServiceError('RATE_LIMITED', 429);
}
async function publicPlaces(
  ids: string[],
  area: string,
  settings: GatewaySettings,
  fetcher: Fetcher,
): Promise<PublicPlaceContext[]> {
  if (!ids.length) {
    const regional = seedPlaces.filter((place) =>
      place.locality.toLowerCase().includes(area.toLowerCase()),
    );
    return (regional.length ? regional : seedPlaces).slice(0, 5).map(publicContext);
  }
  const result: PublicPlaceContext[] = [];
  for (const id of ids) {
    const seed = seedPlaces.find((place) => place.id === id);
    if (seed) {
      result.push(publicContext(seed));
      continue;
    }
    const publicId = id.startsWith('community:') ? id.slice(10) : '';
    if (!uuid.test(publicId)) throw new ServiceError('UNKNOWN_PLACE');
    const url = new URL(`${settings.supabaseUrl}/rest/v1/community_places`);
    url.searchParams.set('id', `eq.${publicId}`);
    url.searchParams.set('select', 'id,name,description,access_notes,reviewed_at');
    const rows = list(await fetchJson(fetcher, url, { headers: adminHeaders(settings) }));
    if (!rows.length) throw new ServiceError('UNKNOWN_PLACE');
    const row = record(rows[0]);
    result.push({
      id,
      name: text(row.name, 100),
      description: text(row.description, 3000),
      access: typeof row.access_notes === 'string' ? row.access_notes.slice(0, 1500) : 'Unknown',
      seasonalNotes: 'Administrator-reviewed contribution. Current conditions are not verified.',
      openingHours: null,
      sources: [],
    });
  }
  return result;
}
function publicContext(place: PublicPlaceContext): PublicPlaceContext {
  return {
    id: place.id,
    name: place.name,
    description: place.description,
    access: place.access,
    seasonalNotes: place.seasonalNotes,
    openingHours: place.openingHours,
    sources: place.sources,
  };
}

export function createTravelHandler(
  settings: GatewaySettings,
  baseFetch: Fetcher = fetch,
  clock = () => new Date(),
) {
  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get('origin');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      Vary: 'Origin',
    };
    if (origin && !settings.allowedOrigins.includes(origin))
      return new Response(JSON.stringify({ error: 'ORIGIN_NOT_ALLOWED' }), {
        status: 403,
        headers,
      });
    if (origin) headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Headers'] = 'authorization, apikey, content-type, x-client-info';
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    const deadline = new AbortController();
    const timeout = setTimeout(() => deadline.abort(), 30000);
    const fetcher: Fetcher = (url, init) =>
      baseFetch(url, {
        ...init,
        signal: AbortSignal.any([deadline.signal, ...(init?.signal ? [init.signal] : [])]),
      });
    try {
      if (request.method !== 'POST') throw new ServiceError('METHOD_NOT_ALLOWED', 405);
      if (!request.headers.get('content-type')?.startsWith('application/json'))
        throw new ServiceError('INVALID_REQUEST');
      const id = await userId(request, settings, fetcher);
      let body: Record<string, unknown>;
      try {
        body = record(await readJson(request, 16000));
      } catch {
        throw new ServiceError('INVALID_REQUEST');
      }
      if (!actions.includes(body.action as TravelAction)) throw new ServiceError('INVALID_REQUEST');
      const action = body.action as TravelAction;
      const data = requestData(action, body.data);
      // Persistent and atomic quotas apply across function instances. Fail closed if DB is unavailable.
      await consumeQuota(id, action, settings, fetcher);
      let result: unknown;
      switch (action) {
        case 'search':
          result = await searchAddresses(requestData('search', data), settings, fetcher);
          break;
        case 'route':
          result = await getRoute(requestData('route', data), settings, fetcher, clock());
          break;
        case 'weather':
          result = await getWeather(requestData('weather', data), settings, fetcher, clock());
          break;
        case 'assistant': {
          const input = requestData('assistant', data);
          result = await askMistral(
            input,
            await publicPlaces(input.placeIds, input.area, settings, fetcher),
            settings,
            fetcher,
          );
          break;
        }
      }
      return new Response(JSON.stringify({ data: result }), { headers });
    } catch (error) {
      const safe =
        error instanceof ServiceError ? error : new ServiceError('SERVICE_UNAVAILABLE', 503);
      if (safe.status === 429) {
        const time = clock();
        const reset = Date.UTC(time.getUTCFullYear(), time.getUTCMonth(), time.getUTCDate() + 1);
        headers['Retry-After'] = String(Math.max(1, Math.ceil((reset - time.getTime()) / 1000)));
      }
      // Never return provider response bodies, tokens, URLs, or internal exceptions.
      return new Response(JSON.stringify({ error: safe.code }), { status: safe.status, headers });
    } finally {
      clearTimeout(timeout);
    }
  };
}
