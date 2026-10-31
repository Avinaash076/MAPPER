import type { FeatureCollection, Point } from 'geojson';
import type { Place } from '../places/types';
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
): FeatureCollection<Point, { id: string; name: string }> {
  return {
    type: 'FeatureCollection',
    features: places.map((place) => ({
      type: 'Feature',
      id: place.id,
      geometry: {
        type: 'Point',
        coordinates: [place.coordinates.longitude, place.coordinates.latitude],
      },
      properties: { id: place.id, name: place.name },
    })),
  };
}
