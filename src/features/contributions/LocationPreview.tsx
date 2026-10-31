import { useState } from 'react';
import { View } from 'react-native';
import { Button, Label } from '../../components/ui';
import { PlaceMap } from '../map/PlaceMap';
import { useTheme } from '../../theme/ThemeProvider';
import { useMapAppearance } from '../map/MapPreferences';
import { radii, space } from '../../theme/tokens';
import type { Coordinates, Place } from '../places/types';
import type { MapStatus } from '../map/types';

const noPlaces: Place[] = [];
const ignoreSelection = () => {};
export function LocationPreview({ location }: { location: Coordinates }) {
  const { scheme } = useTheme();
  const { appearance } = useMapAppearance();
  const [status, setStatus] = useState<MapStatus>('loading');
  const [attempt, setAttempt] = useState(0);
  return (
    <View style={{ gap: space.sm }}>
      <View style={{ height: 240, borderRadius: radii.medium, overflow: 'hidden' }}>
        <PlaceMap
          key={attempt}
          places={noPlaces}
          center={location}
          locationPin={location}
          selectedId="private-location"
          zoom={14}
          scheme={scheme}
          appearance={appearance}
          onSelect={ignoreSelection}
          onStatusChange={setStatus}
        />
      </View>
      <Label size="small" tone="textMuted">
        Private pin preview · map needs a connection. Pan or zoom to check the surroundings; this
        does not move your pin.
      </Label>
      {status === 'error' && (
        <Button
          label="Retry location map"
          secondary
          onPress={() => {
            setStatus('loading');
            setAttempt((value) => value + 1);
          }}
        />
      )}
    </View>
  );
}
