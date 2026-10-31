import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { BackHandler, View } from 'react-native';
import { WovenArtwork } from '../components/WovenArtwork';
import { Button, Chip, Label, layout, Screen } from '../components/ui';
import { useApp } from '../features/state/AppProvider';
import { areas, type DiscoveryFilters } from '../features/places/types';
import { InterestChoices } from '../features/setup/InterestChoices';
import { TransportChoices } from '../features/setup/TransportChoices';
import { radii } from '../theme/tokens';
import { MapStyleChoices } from '../features/map/MapStyleChoices';

export default function SetupScreen() {
  const { state, dispatch } = useApp();
  const [draft, setDraft] = useState<DiscoveryFilters>(state.filters);
  const [step, setStep] = useState(0);
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (step === 0) return false;
        setStep((value) => value - 1);
        return true;
      });
      return () => subscription.remove();
    }, [step]),
  );
  function explore() {
    dispatch({ type: 'filters', filters: { ...draft, query: '' } });
    router.push('/discover');
  }
  return (
    <Screen>
      {step === 1 && <WovenArtwork style={{ height: 160, borderRadius: radii.large }} />}
      <Label size="small" tone="accent">
        {step + 1} OF 4 · MAKE IT YOURS
      </Label>
      <View style={layout.section}>
        <Label size="title" accessibilityRole="header">
          {
            [
              'Choose your map',
              'Where shall we start?',
              'Follow your curiosity',
              'How will you get around?',
            ][step]
          }
        </Label>
        <Label tone="textMuted">
          {
            [
              'A map that feels right to you.',
              'Pick a town centre. No location permission needed.',
              'Choose any interests, or leave it open.',
              'Optional. You can decide later.',
            ][step]
          }
        </Label>
      </View>
      {step === 0 && (
        <MapStyleChoices center={areas.find((area) => area.id === draft.area)!.coordinates} />
      )}
      <View style={[layout.section, { display: step === 1 ? 'flex' : 'none' }]}>
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
      <View style={[layout.section, { display: step === 2 ? 'flex' : 'none' }]}>
        <Label size="heading">Your interests · optional</Label>
        <InterestChoices
          selected={draft.categories}
          onChange={(categories) => setDraft({ ...draft, categories })}
        />
      </View>
      <View style={[layout.section, { display: step === 3 ? 'flex' : 'none' }]}>
        <Label size="heading">Transport · optional</Label>
        <TransportChoices
          selected={draft.transport}
          onChange={(transport) => setDraft({ ...draft, transport })}
        />
        <Label size="small" tone="textMuted">
          Choose later to browse without travel-time estimates.
        </Label>
      </View>
      <Button
        label={step === 3 ? 'Show nearby places' : 'Continue'}
        onPress={() => (step < 3 ? setStep(step + 1) : explore())}
      />
      {step > 0 && <Button label="Previous step" secondary onPress={() => setStep(step - 1)} />}
    </Screen>
  );
}
