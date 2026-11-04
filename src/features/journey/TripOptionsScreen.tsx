import { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Chip, Field, Label, layout, Notice, Screen } from '../../components/ui';
import { Disclosure } from '../../components/ui/Disclosure';
import { TransportChoices } from '../setup/TransportChoices';
import { useJourney } from './JourneyProvider';
import { corridorRadii, destinationRadii, validClock, validTravelDate } from './model';
import { TravelIntentFields } from './TravelIntentFields';
import { JourneyNotice } from './JourneyNotice';

export function TripOptionsScreen() {
  const journey = useJourney();
  const [draft, setDraft] = useState(journey.state);
  const [error, setError] = useState('');
  const aroundDestination = ['destination', 'both'].includes(draft.experience);
  const alongRoute = ['along-route', 'both'].includes(draft.experience);
  function showPlan() {
    if (!validClock(draft.departureTime)) {
      setError('Use a departure time from 00:00 to 23:59.');
      return;
    }
    if (!validTravelDate(draft.travelDate)) {
      setError('Use a valid date in YYYY-MM-DD format, or leave it blank.');
      return;
    }
    journey.update({
      transport: draft.transport,
      departureTime: draft.departureTime,
      destinationRadiusKm: draft.destinationRadiusKm,
      corridorRadiusKm: draft.corridorRadiusKm,
      budget: draft.budget,
      travelDate: draft.travelDate,
    });
    router.navigate('/trip-map');
  }
  if (!journey.state.destination || !journey.state.start)
    return (
      <Screen>
        <Label size="title">Set up your trip first</Label>
        <Button label="Choose a destination" onPress={() => router.replace('/destination')} />
      </Screen>
    );
  return (
    <Screen>
      <Label size="eyebrow" tone="accent">
        3 OF 3 · TRIP SETTINGS
      </Label>
      <Label size="title" accessibilityRole="header">
        Leave room to explore.
      </Label>
      <JourneyNotice />
      {aroundDestination ? (
        <View style={layout.section}>
          <Label size="heading">Around your destination</Label>
          <View style={layout.wrap}>
            {destinationRadii.map((value) => (
              <Chip
                key={value}
                label={`${value} km`}
                selected={draft.destinationRadiusKm === value}
                onPress={() => setDraft({ ...draft, destinationRadiusKm: value })}
              />
            ))}
          </View>
        </View>
      ) : null}
      {alongRoute ? (
        <Disclosure title="Along-route corridor">
          <Label>Distance on either side of a road route</Label>
          <View style={layout.wrap}>
            {corridorRadii.map((value) => (
              <Chip
                key={value}
                label={`${value} km`}
                selected={draft.corridorRadiusKm === value}
                onPress={() => setDraft({ ...draft, corridorRadiusKm: value })}
              />
            ))}
          </View>
          <Label size="small" tone="textMuted">
            Saved separately from destination radius. Check an online route in trip details to see
            catalog places near its geometry. This does not verify a drivable detour or entry
            permission.
          </Label>
        </Disclosure>
      ) : null}
      <View style={layout.section}>
        <Label size="heading">Getting around · optional</Label>
        <TransportChoices
          selected={draft.transport}
          onChange={(transport) => setDraft({ ...draft, transport })}
        />
        <Label size="small" tone="textMuted">
          Choose a mode for travel estimates. Trip details can request an online road route when
          services are configured; offline estimates remain illustrative.
        </Label>
      </View>
      <Disclosure title="Departure, budget & date · optional">
        <Label size="small">Departure time · 24-hour device-local time</Label>
        <Field
          accessibilityLabel="Departure time in 24 hour format"
          placeholder="09:00"
          value={draft.departureTime}
          onChangeText={(departureTime) => setDraft({ ...draft, departureTime })}
          maxLength={5}
        />
        <TravelIntentFields
          budget={draft.budget}
          travelDate={draft.travelDate}
          onBudget={(budget) => setDraft({ ...draft, budget })}
          onDate={(travelDate) => setDraft({ ...draft, travelDate })}
        />
      </Disclosure>
      {error ? <Notice warning>{error}</Notice> : null}
      <Button label="Show my trip" onPress={showPlan} />
    </Screen>
  );
}
