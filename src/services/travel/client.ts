import { communityClient } from '../communityClient';
import type { TravelAction, TravelRequests, TravelResults } from './types';

export const travelServicesEnabled =
  process.env.EXPO_PUBLIC_TRAVEL_SERVICES_ENABLED === 'true' && Boolean(communityClient);
const messages: Record<string, string> = {
  SIGN_IN_REQUIRED:
    'Sign in with your email to use online travel services. Local browsing remains available.',
  NOT_CONFIGURED:
    'This service has not been configured on the server yet. Local browsing remains available.',
  RATE_LIMITED:
    'The daily request allowance has been reached. Try again after the daily reset; your local plan is safe.',
  PROVIDER_BUSY: 'The provider is busy. Wait a moment and try again.',
  FORECAST_DATE_UNAVAILABLE:
    'Forecasts are available for today and the next six days only. Your saved date has not changed.',
  UNKNOWN_PLACE: 'This place is no longer in the public catalog. Refresh places and try again.',
  INVALID_REQUEST:
    'Check your search or trip settings and try again. Routes support up to 10 optional stops.',
  INVALID_DATA:
    'The provider returned incomplete information. Try again; no substitute result is shown.',
};
export function serviceErrorMessage(code: unknown): string {
  return typeof code === 'string' && Object.hasOwn(messages, code)
    ? messages[code]
    : 'The online service could not be reached. Check your connection and retry. Local browsing still works.';
}
export async function requestTravel<A extends TravelAction>(
  action: A,
  data: TravelRequests[A],
  signal?: AbortSignal,
): Promise<TravelResults[A]> {
  if (!travelServicesEnabled || !communityClient)
    throw new Error(serviceErrorMessage('NOT_CONFIGURED'));
  const { data: sessionData, error } = await communityClient.auth.getSession();
  if (error || !sessionData.session) throw new Error(serviceErrorMessage('SIGN_IN_REQUIRED'));
  if (signal?.aborted) throw new Error('Request cancelled.');
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener('abort', cancel);
  const timeout = setTimeout(cancel, 45000);
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/travel-services`,
      {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({ action, data }),
      },
    );
    const body = await response.json();
    if (!response.ok) throw new Error(serviceErrorMessage(body?.error));
    if (!body || typeof body !== 'object' || body.data === undefined)
      throw new Error(serviceErrorMessage('INVALID_DATA'));
    return body.data as TravelResults[A];
  } catch (error) {
    if (error instanceof Error && Object.values(messages).includes(error.message)) throw error;
    throw new Error(serviceErrorMessage(null));
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
  }
}
