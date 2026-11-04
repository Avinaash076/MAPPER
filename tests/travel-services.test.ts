import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { createTravelHandler, type GatewaySettings } from '../supabase/functions/_shared/gateway';
import {
  getRoute,
  getWeather,
  parseRoute,
  searchAddresses,
} from '../supabase/functions/_shared/providers';
import { askMistral } from '../supabase/functions/_shared/assistant';
import { requestData } from '../supabase/functions/_shared/validation';
import { fetchJson, readJson } from '../supabase/functions/_shared/http';
import { initialJourney, placePoint } from '../src/features/journey/model';
import { journeySuggestions, roadArrivals } from '../src/features/journey/routeModel';
import { seedPlaces } from '../src/features/places/seedPlaces';
import { routeExtentPoints, routeFeature } from '../src/features/map/model';

const now = new Date('2026-11-04T12:00:00Z');
const pointA = { latitude: 15.4, longitude: 75.1 };
const pointB = { latitude: 15.5, longitude: 75.2 };
// Document-shaped fixtures, not evidence that Geoapify has verified these Karnataka roads.
function routeResponse() {
  return {
    features: [
      {
        properties: {
          distance: 12000,
          distance_units: 'meters',
          time: 1200,
          legs: [{ time: 480 }, { time: 720 }],
        },
        geometry: {
          type: 'MultiLineString',
          coordinates: [
            [
              [75.1, 15.4],
              [75.15, 15.45],
            ],
            [
              [75.15, 15.45],
              [75.2, 15.5],
            ],
          ],
        },
      },
    ],
  };
}
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
const settings: GatewaySettings = {
  supabaseUrl: 'https://project.test',
  authKey: 'public-test',
  serviceKey: 'server-test',
  geoapifyKey: 'geo-test-private',
  mistralKey: 'mistral-test-private',
  mistralModel: 'account-model',
  weatherMode: 'prototype',
  allowedOrigins: ['http://localhost:8081'],
};
const account = '11111111-1111-4111-8111-111111111111';
function request(action: string, data: unknown, auth = true, origin?: string) {
  return new Request('https://project.test/functions/v1/travel-services', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: 'Bearer user-test' } : {}),
      ...(origin ? { Origin: origin } : {}),
    },
    body: JSON.stringify({ action, data }),
  });
}

test('request validation rejects unsupported modes, oversized queries, invalid coordinates, dates and excess stops', () => {
  assert.throws(
    () => requestData('route', { points: [pointA, pointB], transport: 'flying' }),
    /INVALID_REQUEST/,
  );
  assert.throws(() => requestData('route', { points: Array(13).fill(pointA), transport: 'car' }));
  assert.throws(() => requestData('search', { query: 'x'.repeat(121) }));
  assert.throws(() => requestData('search', { query: 'hi' }));
  assert.throws(() =>
    requestData('weather', { coordinates: { latitude: 999, longitude: 0 }, date: '' }),
  );
  assert.throws(() => requestData('weather', { coordinates: pointA, date: '2026-02-30' }));
  assert.deepEqual(
    requestData('assistant', {
      question: ' Hello ',
      area: ' Dharwad ',
      placeIds: [],
      privateDraft: { secret: 'ignored' },
    }),
    { question: 'Hello', area: 'Dharwad', placeIds: [] },
  );
});

test('routing uses the correct provider modes, ordered lat/lon waypoints, metric units and real geometry', async () => {
  for (const [transport, mode] of Object.entries({
    walking: 'walk',
    bicycle: 'bicycle',
    motorbike: 'motorcycle',
    car: 'drive',
  })) {
    const data = requestData('route', {
      points: [pointA, { latitude: 15.45, longitude: 75.15 }, pointB],
      transport,
    });
    const route = await getRoute(
      data,
      settings,
      async (input) => {
        const url = new URL(String(input));
        assert.equal(url.origin, 'https://api.geoapify.com');
        assert.equal(url.searchParams.get('mode'), mode);
        assert.equal(url.searchParams.get('waypoints'), '15.4,75.1|15.45,75.15|15.5,75.2');
        assert.equal(url.searchParams.get('traffic'), 'free_flow');
        return json(routeResponse());
      },
      now,
    );
    assert.equal(route.distanceMeters, 12000);
    assert.deepEqual(route.legSeconds, [480, 720]);
    assert.deepEqual(roadArrivals(route, [30, 45]), [8, 50]);
    assert.equal(route.fetchedAt, now.toISOString());
    assert.deepEqual(
      routeFeature(route.geometry).features[0].geometry.coordinates[0][0],
      [75.1, 15.4],
    );
    assert.equal(routeExtentPoints(route.geometry)[1].coordinates.longitude, 75.2);
  }
});

test('route parser refuses missing legs, bad units, truncated geometry and inconsistent totals', () => {
  assert.throws(() => parseRoute(routeResponse(), 3, now));
  const bad = routeResponse();
  bad.features[0].properties.distance_units = 'miles';
  assert.throws(() => parseRoute(bad, 2, now));
  const incomplete = routeResponse();
  incomplete.features[0].geometry.coordinates = [];
  assert.throws(() => parseRoute(incomplete, 2, now));
  const inconsistent = routeResponse();
  inconsistent.features[0].properties.time = 999999;
  assert.throws(() => parseRoute(inconsistent, 2, now));
});

test('online address results contain provider coordinates and an India filter, without requesting GPS', async () => {
  const results = await searchAddresses({ query: 'Dharwad' }, settings, async (input) => {
    const url = new URL(String(input));
    assert.equal(url.searchParams.get('filter'), 'countrycode:in');
    assert.equal(url.searchParams.has('bias'), false);
    return json({
      results: [{ place_id: 'abc', formatted: 'Dharwad, Karnataka, India', lat: 15.45, lon: 75.0 }],
    });
  });
  assert.deepEqual(results[0], {
    id: 'geoapify:abc',
    name: 'Dharwad, Karnataka, India',
    coordinates: { latitude: 15.45, longitude: 75 },
  });
});

test('forecast selects the requested Indian date, rounds coordinates and distinguishes commercial/prototype configuration', async () => {
  const fetcher: typeof fetch = async (input) => {
    const url = new URL(String(input));
    assert.equal(url.searchParams.get('latitude'), '15.40');
    assert.equal(url.searchParams.get('timezone'), 'Asia/Kolkata');
    return json({
      daily: {
        time: ['2026-11-04', '2026-11-05'],
        temperature_2m_min: [20, 21],
        temperature_2m_max: [29, 30],
        precipitation_probability_max: [null, 40],
      },
    });
  };
  const result = await getWeather(
    { coordinates: pointA, date: '2026-11-05' },
    settings,
    fetcher,
    now,
  );
  assert.equal(result.rainChance, 40);
  assert.equal(result.minC, 21);
  assert.equal(
    (await getWeather({ coordinates: pointA, date: '' }, settings, fetcher, now)).rainChance,
    null,
  );
  await assert.rejects(
    getWeather({ coordinates: pointA, date: '2026-11-12' }, settings, fetcher, now),
    /FORECAST_DATE_UNAVAILABLE/,
  );
  await assert.rejects(
    getWeather({ coordinates: pointA, date: '' }, { weatherMode: 'commercial' }, fetcher, now),
    /NOT_CONFIGURED/,
  );
  await assert.rejects(
    getWeather({ coordinates: pointA, date: '' }, {}, fetcher, now),
    /NOT_CONFIGURED/,
  );
  await getWeather(
    { coordinates: pointA, date: '' },
    { weatherMode: 'commercial', weatherKey: 'test' },
    async (input) => {
      assert.equal(new URL(String(input)).host, 'customer-api.open-meteo.com');
      return fetcher(input);
    },
    now,
  );
});

test('Mistral answers receive public evidence only and sources come from canonical records', async () => {
  const place = seedPlaces[0];
  const context = [
    {
      id: place.id,
      name: place.name,
      description: place.description,
      access: place.access,
      seasonalNotes: place.seasonalNotes,
      openingHours: place.openingHours,
      sources: place.sources,
    },
  ];
  const answer = await askMistral(
    { question: 'What is here?', area: 'Hubballi', placeIds: [place.id] },
    context,
    settings,
    async (_url, init) => {
      const sent = JSON.parse(String(init?.body));
      assert.equal(sent.model, 'account-model');
      assert.equal(sent.response_format.type, 'json_object');
      assert.equal(String(init?.body).includes('latitude'), false);
      assert.equal(sent.messages[1].content.includes('place_submissions'), false);
      return json({
        choices: [
          {
            finish_reason: 'stop',
            message: {
              content: JSON.stringify({
                title: 'A lakeside visit',
                body: 'The catalog describes a gentle stroll. Check current access locally.',
                placeIds: [place.id],
              }),
            },
          },
        ],
      });
    },
  );
  assert.equal(answer.demo, false);
  assert.equal(answer.placeId, place.id);
  assert.deepEqual(answer.sources, place.sources);
  await assert.rejects(
    askMistral({ question: 'Hello', area: 'Hubballi', placeIds: [] }, context, settings, async () =>
      json({
        choices: [
          {
            finish_reason: 'stop',
            message: {
              content: JSON.stringify({
                title: 'Fake',
                body: 'Unsupported',
                placeIds: ['invented-id'],
              }),
            },
          },
        ],
      }),
    ),
    /INVALID_DATA/,
  );
});

test('gateway requires verified user authentication and rejects disallowed origins before provider calls', async () => {
  let calls = 0;
  const handler = createTravelHandler(settings, async () => {
    calls++;
    return json({});
  });
  assert.equal((await handler(request('search', { query: 'Hubballi' }, false))).status, 401);
  assert.equal(
    (await handler(request('search', { query: 'Hubballi' }, true, 'https://untrusted.test')))
      .status,
    403,
  );
  assert.equal(calls, 0);
  const preflight = await handler(
    new Request('https://project.test', {
      method: 'OPTIONS',
      headers: { Origin: 'http://localhost:8081' },
    }),
  );
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), 'http://localhost:8081');
  const anonymous = createTravelHandler(settings, async () =>
    json({ id: account, is_anonymous: true }),
  );
  assert.equal((await anonymous(request('search', { query: 'Hubballi' }))).status, 401);
});

test('gateway stops paid requests when quota is exhausted and sanitizes provider errors', async () => {
  let calls = 0;
  const handler = createTravelHandler(settings, async (input) => {
    calls++;
    if (String(input).endsWith('/auth/v1/user'))
      return json({ id: account, email_confirmed_at: now.toISOString() });
    if (String(input).includes('/rpc/')) return json(false);
    throw new Error('Provider must not be called');
  });
  const response = await handler(request('search', { query: 'Hubballi' }));
  assert.equal(response.status, 429);
  assert.equal(calls, 2);
  const broken = createTravelHandler(settings, async (input) => {
    if (String(input).endsWith('/auth/v1/user'))
      return json({ id: account, email_confirmed_at: now.toISOString() });
    if (String(input).includes('/rpc/')) return json(true);
    throw new Error('https://provider.test?apiKey=secret-leak');
  });
  const failure = await broken(request('search', { query: 'Hubballi' }));
  assert.equal(failure.status, 503);
  assert.deepEqual(await failure.json(), { error: 'PROVIDER_UNAVAILABLE' });
});

test('gateway builds AI context from the server catalog and never from caller-supplied draft content', async () => {
  const handler = createTravelHandler(settings, async (input, init) => {
    if (String(input).endsWith('/auth/v1/user'))
      return json({ id: account, email_confirmed_at: now.toISOString() });
    if (String(input).includes('/rpc/')) return json(true);
    assert.equal(String(input), 'https://api.mistral.ai/v1/chat/completions');
    assert.equal(String(init?.body).includes('PRIVATE_COORDINATE'), false);
    return json({
      choices: [
        {
          finish_reason: 'stop',
          message: {
            content: '{"title":"Visit","body":"Check current access.","placeIds":["unkal-lake"]}',
          },
        },
      ],
    });
  });
  const response = await handler(
    request('assistant', {
      question: 'Visit?',
      area: 'Hubballi',
      placeIds: ['unkal-lake'],
      catalog: [{ description: 'PRIVATE_COORDINATE' }],
    }),
  );
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).data.sources, seedPlaces[0].sources);
});

test('bounded reads and HTTP failures do not expose upstream response bodies', async () => {
  await assert.rejects(readJson(json({ huge: 'x'.repeat(100) }), 10), /INVALID_DATA/);
  await assert.rejects(
    fetchJson(async () => new Response('secret error', { status: 429 }), 'https://example.test'),
    /PROVIDER_BUSY/,
  );
});

test('corridor uses line segments rather than endpoints, applies interests and does not claim road access', () => {
  const route = parseRoute(routeResponse(), 2, now);
  const near = { ...seedPlaces[0], id: 'near', coordinates: { latitude: 15.45, longitude: 75.15 } };
  const far = { ...seedPlaces[0], id: 'far', coordinates: { latitude: 16.5, longitude: 76.5 } };
  const journey = {
    ...initialJourney,
    experience: 'along-route' as const,
    start: placePoint(near),
    destination: placePoint(far),
    corridorRadiusKm: 1,
  };
  assert.deepEqual(
    journeySuggestions([near, far], journey, [], route).map((p) => p.id),
    ['near'],
  );
  assert.equal(journeySuggestions([near], journey, ['spiritual'], route).length, 0);
  assert.equal(journeySuggestions([near], journey, [], null).length, 0);
});

test('PostgreSQL quotas are service-only, enforce account and project limits and reset on a new day', async () => {
  const db = new PGlite();
  try {
    await db.exec(
      'create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to anon,authenticated,service_role;',
    );
    await db.exec(
      await readFile('supabase/migrations/202611040001_travel_service_limits.sql', 'utf8'),
    );
    await db.exec('set role authenticated');
    await assert.rejects(
      db.query("select public.consume_travel_quota($1,'assistant')", [account]),
      /permission denied/i,
    );
    await assert.rejects(
      db.query('select * from public.travel_service_usage'),
      /permission denied/i,
    );
    await db.exec('reset role; set role service_role');
    const consume = (id = account) =>
      db.query<{ allowed: boolean }>(
        "select public.consume_travel_quota($1,'assistant') as allowed",
        [id],
      );
    for (let i = 0; i < 20; i++) assert.equal((await consume()).rows[0].allowed, true);
    assert.equal((await consume()).rows[0].allowed, false);
    const global = await db.query<{ requests: number }>(
      "select requests from public.travel_service_usage where scope='global'",
    );
    assert.equal(global.rows[0].requests, 20);
    await db.exec("update public.travel_service_usage set requests=100 where scope='global'");
    assert.equal((await consume('22222222-2222-4222-8222-222222222222')).rows[0].allowed, false);
    await db.exec('update public.travel_service_usage set usage_day=usage_day-1');
    assert.equal((await consume()).rows[0].allowed, true);
    await db.exec('reset role; set role anon');
    await assert.rejects(
      db.query("select public.consume_travel_quota($1,'search')", [account]),
      /permission denied/i,
    );
  } finally {
    await db.close();
  }
});
