import type {
  AddressResult,
  RouteResult,
  TravelRequests,
  WeatherResult,
} from '../../../src/services/travel/types.ts';
import { coordinates, list, number, record, ServiceError, text } from './validation.ts';
import { fetchJson, type Fetcher } from './http.ts';

export interface ProviderSettings {
  geoapifyKey?: string;
  mistralKey?: string;
  mistralModel?: string;
  weatherMode?: string;
  weatherKey?: string;
}
function geoUrl(path: string, settings: ProviderSettings) {
  if (!settings.geoapifyKey) throw new ServiceError('NOT_CONFIGURED', 503);
  const url = new URL(`https://api.geoapify.com/v1/${path}`);
  url.searchParams.set('apiKey', settings.geoapifyKey);
  return url;
}
export async function searchAddresses(
  data: TravelRequests['search'],
  settings: ProviderSettings,
  fetcher: Fetcher,
): Promise<AddressResult[]> {
  const url = geoUrl('geocode/autocomplete', settings);
  url.searchParams.set('text', data.query);
  url.searchParams.set('filter', 'countrycode:in');
  url.searchParams.set('limit', '5');
  url.searchParams.set('format', 'json');
  const result = record(await fetchJson(fetcher, url));
  return list(result.results)
    .slice(0, 5)
    .map((item) => {
      const row = record(item);
      return {
        id: `geoapify:${text(row.place_id, 1000)}`,
        name: text(row.formatted, 300),
        coordinates: coordinates({ latitude: row.lat, longitude: row.lon }),
      };
    });
}
export function parseRoute(value: unknown, legs: number, now: Date): RouteResult {
  const feature = record(list(record(value).features)[0]);
  const props = record(feature.properties);
  const geometry = record(feature.geometry);
  if (geometry.type !== 'MultiLineString') throw new ServiceError('INVALID_DATA', 502);
  let count = 0;
  const lines = list(geometry.coordinates).map((line) => {
    const points = list(line).map((point) => {
      if (++count > 50000) throw new ServiceError('INVALID_DATA', 502);
      const pair = list(point);
      return [number(pair[0], -180, 180), number(pair[1], -90, 90)];
    });
    if (points.length < 2) throw new ServiceError('INVALID_DATA', 502);
    return points;
  });
  const legSeconds = list(props.legs).map((leg) => number(record(leg).time));
  if (
    !lines.length ||
    legSeconds.length !== legs ||
    String(props.distance_units).toLowerCase() !== 'meters' ||
    (props.time_units !== undefined && String(props.time_units).toLowerCase() !== 'seconds')
  )
    throw new ServiceError('INVALID_DATA', 502);
  const durationSeconds = number(props.time);
  if (
    Math.abs(legSeconds.reduce((sum, seconds) => sum + seconds, 0) - durationSeconds) >
    Math.max(5, durationSeconds * 0.02)
  )
    throw new ServiceError('INVALID_DATA', 502);
  return {
    provider: 'Geoapify',
    fetchedAt: now.toISOString(),
    distanceMeters: number(props.distance),
    durationSeconds,
    legSeconds,
    geometry: { type: 'MultiLineString', coordinates: lines },
  };
}
export async function getRoute(
  data: TravelRequests['route'],
  settings: ProviderSettings,
  fetcher: Fetcher,
  now: Date,
) {
  const modes = { walking: 'walk', bicycle: 'bicycle', motorbike: 'motorcycle', car: 'drive' };
  const url = geoUrl('routing', settings);
  url.searchParams.set(
    'waypoints',
    data.points.map((p) => `${p.latitude},${p.longitude}`).join('|'),
  );
  url.searchParams.set('mode', modes[data.transport]);
  url.searchParams.set('units', 'metric');
  url.searchParams.set('traffic', 'free_flow');
  url.searchParams.set('format', 'geojson');
  return parseRoute(await fetchJson(fetcher, url), data.points.length - 1, now);
}
export async function getWeather(
  data: TravelRequests['weather'],
  settings: ProviderSettings,
  fetcher: Fetcher,
  now: Date,
): Promise<WeatherResult> {
  const customer = settings.weatherMode === 'commercial';
  if ((!customer && settings.weatherMode !== 'prototype') || (customer && !settings.weatherKey))
    throw new ServiceError('NOT_CONFIGURED', 503);
  const today = new Date(now.getTime() + 330 * 60000).toISOString().slice(0, 10);
  const date = data.date || today;
  const dayOffset = (Date.parse(date) - Date.parse(today)) / 86400000;
  if (dayOffset < 0 || dayOffset > 6) throw new ServiceError('FORECAST_DATE_UNAVAILABLE');
  const url = new URL(`https://${customer ? 'customer-api' : 'api'}.open-meteo.com/v1/forecast`);
  url.searchParams.set('latitude', data.coordinates.latitude.toFixed(2));
  url.searchParams.set('longitude', data.coordinates.longitude.toFixed(2));
  url.searchParams.set(
    'daily',
    'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
  );
  url.searchParams.set('timezone', 'Asia/Kolkata');
  url.searchParams.set('temperature_unit', 'celsius');
  url.searchParams.set('forecast_days', '7');
  if (customer) url.searchParams.set('apikey', settings.weatherKey!);
  const daily = record(record(await fetchJson(fetcher, url)).daily);
  const index = list(daily.time).indexOf(date);
  if (index < 0) throw new ServiceError('FORECAST_DATE_UNAVAILABLE');
  const rain = list(daily.precipitation_probability_max)[index];
  return {
    provider: 'Open-Meteo',
    fetchedAt: now.toISOString(),
    date,
    timezone: 'Asia/Kolkata',
    minC: number(list(daily.temperature_2m_min)[index], -100, 70),
    maxC: number(list(daily.temperature_2m_max)[index], -100, 70),
    rainChance: rain === null ? null : number(rain, 0, 100),
  };
}
