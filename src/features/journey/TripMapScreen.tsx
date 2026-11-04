import { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Label, layout, Notice, Panel, Screen } from '../../components/ui';
import { Sheet } from '../../components/ui/Sheet';
import { PlaceMap } from '../map/PlaceMap';
import { MapLayers } from '../map/MapStyleChoices';
import { useMapAppearance } from '../map/MapPreferences';
import type { MapStatus } from '../map/types';
import { useTheme } from '../../theme/ThemeProvider';
import { space } from '../../theme/tokens';
import { usePlaceCatalog } from '../places/PlaceCatalogProvider';
import { useApp } from '../state/AppProvider';
import { useJourney } from './JourneyProvider';
import { experiences } from './model';
import { journeySuggestions } from './routeModel';
import { useOnlineTrip } from './useOnlineTrip';
import { TripDetails } from './TripDetails';
import { JourneyNotice } from './JourneyNotice';
import { ProviderCredits } from '../../components/ProviderCredits';

export function TripMapScreen() {
  const journey = useJourney();
  const { state: app } = useApp();
  const catalog = usePlaceCatalog();
  const online = useOnlineTrip(journey.state, catalog.places);
  const { colors, scheme } = useTheme();
  const { appearance } = useMapAppearance();
  const { panel } = useLocalSearchParams<{ panel?: string }>();
  const [sheet, setSheet] = useState<'details' | 'places' | null>(
    panel === 'details' || panel === 'places' ? panel : null,
  );
  const [status, setStatus] = useState<MapStatus>('loading');
  const [attempt, setAttempt] = useState(0);
  const suggestions = useMemo(
    () =>
      journeySuggestions(catalog.places, journey.state, app.filters.categories, online.route.data),
    [catalog.places, journey.state, app.filters.categories, online.route.data],
  );
  const markers = useMemo(
    () =>
      catalog.places.filter(
        (place) =>
          suggestions.some((item) => item.id === place.id) ||
          journey.state.stopIds.includes(place.id),
      ),
    [catalog.places, suggestions, journey.state.stopIds],
  );
  const points = useMemo(
    () =>
      journey.state.start && journey.state.destination
        ? [
            { ...journey.state.start, id: 'journey:start' },
            { ...journey.state.destination, id: 'journey:destination' },
          ]
        : [],
    [journey.state.start, journey.state.destination],
  );
  if (!journey.state.destination || !journey.state.start)
    return (
      <Screen>
        <Label size="title">Plan a destination first</Label>
        <Button label="Choose destination" onPress={() => router.replace('/destination')} />
      </Screen>
    );
  const alongRoute = ['along-route', 'both'].includes(journey.state.experience);
  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={{ padding: space.lg, gap: space.sm }}>
        <Label size="heading" accessibilityRole="header">
          {journey.state.destination.name}
        </Label>
        <Label size="small" tone="textMuted">
          From {journey.state.start.name} ·{' '}
          {experiences.find((option) => option.id === journey.state.experience)?.title}
        </Label>
      </View>
      <View style={{ flex: 1, minHeight: 220 }}>
        <PlaceMap
          key={attempt}
          places={markers}
          extraPoints={points}
          route={online.route.data?.geometry}
          center={journey.state.destination.coordinates}
          selectedId="journey:destination"
          scheme={scheme}
          appearance={appearance}
          onStatusChange={setStatus}
          onSelect={(id) => setSheet(id.startsWith('journey:') ? 'details' : 'places')}
        />
        <View style={{ position: 'absolute', top: space.md, left: space.md }}>
          <MapLayers center={journey.state.destination.coordinates} />
        </View>
      </View>
      <ScrollView
        style={{ flexGrow: 0, maxHeight: '40%' }}
        contentContainerStyle={{ padding: space.lg, gap: space.md }}
      >
        <JourneyNotice />
        <Label size="small" tone="textMuted">
          Green: start · gold: destination · blue: catalog places.{' '}
          {online.route.data
            ? 'Line: Geoapify route; no live traffic.'
            : 'No online route loaded. Trip details show online service options.'}
        </Label>
        {online.route.data ? <ProviderCredits provider="Geoapify" /> : null}
        {status !== 'ready' ? (
          <View style={layout.section}>
            <Label size="small">
              {status === 'error'
                ? 'Map unavailable. Trip details and the place list still work.'
                : 'Loading the map. Trip details remain available.'}
            </Label>
            {status === 'error' ? (
              <Button
                label="Retry map"
                secondary
                onPress={() => {
                  setStatus('loading');
                  setAttempt((value) => value + 1);
                }}
              />
            ) : null}
          </View>
        ) : null}
        <Button
          label={`Trip details · ${journey.state.stopIds.length} optional ${journey.state.stopIds.length === 1 ? 'stop' : 'stops'}`}
          onPress={() => setSheet('details')}
        />
        {journey.state.experience !== 'direct' ? (
          <Button
            label={
              alongRoute && journey.state.experience === 'along-route' && !online.route.data
                ? 'Check a route for along-route places'
                : `Nearby places · ${suggestions.length}`
            }
            secondary
            onPress={() => setSheet(alongRoute && !online.route.data ? 'details' : 'places')}
          />
        ) : null}
      </ScrollView>
      {sheet === 'details' ? (
        <Sheet title="Your trip preview" onClose={() => setSheet(null)}>
          <TripDetails online={online} onNavigate={() => setSheet(null)} />
        </Sheet>
      ) : null}
      {sheet === 'places' ? (
        <Sheet title="Choose places to explore" onClose={() => setSheet(null)}>
          {alongRoute && !online.route.data ? (
            <Notice>
              Check a route in trip details to find catalog places within your{' '}
              {journey.state.corridorRadiusKm} km corridor. Your preference is saved.
            </Notice>
          ) : null}
          {catalog.error ? <Notice>{catalog.error}</Notice> : null}
          {suggestions.length > 0 ? (
            <Label size="small" tone="textMuted">
              {alongRoute && online.route.data
                ? `Catalog places near the route (${journey.state.corridorRadiusKm} km corridor)`
                : `Around ${journey.state.destination.name} · ${journey.state.destinationRadiusKm} km straight-line radius`}{' '}
              · your discovery interests apply. Near a route does not guarantee road access or a
              short detour.
            </Label>
          ) : null}
          {!suggestions.length ? (
            <Panel style={layout.section}>
              <Label size="heading">No suggestions in this scope</Label>
              <Label tone="textMuted">
                Try destination exploration, a wider destination radius or different interests.
              </Label>
              <Button
                label="Edit experience"
                secondary
                onPress={() => {
                  setSheet(null);
                  router.push('/trip-experience');
                }}
              />
            </Panel>
          ) : null}
          {suggestions.map((place) => (
            <Panel key={place.id} style={layout.section}>
              <Label size="heading">{place.name}</Label>
              <Label size="small" tone="textMuted">
                {place.locality} · {place.visitMinutes} min suggested visit
              </Label>
              <Button
                label="View place details"
                secondary
                onPress={() => {
                  setSheet(null);
                  router.push({ pathname: '/place/[id]', params: { id: place.id } });
                }}
              />
              <Button
                label={
                  journey.state.stopIds.includes(place.id) ? 'Remove from trip' : 'Add to trip'
                }
                secondary
                onPress={() => journey.toggleStop(place.id)}
              />
            </Panel>
          ))}
          <Button label="View trip details" onPress={() => setSheet('details')} />
        </Sheet>
      ) : null}
    </SafeAreaView>
  );
}
