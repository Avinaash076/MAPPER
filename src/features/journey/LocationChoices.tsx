import { useState } from 'react';
import { View } from 'react-native';
import { Button, Label, layout, Notice, Panel } from '../../components/ui';
import { Disclosure } from '../../components/ui/Disclosure';
import { captureCurrentLocation } from '../contributions/capture';
import { PointSearch } from './PointSearch';
import type { TravelPoint } from './model';

export function LocationChoices({
  selected,
  onSelect,
  destination,
  discovery = false,
}: {
  selected: TravelPoint | null;
  onSelect: (point: TravelPoint | null) => void;
  destination?: TravelPoint | null;
  discovery?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function locate() {
    setBusy(true);
    setError('');
    try {
      const location = await captureCurrentLocation();
      onSelect({
        id: 'device-location',
        name: 'My captured location',
        coordinates: { latitude: location.latitude, longitude: location.longitude },
      });
      if (location.accuracyMeters !== null && location.accuracyMeters > 100)
        setError('GPS accuracy is low. Check the position or choose a town manually.');
    } catch {
      setError(
        'Your location could not be captured. Check permission and location services, retry, or search for a starting location below.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={layout.section}>
      <Button
        label={busy ? 'Finding your location…' : 'Use my current location'}
        secondary
        disabled={busy}
        onPress={() => {
          void locate();
        }}
      />
      <Label size="small" tone="textMuted">
        Location is requested only when you tap. You can always choose a town manually.
      </Label>
      {destination ? (
        <Button
          label="I am already at the destination"
          secondary
          onPress={() => {
            setError('');
            onSelect(destination);
          }}
        />
      ) : null}
      <Disclosure title={discovery ? 'Choose an area manually' : 'Search for a starting location'}>
        <PointSearch
          label={discovery ? 'Town or catalog place' : 'Starting town or catalog place'}
          selected={selected}
          onSelect={onSelect}
        />
      </Disclosure>
      {error ? <Notice warning>{error}</Notice> : null}
      {selected ? (
        <Panel style={layout.section}>
          <Label size="small" tone="primary">
            SELECTED LOCATION
          </Label>
          <Label size="heading">{selected.name}</Label>
          <Label size="small" tone="textMuted">
            {selected.coordinates.latitude.toFixed(4)}, {selected.coordinates.longitude.toFixed(4)}
          </Label>
        </Panel>
      ) : null}
    </View>
  );
}
