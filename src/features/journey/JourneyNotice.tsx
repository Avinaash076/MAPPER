import { Button, Label, layout, Notice } from '../../components/ui';
import { View } from 'react-native';
import { useJourney } from './JourneyProvider';

export function JourneyNotice() {
  const journey = useJourney();
  if (!journey.ready) return <Label>Restoring your journey…</Label>;
  if (!journey.error) return null;
  return (
    <View style={layout.section}>
      <Notice warning>{journey.error}</Notice>
      <Button label="Retry journey storage" secondary onPress={journey.retry} />
    </View>
  );
}
