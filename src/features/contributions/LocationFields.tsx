import { useState } from 'react';
import { View } from 'react-native';
import { Button, Field, Label, layout, Notice, Panel } from '../../components/ui';
import { CheckRow } from '../../components/ui/CheckRow';
import { validCoordinates } from './model';
import type { CapturedLocation } from './types';
import { LocationPreview } from './LocationPreview';

interface LocationFieldsProps {
  location: CapturedLocation | null;
  confirmed: boolean;
  capture: () => void;
  onChange: (location: CapturedLocation) => void;
  onConfirm: (confirmed: boolean) => void;
}
export function LocationFields({
  location,
  confirmed,
  capture,
  onChange,
  onConfirm,
}: LocationFieldsProps) {
  const [manual, setManual] = useState(false);
  const [latitude, setLatitude] = useState(location ? String(location.latitude) : '');
  const [longitude, setLongitude] = useState(location ? String(location.longitude) : '');
  const [error, setError] = useState('');
  function toggleManual() {
    if (!manual) {
      setLatitude(location ? String(location.latitude) : '');
      setLongitude(location ? String(location.longitude) : '');
      setError('');
    }
    setManual(!manual);
  }
  function applyCoordinates() {
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (!latitude.trim() || !longitude.trim() || !validCoordinates(lat, lon)) {
      setError('Enter a latitude from −90 to 90 and longitude from −180 to 180.');
      return;
    }
    setError('');
    onChange({
      latitude: lat,
      longitude: lon,
      source: 'manual',
      capturedAt: new Date().toISOString(),
      accuracyMeters: null,
    });
    setManual(false);
  }
  return (
    <Panel style={layout.section}>
      <Label size="heading">1 · Save the place location</Label>
      <Label size="small" tone="textMuted">
        At the place now? Capture it first and finish this draft later. Location is requested only
        when you tap below.
      </Label>
      <Button
        label={location ? 'Capture current location again' : 'Use my current location'}
        secondary
        onPress={capture}
      />
      <Button
        label={manual ? 'Close manual entry' : 'Enter coordinates instead'}
        secondary
        onPress={toggleManual}
      />
      {manual && (
        <View style={layout.section}>
          <Label size="small">Latitude</Label>
          <Field
            accessibilityLabel="Place latitude"
            placeholder="Latitude, e.g. 15.3647"
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="numbers-and-punctuation"
          />
          <Label size="small">Longitude</Label>
          <Field
            accessibilityLabel="Place longitude"
            placeholder="Longitude, e.g. 75.1240"
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numbers-and-punctuation"
          />
          <Button label="Use these coordinates" secondary onPress={applyCoordinates} />
        </View>
      )}
      {error ? <Notice warning>{error}</Notice> : null}
      {location && (
        <>
          <LocationPreview location={location} />
          <Label>
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Label>
          <Label size="small" tone="textMuted">
            {location.source === 'gps'
              ? `GPS accuracy: ${location.accuracyMeters === null ? 'unavailable' : 'about ±' + Math.round(location.accuracyMeters) + ' m'}`
              : 'Manually entered location'}{' '}
            · {new Date(location.capturedAt).toLocaleString()}
          </Label>
          {location.accuracyMeters !== null && location.accuracyMeters > 100 && (
            <Notice>
              Location accuracy is low. Try again in an open area or correct the coordinates before
              sharing.
            </Notice>
          )}
          <CheckRow
            label="I checked that these coordinates mark the place"
            checked={confirmed}
            onChange={onConfirm}
          />
        </>
      )}
    </Panel>
  );
}
