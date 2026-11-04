import type { Coordinates, Place } from '../places/types';
import type { ColorScheme } from '../../theme/preferences';
export type MapStatus = 'loading' | 'ready' | 'error';
export type MapAppearance = 'liberty' | 'dark';
export interface MapPoint {
  id: string;
  name: string;
  coordinates: Coordinates;
}
export interface PlaceMapProps {
  places: Place[];
  center: Coordinates;
  selectedId: string | null;
  scheme: ColorScheme;
  appearance?: MapAppearance;
  preview?: boolean;
  zoom?: number;
  locationPin?: Coordinates;
  extraPoints?: MapPoint[];
  route?: { type: 'MultiLineString'; coordinates: number[][][] };
  onSelect: (id: string) => void;
  onStatusChange: (status: MapStatus) => void;
}
