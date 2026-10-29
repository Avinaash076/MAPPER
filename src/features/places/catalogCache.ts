import { categories, type Place } from './types';
import { validCoordinates } from '../contributions/model';

export function decodeCatalogCache(raw: string | null): Place[] {
  if (!raw) return [];
  const places = JSON.parse(raw);
  if (
    !Array.isArray(places) ||
    !places.every(
      (place) =>
        place &&
        typeof place.id === 'string' &&
        /^community:[0-9a-f-]{36}$/i.test(place.id) &&
        typeof place.name === 'string' &&
        typeof place.locality === 'string' &&
        typeof place.description === 'string' &&
        Array.isArray(place.categories) &&
        place.categories.every((id: unknown) =>
          categories.some((category) => category.id === id),
        ) &&
        place.coordinates &&
        validCoordinates(place.coordinates.latitude, place.coordinates.longitude) &&
        Number.isFinite(place.visitMinutes) &&
        place.visitMinutes > 0 &&
        typeof place.access === 'string' &&
        typeof place.seasonalNotes === 'string' &&
        Array.isArray(place.sources) &&
        (!place.photo ||
          (typeof place.photo.uri === 'string' &&
            place.photo.uri.startsWith('https://') &&
            typeof place.photo.author === 'string' &&
            typeof place.photo.license === 'string' &&
            typeof place.photo.sourceUrl === 'string')),
    )
  )
    throw new Error('Reviewed-place cache is invalid.');
  return places;
}
