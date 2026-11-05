import {
  searchAddresses,
  getWeather,
  type ProviderSettings,
} from '../../supabase/functions/_shared/providers';
import { askMistral } from '../../supabase/functions/_shared/assistant';
import { fetchJson, type Fetcher } from '../../supabase/functions/_shared/http';
import { record, ServiceError } from '../../supabase/functions/_shared/validation';
import { seedPlaces } from '../../src/features/places/seedPlaces';
import type { SetupCheck } from './config';

function failureDetail(status: number | null, error: unknown): string {
  if (status === 401 || status === 403)
    return 'Provider rejected access. Check the key and its account permissions/restrictions.';
  if (status === 429)
    return 'Provider rate/quota limit reached. Check account limits and retry later.';
  if (status === 404)
    return 'Selected model or endpoint is unavailable for this account. Check MISTRAL_MODEL.';
  if (error instanceof ServiceError && error.code === 'NOT_CONFIGURED')
    return 'Required server setting is empty. Check the key/model or weather mode.';
  if (error instanceof ServiceError && error.code === 'INVALID_DATA')
    return 'Provider returned an incomplete or unexpected response.';
  return 'Provider check failed. Check connectivity and provider account status; raw errors are hidden.';
}
export async function checkProviderKeys(
  settings: ProviderSettings,
  options: { chat?: boolean; now?: Date; fetcher?: Fetcher } = {},
): Promise<SetupCheck[]> {
  const fetcher = options.fetcher ?? fetch;
  const now = options.now ?? new Date();
  async function check(
    name: string,
    run: (request: Fetcher) => Promise<string>,
  ): Promise<SetupCheck> {
    let status: number | null = null;
    const tracked: Fetcher = async (input, init) => {
      const response = await fetcher(input, init);
      status = response.status;
      return response;
    };
    try {
      return { name, ok: true, detail: await run(tracked) };
    } catch (error) {
      return { name, ok: false, detail: failureDetail(status, error) };
    }
  }
  return Promise.all([
    check('Geoapify', async (request) => {
      await searchAddresses({ query: 'Dharwad Karnataka' }, settings, request);
      return 'Key accepted by address search. Road routing was not tested.';
    }),
    check('Mistral', async (request) => {
      if (!settings.mistralKey || !settings.mistralModel) throw new ServiceError('NOT_CONFIGURED');
      if (options.chat) {
        const place = seedPlaces[0];
        const context = {
          id: place.id,
          name: place.name,
          description: place.description,
          access: place.access,
          seasonalNotes: place.seasonalNotes,
          openingHours: place.openingHours,
          sources: place.sources,
        };
        await askMistral(
          {
            question: 'What should I check before visiting?',
            area: 'Hubballi',
            placeIds: [place.id],
          },
          [context],
          settings,
          request,
        );
        return 'A real sample AI completion passed the app response checks. Answer content is hidden.';
      }
      const model = record(
        await fetchJson(
          request,
          `https://api.mistral.ai/v1/models/${encodeURIComponent(settings.mistralModel)}`,
          {
            headers: { Authorization: `Bearer ${settings.mistralKey}` },
          },
        ),
      );
      if (typeof model.id !== 'string' || record(model.capabilities).completion_chat !== true)
        throw new ServiceError('INVALID_DATA');
      return 'Key accepted; selected model supports chat. No AI answer was generated.';
    }),
    check('Open-Meteo', async (request) => {
      await getWeather(
        { coordinates: { latitude: 15.4589, longitude: 75.0078 }, date: '' },
        settings,
        request,
        now,
      );
      return 'Destination forecast returned the expected fields. Prototype mode needs no key.';
    }),
  ]);
}
