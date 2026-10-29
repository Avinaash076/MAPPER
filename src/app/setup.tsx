import { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { WovenArtwork } from '../components/WovenArtwork';
import { Button, Chip, Label, layout, Screen } from '../components/ui';
import { useApp } from '../features/state/AppProvider';
import { areas, type DiscoveryFilters } from '../features/places/types';
import { InterestChoices } from '../features/setup/InterestChoices';
import { TransportChoices } from '../features/setup/TransportChoices';
import { radii } from '../theme/tokens';

export default function SetupScreen() {
  const { state, dispatch } = useApp();
  const [draft, setDraft] = useState<DiscoveryFilters>(state.filters);
  function explore() {
    dispatch({ type: 'filters', filters: { ...draft, query: '' } });
    router.push('/discover');
  }
  return (
    <Screen>
      <WovenArtwork style={{ height: 180, borderRadius: radii.large }} />
      <View style={layout.section}>
        <Label size="title" accessibilityRole="header">
          Where shall we start?
        </Label>
        <Label tone="textMuted">Pick your city. Everything else can wait.</Label>
      </View>
      <View style={layout.section}>
        <Label size="heading">Starting city</Label>
        <View style={layout.wrap}>
          {areas.map((area) => (
            <Chip
              key={area.id}
              label={area.name}
              selected={draft.area === area.id}
              onPress={() => setDraft({ ...draft, area: area.id })}
            />
          ))}
        </View>
      </View>
      <View style={layout.section}>
        <Label size="heading">Your interests · optional</Label>
        <InterestChoices
          selected={draft.categories}
          onChange={(categories) => setDraft({ ...draft, categories })}
        />
      </View>
      <View style={layout.section}>
        <Label size="heading">Transport · optional</Label>
        <TransportChoices
          selected={draft.transport}
          onChange={(transport) => setDraft({ ...draft, transport })}
        />
        <Label size="small" tone="textMuted">
          Choose later to browse without travel-time estimates.
        </Label>
      </View>
      <Button label="Show nearby places" onPress={explore} />
    </Screen>
  );
}
