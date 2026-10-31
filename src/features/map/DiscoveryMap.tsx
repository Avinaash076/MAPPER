import { useState } from 'react';
import { View } from 'react-native';
import { Button, Notice } from '../../components/ui';
import { radii, space } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { useMapAppearance } from './MapPreferences';
import { MapLayers } from './MapStyleChoices';
import { PlaceMap } from './PlaceMap';
import { PlacePreview } from './PlacePreview';
import type { Coordinates, Place } from '../places/types';
import type { MapStatus } from './types';

export function DiscoveryMap({
  places,
  center,
  selected,
  onSelect,
  height,
  onList,
}: {
  places: Place[];
  center: Coordinates;
  selected?: Place;
  onSelect: (id: string) => void;
  height: number;
  onList: () => void;
}) {
  const { scheme } = useTheme();
  const { appearance } = useMapAppearance();
  const [status, setStatus] = useState<MapStatus>('loading');
  const [attempt, setAttempt] = useState(0);
  return (
    <View style={{ gap: space.md }}>
      <View style={{ height, borderRadius: radii.large, overflow: 'hidden' }}>
        <PlaceMap
          key={attempt}
          places={places}
          center={center}
          selectedId={selected?.id ?? null}
          scheme={scheme}
          appearance={appearance}
          onSelect={onSelect}
          onStatusChange={setStatus}
        />
        <View style={{ position: 'absolute', top: space.md, left: space.md }}>
          <MapLayers center={center} />
        </View>
        {selected && (
          <View
            style={{ position: 'absolute', left: space.md, right: space.md, bottom: space.xxxl }}
          >
            <PlacePreview place={selected} />
          </View>
        )}
      </View>
      {status !== 'ready' && (
        <Notice warning={status === 'error'}>
          {status === 'error'
            ? 'The map could not fully load. Your place list is still available.'
            : 'Loading the map. You can browse the place list meanwhile.'}
        </Notice>
      )}
      {status !== 'ready' && <Button label="Browse place list" secondary onPress={onList} />}
      {status === 'error' && (
        <Button
          label="Retry map"
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
