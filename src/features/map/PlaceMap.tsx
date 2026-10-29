import { useEffect } from 'react';
import { Label } from '../../components/ui';
import type { PlaceMapProps } from './types';
export function PlaceMap({ onStatusChange }: PlaceMapProps) {
  useEffect(() => onStatusChange('error'), [onStatusChange]);
  return <Label>Map unavailable on this platform. Browse the place list instead.</Label>;
}
