import { areas, type DiscoveryFilters, type Place } from './types';
import { distanceKm, estimateTravelMinutes } from '../planning/travel';
export function filterPlaces(places: Place[], filters: DiscoveryFilters): Place[] {
  const origin = areas.find((a) => a.id === filters.area)!.coordinates;
  const query = filters.query.trim().toLocaleLowerCase();
  return places
    .filter((place) => {
      const searchText =
        `${place.name} ${place.locality} ${place.categories.join(' ')}`.toLocaleLowerCase();
      return (
        (!query || searchText.includes(query)) &&
        (!filters.categories.length ||
          filters.categories.some((c) => place.categories.includes(c))) &&
        distanceKm(origin, place.coordinates) <= filters.radiusKm &&
        (filters.transport === null ||
          estimateTravelMinutes(origin, place.coordinates, filters.transport) * 2 +
            place.visitMinutes <=
            filters.budgetMinutes)
      );
    })
    .sort((a, b) => distanceKm(origin, a.coordinates) - distanceKm(origin, b.coordinates));
}
