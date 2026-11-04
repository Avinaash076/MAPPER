import type { FeatureCollection, Point } from 'geojson';
import type { Coordinates, Place } from '../places/types';
import type { ColorScheme } from '../../theme/preferences';
import type { MapAppearance, MapPoint } from './types';
export const mapStyles = {
  light: 'https://tiles.openfreemap.org/styles/liberty',
  dark: 'https://tiles.openfreemap.org/styles/dark',
};
export const mapMarkerColors = {
  fill: '#294E69',
  outline: '#FFFFFF',
  start: '#25633B',
  destination: '#805B00',
};
export function getMapStyle(scheme: ColorScheme | MapAppearance) {
  return mapStyles[scheme === 'liberty' ? 'light' : scheme];
}
export function routeColor(appearance: ColorScheme | MapAppearance) {
  return appearance === 'dark' ? '#9BC6E3' : '#294E69';
}
export function routeFeature(route?: { type: 'MultiLineString'; coordinates: number[][][] }) {
  return {
    type: 'FeatureCollection' as const,
    features: route ? [{ type: 'Feature' as const, properties: {}, geometry: route }] : [],
  };
}
export function routeExtentPoints(route?: { coordinates: number[][][] }): MapPoint[] {
  if (!route) return [];
  let west = 180,
    east = -180,
    south = 90,
    north = -90;
  for (const line of route.coordinates)
    for (const pair of line) {
      west = Math.min(west, pair[0]);
      east = Math.max(east, pair[0]);
      south = Math.min(south, pair[1]);
      north = Math.max(north, pair[1]);
    }
  return west <= east
    ? [
        { id: 'route:sw', name: 'Route extent', coordinates: { latitude: south, longitude: west } },
        { id: 'route:ne', name: 'Route extent', coordinates: { latitude: north, longitude: east } },
      ]
    : [];
}
export function pointBounds(points: MapPoint[]): [number, number, number, number] | null {
  if (points.length < 2) return null;
  const longitudes = points.map((point) => point.coordinates.longitude);
  const latitudes = points.map((point) => Math.max(-85, Math.min(85, point.coordinates.latitude)));
  const west = Math.min(...longitudes),
    east = Math.max(...longitudes);
  const south = Math.min(...latitudes),
    north = Math.max(...latitudes);
  const dx = Math.max(0.005, (east - west) * 0.15),
    dy = Math.max(0.005, (north - south) * 0.15);
  return [
    Math.max(-180, west - dx),
    Math.max(-85, south - dy),
    Math.min(180, east + dx),
    Math.min(85, north + dy),
  ];
}
export function placesToGeoJson(
  places: Place[],
  locationPin?: Coordinates,
  extraPoints: MapPoint[] = [],
): FeatureCollection<Point, { id: string; name: string }> {
  return {
    type: 'FeatureCollection',
    features: [
      ...places.map((place) => ({
        type: 'Feature' as const,
        id: place.id,
        geometry: {
          type: 'Point' as const,
          coordinates: [place.coordinates.longitude, place.coordinates.latitude],
        },
        properties: { id: place.id, name: place.name },
      })),
      ...extraPoints.map((point) => ({
        type: 'Feature' as const,
        id: point.id,
        geometry: {
          type: 'Point' as const,
          coordinates: [point.coordinates.longitude, point.coordinates.latitude],
        },
        properties: { id: point.id, name: point.name },
      })),
      ...(locationPin
        ? [
            {
              type: 'Feature' as const,
              id: 'private-location',
              geometry: {
                type: 'Point' as const,
                coordinates: [locationPin.longitude, locationPin.latitude],
              },
              properties: { id: 'private-location', name: 'Your captured location' },
            },
          ]
        : []),
    ],
  };
}
