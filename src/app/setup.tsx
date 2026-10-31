import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { BackHandler, View } from 'react-native';
import { Button, Chip, Label, layout, Screen } from '../components/ui';
import { Disclosure } from '../components/ui/Disclosure';
import { useApp } from '../features/state/AppProvider';
import { areas } from '../features/places/types';
import { InterestChoices } from '../features/setup/InterestChoices';
import { TransportChoices } from '../features/setup/TransportChoices';
import { MapStyleChoices } from '../features/map/MapStyleChoices';

const steps = [
  {
    name: 'Town',
    title: 'Where shall we start?',
    help: 'Choose a town centre. No location permission needed.',
  },
  {
    name: 'Interests',
    title: 'What would you like to find?',
    help: 'Choose any interests, or keep your options open.',
  },
  {
    name: 'Transport',
    title: 'How will you get around?',
    help: 'A mode helps estimate travel time. You can choose later.',
  },
] as const;

export default function SetupScreen() {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(0);
  const filters = state.filters;
  const current = steps[step];
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
  function finish() {
    dispatch({ type: 'filters', filters: { query: '' } });
    router.replace('/discover');
  }
  function skip() {
    dispatch({ type: 'filters', filters: step === 1 ? { categories: [] } : { transport: null } });
    if (step === 1) setStep(2);
    else finish();
  }
  return (
    <Screen>
      <Label size="small" tone="accent">
        {step + 1} OF 3 · {current.name.toUpperCase()}
      </Label>
      <View style={layout.section}>
        <Label size="title" accessibilityRole="header">
          {current.title}
        </Label>
        <Label tone="textMuted">{current.help}</Label>
      </View>
      {step === 0 && (
        <View style={layout.section}>
          <Label>Starting town</Label>
          {areas.map((area) => (
            <Chip
              key={area.id}
              label={area.name}
              selected={filters.area === area.id}
              onPress={() => dispatch({ type: 'filters', filters: { area: area.id } })}
            />
          ))}
          <Disclosure title="Map appearance · optional">
            <MapStyleChoices center={areas.find((area) => area.id === filters.area)!.coordinates} />
          </Disclosure>
        </View>
      )}
      {step === 1 && (
        <InterestChoices
          selected={filters.categories}
          onChange={(categories) => dispatch({ type: 'filters', filters: { categories } })}
        />
      )}
      {step === 2 && (
        <TransportChoices
          selected={filters.transport}
          onChange={(transport) => dispatch({ type: 'filters', filters: { transport } })}
        />
      )}
      <Button
        label={step === 2 ? 'Show nearby places' : 'Continue'}
        onPress={() => (step < 2 ? setStep(step + 1) : finish())}
      />
      {step > 0 && <Button label="Skip for now" secondary onPress={skip} />}
      {step > 0 && <Button label="Previous step" secondary onPress={() => setStep(step - 1)} />}
      <Label size="small" tone="textMuted">
        Your choices save on this device as you go.
      </Label>
    </Screen>
  );
}
