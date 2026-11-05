import test from 'node:test';
import assert from 'node:assert/strict';
import { checkProviderKeys } from '../scripts/backend/provider-checks';

const settings = {
  geoapifyKey: 'test-geo-secret',
  mistralKey: 'test-ai-secret',
  mistralModel: 'mistral-small-latest',
  weatherMode: 'prototype',
};
const now = new Date('2026-11-05T09:00:00Z');
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });
function forecast() {
  return json({
    daily: {
      time: ['2026-11-05'],
      temperature_2m_min: [20],
      temperature_2m_max: [30],
      precipitation_probability_max: [10],
    },
  });
}
test('local key checks contact only provider endpoints without Supabase or chat generation by default', async () => {
  const calls: URL[] = [];
  const checks = await checkProviderKeys(settings, {
    now,
    fetcher: async (input) => {
      const url = new URL(String(input));
      calls.push(url);
      if (url.host === 'api.geoapify.com') return json({ results: [] });
      if (url.host === 'api.mistral.ai') {
        assert.equal(url.pathname, '/v1/models/mistral-small-latest');
        return json({ id: 'mistral-small-latest', capabilities: { completion_chat: true } });
      }
      assert.equal(url.host, 'api.open-meteo.com');
      return forecast();
    },
  });
  assert.equal(calls.length, 3);
  assert.ok(checks.every((check) => check.ok));
  assert.equal(JSON.stringify(checks).includes('test-ai-secret'), false);
  assert.equal(JSON.stringify(checks).includes('test-geo-secret'), false);
});
test('local checks distinguish rejected keys and provider quotas without echoing error bodies', async () => {
  const checks = await checkProviderKeys(settings, {
    now,
    fetcher: async (input) => {
      const url = new URL(String(input));
      if (url.host === 'api.geoapify.com') return json({ error: 'test-geo-secret' }, 403);
      if (url.host === 'api.mistral.ai') return json({ error: 'test-ai-secret' }, 429);
      return forecast();
    },
  });
  assert.equal(checks[0].ok, false);
  assert.match(checks[0].detail, /rejected/);
  assert.equal(checks[1].ok, false);
  assert.match(checks[1].detail, /quota/);
  assert.equal(checks[2].ok, true);
  assert.equal(JSON.stringify(checks).includes('test-ai-secret'), false);
});
test('chat is explicit and uses one public sample with the actual assistant response validator', async () => {
  let completions = 0;
  const checks = await checkProviderKeys(settings, {
    chat: true,
    now,
    fetcher: async (input, init) => {
      const url = new URL(String(input));
      if (url.host === 'api.geoapify.com') return json({ results: [] });
      if (url.host === 'api.mistral.ai') {
        completions++;
        assert.equal(url.pathname, '/v1/chat/completions');
        assert.equal(String(init?.body).includes('latitude'), false);
        return json({
          choices: [
            {
              finish_reason: 'stop',
              message: {
                content:
                  '{"title":"Before visiting","body":"Check current access locally.","placeIds":["unkal-lake"]}',
              },
            },
          ],
        });
      }
      return forecast();
    },
  });
  assert.equal(completions, 1);
  assert.ok(checks.every((check) => check.ok));
});
