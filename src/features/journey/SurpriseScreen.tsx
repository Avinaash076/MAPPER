import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Chip, Label, layout, Notice, Screen } from '../../components/ui';
import { Disclosure } from '../../components/ui/Disclosure';
import { InterestChoices } from '../setup/InterestChoices';
import { useApp } from '../state/AppProvider';
import { areas, type Category } from '../places/types';
import { useJourney } from './JourneyProvider';
import { destinationRadii, townPoints, validTravelDate, type TravelPoint } from './model';
import { LocationChoices } from './LocationChoices';
import { TravelIntentFields } from './TravelIntentFields';
import { JourneyNotice } from './JourneyNotice';

export function SurpriseScreen() {
  const { state, dispatch } = useApp();
  const journey = useJourney();
  const [origin, setOrigin] = useState<TravelPoint | null>(
    journey.state.exploreOrigin ??
      townPoints().find((town) => town.id === `town:${state.filters.area}`)!,
  );
  const [interests, setInterests] = useState<Category[]>(state.filters.categories);
  const [radius, setRadius] = useState(
    journey.state.exploreOrigin &&
      (destinationRadii as readonly number[]).includes(state.filters.radiusKm)
      ? state.filters.radiusKm
      : 25,
  );
  const [budget, setBudget] = useState(journey.state.budget);
  const [date, setDate] = useState(journey.state.travelDate);
  const [error, setError] = useState('');
  function discover() {
    if (!origin) return;
    if (!validTravelDate(date)) {
      setError('Use a valid travel date in YYYY-MM-DD format, or leave it blank.');
      return;
    }
    journey.update({ exploreOrigin: origin, budget, travelDate: date });
    const area = areas.find((item) => `town:${item.id}` === origin.id)?.id ?? state.filters.area;
    dispatch({
      type: 'filters',
      filters: { area, query: '', categories: interests, radiusKm: radius, transport: null },
    });
    router.push('/discover');
  }
  return (
    <Screen>
      <Label size="eyebrow" tone="accent">
        SURPRISE ME
      </Label>
      <Label size="title" accessibilityRole="header">
        Find your kind of nearby.
      </Label>
      <Label tone="textMuted">
        Choose an area. Interests and extra preferences are optional; start exploring whenever you
        are ready.
      </Label>
      <JourneyNotice />
      <LocationChoices selected={origin} onSelect={setOrigin} discovery />
      <View style={layout.section}>
        <Label size="heading">What draws you out? · optional</Label>
        <InterestChoices selected={interests} onChange={setInterests} />
      </View>
      <Disclosure title="Distance, budget & date · optional">
        <Label>Distance around your selected location</Label>
        <View style={layout.wrap}>
          {destinationRadii.map((value) => (
            <Chip
              key={value}
              label={`${value} km`}
              selected={radius === value}
              onPress={() => setRadius(value)}
            />
          ))}
        </View>
        <TravelIntentFields
          budget={budget}
          travelDate={date}
          onBudget={setBudget}
          onDate={setDate}
        />
      </Disclosure>
      {error && <Notice warning>{error}</Notice>}
      <Button
        label="Discover nearby places"
        disabled={!origin || !journey.ready || !journey.canWrite}
        onPress={discover}
      />
      <Label size="small" tone="textMuted">
        Uses the available regional catalog and local filters. AI recommendations are not connected.
      </Label>
    </Screen>
  );
}
