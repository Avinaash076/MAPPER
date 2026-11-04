import type { Coordinates, Place } from '../places/types';
import type { RouteResult } from '../../services/travel/types';
import { distanceKm } from '../planning/travel';
import { destinationSuggestions, type JourneyState } from './model';

function segmentDistanceKm(point: Coordinates, a: number[], b: number[]): number {
  const scale = Math.cos((point.latitude * Math.PI) / 180);
  const ax = (a[0] - point.longitude) * scale,
    ay = a[1] - point.latitude;
  const bx = (b[0] - point.longitude) * scale,
    by = b[1] - point.latitude;
  const dx = bx - ax,
    dy = by - ay;
  const length = dx * dx + dy * dy;
  const t = length === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / length));
  return Math.hypot(ax + t * dx, ay + t * dy) * 111.195;
}
export function routeDistanceKm(point: Coordinates, route: RouteResult): number {
  let nearest = Infinity;
  for (const line of route.geometry.coordinates) {
    for (let index = 1; index < line.length; index++)
      nearest = Math.min(nearest, segmentDistanceKm(point, line[index - 1], line[index]));
  }
  return nearest;
}
export function journeySuggestions(
  places: Place[],
  journey: JourneyState,
  interests: Place['categories'],
  route: RouteResult | null,
): Place[] {
  const nearby = destinationSuggestions(places, journey, interests);
  if (!route || !['along-route', 'both'].includes(journey.experience)) return nearby;
  const corridor = places.filter(
    (place) =>
      place.id !== journey.destination?.placeId &&
      (!interests.length || interests.some((id) => place.categories.includes(id))) &&
      routeDistanceKm(place.coordinates, route) <= journey.corridorRadiusKm,
  );
  return [...new Map([...nearby, ...corridor].map((place) => [place.id, place])).values()].sort(
    (a, b) =>
      journey.start
        ? distanceKm(journey.start.coordinates, a.coordinates) -
          distanceKm(journey.start.coordinates, b.coordinates)
        : 0,
  );
}
export function roadArrivals(route: RouteResult, visitMinutes: number[]) {
  if (route.legSeconds.length !== visitMinutes.length) return null;
  let elapsed = 0;
  return route.legSeconds.map((seconds, index) => {
    elapsed += seconds;
    const arrival = Math.ceil(elapsed / 60);
    elapsed += visitMinutes[index] * 60;
    return arrival;
  });
}
