import type { Coordinates, Place } from '../places/types';
import type { ColorScheme } from '../../theme/preferences';
export type MapStatus = 'loading' | 'ready' | 'error';
export type MapAppearance = 'liberty' | 'dark';
export interface PlaceMapProps {
  places: Place[];
  center: Coordinates;
  selectedId: string | null;
  scheme: ColorScheme;
  appearance?: MapAppearance;
  onSelect: (id: string) => void;
  onStatusChange: (status: MapStatus) => void;
}
