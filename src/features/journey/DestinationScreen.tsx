import { useState } from 'react';
import { router } from 'expo-router';
import { Button, Label, layout, Panel, Screen } from '../../components/ui';
import { PlacePhoto } from '../../components/PlaceCard';
import { usePlaceCatalog } from '../places/PlaceCatalogProvider';
import { PointSearch } from './PointSearch';
import { useJourney } from './JourneyProvider';
import { JourneyNotice } from './JourneyNotice';
import type { TravelPoint } from './model';

export function DestinationScreen() {
  const journey = useJourney();
  const { places } = usePlaceCatalog();
  const [selected, setSelected] = useState<TravelPoint | null>(journey.state.destination);
  const place = places.find((item) => item.id === selected?.placeId);
  return (
    <Screen>
      <Label size="eyebrow" tone="accent">
        YOUR DESTINATION
      </Label>
      <Label size="title" accessibilityRole="header">
        Where do you want to go?
      </Label>
      <Label tone="textMuted">Choose a destination and plan your journey.</Label>
      <JourneyNotice />
      <PointSearch
        label="Search destinations"
        selected={selected}
        onSelect={setSelected}
        recent={journey.state.recent}
      />
      {selected ? (
        <Panel style={layout.section}>
          {place ? (
            <>
              <PlacePhoto place={place} />
              <Label size="small" tone="textMuted">
                {place.photo
                  ? `Photo: ${place.photo.author} · ${place.photo.license}`
                  : 'Destination photo unavailable'}
              </Label>
            </>
          ) : null}
          <Label size="heading">{selected.name}</Label>
          <Label tone="textMuted">
            {place?.description ??
              'Use the town centre as your destination, then discover places nearby.'}
          </Label>
        </Panel>
      ) : null}
      <Button
        label="Continue to starting point"
        disabled={!selected || !journey.ready || !journey.canWrite}
        onPress={() => {
          if (selected) {
            journey.chooseDestination(selected);
            router.push('/starting-point');
          }
        }}
      />
    </Screen>
  );
}
