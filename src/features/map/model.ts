import type { FeatureCollection, Point } from 'geojson';
import type { Coordinates, Place } from '../places/types';
import type { ColorScheme } from '../../theme/preferences';
import type { MapAppearance } from './types';
export const mapStyles = {
  light: 'https://tiles.openfreemap.org/styles/liberty',
  dark: 'https://tiles.openfreemap.org/styles/dark',
};
export const mapMarkerColors = { fill: '#294E69', outline: '#FFFFFF' };
export function getMapStyle(scheme: ColorScheme | MapAppearance) {
  return mapStyles[scheme === 'liberty' ? 'light' : scheme];
}
export function placesToGeoJson(
  places: Place[],
  locationPin?: Coordinates,
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
