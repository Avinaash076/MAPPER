import { useState } from 'react';
import { router } from 'expo-router';
import { Button, Label, Screen } from '../../components/ui';
import { useJourney } from './JourneyProvider';
import { LocationChoices } from './LocationChoices';
import { JourneyNotice } from './JourneyNotice';

export function StartingPointScreen() {
  const journey = useJourney();
  const [start, setStart] = useState(journey.state.start);
  if (!journey.state.destination)
    return (
      <Screen>
        <Label size="title">Choose your destination first</Label>
        <Button label="Search destinations" onPress={() => router.replace('/destination')} />
      </Screen>
    );
  return (
    <Screen>
      <Label size="eyebrow" tone="accent">
        1 OF 3 · STARTING POINT
      </Label>
      <Label size="title" accessibilityRole="header">
        Where will you set off?
      </Label>
      <Label tone="textMuted">
        Going to {journey.state.destination.name}. Choose a starting location, or explore from the
        destination itself.
      </Label>
      <JourneyNotice />
      <LocationChoices
        selected={start}
        onSelect={setStart}
        destination={journey.state.destination}
      />
      <Button
        label="Choose your travel experience"
        disabled={!start || !journey.canWrite}
        onPress={() => {
          journey.update({ start });
          router.push('/trip-experience');
        }}
      />
    </Screen>
  );
}
