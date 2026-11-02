import type { StoragePort } from '../state/persistence';
import { validCoordinates } from '../contributions/model';
import { transportLabels } from '../places/types';
import {
  corridorRadii,
  destinationRadii,
  experiences,
  initialJourney,
  validClock,
  validTravelDate,
  type JourneyState,
  type TravelPoint,
} from './model';

export const JOURNEY_KEY = 'mapper:journey:v1';
function isPoint(value: unknown): value is TravelPoint {
  if (!value || typeof value !== 'object') return false;
  const point = value as TravelPoint;
  return (
    typeof point.id === 'string' &&
    typeof point.name === 'string' &&
    Boolean(point.coordinates) &&
    validCoordinates(point.coordinates.latitude, point.coordinates.longitude) &&
    (point.placeId === undefined || typeof point.placeId === 'string')
  );
}
export function decodeJourney(raw: string | null): JourneyState {
  if (raw === null) return initialJourney;
  const data = JSON.parse(raw);
  const state = data?.state as JourneyState;
  if (
    data?.version !== 1 ||
    !state ||
    ![state.destination, state.start, state.exploreOrigin].every(
      (point) => point === null || isPoint(point),
    ) ||
    !experiences.some((item) => item.id === state.experience) ||
    !(destinationRadii as readonly number[]).includes(state.destinationRadiusKm) ||
    !(corridorRadii as readonly number[]).includes(state.corridorRadiusKm) ||
    (state.transport !== null && !Object.hasOwn(transportLabels, state.transport)) ||
    typeof state.departureTime !== 'string' ||
    !validClock(state.departureTime) ||
    typeof state.travelDate !== 'string' ||
    !validTravelDate(state.travelDate) ||
    !['any', 'low', 'flexible'].includes(state.budget) ||
    !Array.isArray(state.stopIds) ||
    !state.stopIds.every((id) => typeof id === 'string') ||
    !Array.isArray(state.recent) ||
    !state.recent.every(isPoint)
  )
    throw new Error('Saved journey could not be read. Existing data is preserved.');
  return { ...state, stopIds: [...new Set(state.stopIds)], recent: state.recent.slice(0, 5) };
}
export function createJourneyWriter(storage: StoragePort) {
  let pending = Promise.resolve();
  return (state: JourneyState) => {
    const raw = JSON.stringify({ version: 1, state });
    pending = pending.catch(() => {}).then(() => storage.setItem(JOURNEY_KEY, raw));
    return pending;
  };
}
