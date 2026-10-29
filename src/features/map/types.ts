import type { Coordinates, Place } from '../places/types';
import type { ColorScheme } from '../../theme/preferences';
export type MapStatus = 'loading' | 'ready' | 'error';
export interface PlaceMapProps {
  places: Place[];
  center: Coordinates;
  selectedId: string | null;
  scheme: ColorScheme;
  onSelect: (id: string) => void;
  onStatusChange: (status: MapStatus) => void;
}
