import type { TravelAction, TravelRequests } from '../../../src/services/travel/types.ts';

export class ServiceError extends Error {
  constructor(
    public code: string,
    public status = 400,
  ) {
    super(code);
  }
}
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new ServiceError('INVALID_DATA', 502);
  return value as Record<string, unknown>;
}
export function list(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new ServiceError('INVALID_DATA', 502);
  return value;
}
export function number(value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max)
    throw new ServiceError('INVALID_DATA', 502);
  return value;
}
export function text(value: unknown, max: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max)
    throw new ServiceError('INVALID_DATA', 502);
  return value.trim();
}
export function coordinates(value: unknown) {
  const point = record(value);
  return {
    latitude: number(point.latitude, -90, 90),
    longitude: number(point.longitude, -180, 180),
  };
}
export function requestData<A extends TravelAction>(action: A, value: unknown): TravelRequests[A] {
  try {
    const data = record(value);
    let result: TravelRequests[TravelAction];
    switch (action) {
      case 'search': {
        const query = text(data.query, 120);
        if (query.length < 3) throw new Error();
        result = { query };
        break;
      }
      case 'route': {
        const points = list(data.points).map(coordinates);
        if (
          points.length < 2 ||
          points.length > 12 ||
          !['walking', 'bicycle', 'motorbike', 'car'].includes(String(data.transport))
        )
          throw new Error();
        result = { points, transport: data.transport as TravelRequests['route']['transport'] };
        break;
      }
      case 'weather': {
        const date = typeof data.date === 'string' ? data.date : '';
        if (
          date &&
          (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
            !Number.isFinite(Date.parse(date)) ||
            new Date(date).toISOString().slice(0, 10) !== date)
        )
          throw new Error();
        result = { coordinates: coordinates(data.coordinates), date };
        break;
      }
      case 'assistant': {
        const ids = list(data.placeIds).map((id) => text(id, 100));
        if (ids.length > 5) throw new Error();
        result = {
          question: text(data.question, 600),
          area: text(data.area, 100),
          placeIds: [...new Set(ids)],
        };
        break;
      }
      default:
        throw new Error();
    }
    return result as TravelRequests[A];
  } catch {
    throw new ServiceError('INVALID_REQUEST');
  }
}
