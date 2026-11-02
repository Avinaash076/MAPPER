import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Chip, Label, layout, Screen } from '../../components/ui';
import { experiences } from './model';
import { useJourney } from './JourneyProvider';
import { JourneyNotice } from './JourneyNotice';

export function ExperienceScreen() {
  const journey = useJourney();
  if (!journey.state.destination || !journey.state.start)
    return (
      <Screen>
        <Label size="title">Choose where your trip starts</Label>
        <Button label="Choose starting point" onPress={() => router.replace('/starting-point')} />
      </Screen>
    );
  return (
    <Screen>
      <Label size="eyebrow" tone="accent">
        2 OF 3 · EXPERIENCE
      </Label>
      <Label size="title" accessibilityRole="header">
        How would you like to explore?
      </Label>
      <Label tone="textMuted">
        {journey.state.start.name} → {journey.state.destination.name}
      </Label>
      <JourneyNotice />
      {experiences.map((option) => (
        <View key={option.id} style={layout.section}>
          <Chip
            label={option.title}
            selected={journey.state.experience === option.id}
            onPress={() => {
              if (journey.state.experience !== option.id)
                journey.update({ experience: option.id, stopIds: [] });
            }}
          />
          <Label size="small" tone="textMuted">
            {option.description}
          </Label>
        </View>
      ))}
      <Button label="Continue to trip settings" onPress={() => router.push('/trip-options')} />
    </Screen>
  );
}
