import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Label, layout, Notice, Panel } from '../../components/ui';
import { formatMinutes } from '../planning/travel';
import { usePlaceCatalog } from '../places/PlaceCatalogProvider';
import { useApp } from '../state/AppProvider';
import { useJourney } from './JourneyProvider';
import { arrivalLabel, estimateJourney } from './model';
import { OnlineTripServices } from './OnlineTripServices';
import type { OnlineTrip } from './useOnlineTrip';
import { roadArrivals } from './routeModel';
import { ProviderCredits } from '../../components/ProviderCredits';

export function TripDetails({
  onNavigate,
  online,
}: {
  onNavigate: () => void;
  online: OnlineTrip;
}) {
  const journey = useJourney();
  const { places } = usePlaceCatalog();
  const { dispatch, state } = useApp();
  const estimate = estimateJourney(journey.state, places);
  if (!estimate) return null;
  const road = online.route.data;
  const arrivals = road
    ? roadArrivals(
        road,
        estimate.stops.map((stop) => stop.visitMinutes),
      )
    : null;
  const copyIds = [
    ...journey.state.stopIds,
    ...(journey.state.destination?.placeId ? [journey.state.destination.placeId] : []),
  ].filter((id) => places.some((place) => place.id === id));
  const copied = copyIds.length > 0 && copyIds.every((id) => state.planIds.includes(id));
  return (
    <View style={layout.section}>
      <OnlineTripServices online={online} hasTransport={journey.state.transport !== null} />
      {road ? (
        <Panel style={layout.section}>
          <Label size="heading">
            {(road.distanceMeters / 1000).toFixed(1)} km · Geoapify route
          </Label>
          <Label>
            ~{formatMinutes(Math.ceil(road.durationSeconds / 60))} travel · ~
            {formatMinutes(Math.ceil(road.durationSeconds / 60) + estimate.visitMinutes)} including
            suggested visits
          </Label>
          <Label size="small" tone="textMuted">
            Fetched {new Date(road.fetchedAt).toLocaleString()}. Free-flow model, no live traffic.
            Ordered stops are included; no return leg. Confirm current access and the final approach
            locally.
          </Label>
          <ProviderCredits provider="Geoapify" />
        </Panel>
      ) : null}
      {!road ? (
        <>
          <Notice>
            No online road route has been loaded. Estimates below use straight-line distances, a
            detour allowance and assumed speeds; access and traffic are not checked.
          </Notice>
          <Panel style={layout.section}>
            <Label size="heading">{estimate.straightLineKm.toFixed(1)} km straight-line legs</Label>
            <Label>{formatMinutes(estimate.visitMinutes)} suggested visits</Label>
            <Label>
              {estimate.totalMinutes !== null
                ? `~${formatMinutes(estimate.totalMinutes)} illustrative trip total`
                : 'Choose transport to see illustrative travel times.'}
            </Label>
            {estimate.travelMinutes !== null ? (
              <Label size="small" tone="textMuted">
                ~{formatMinutes(estimate.travelMinutes)} travel · {journey.state.departureTime}{' '}
                departure{journey.state.travelDate ? ` on ${journey.state.travelDate}` : ''} ·
                device-local time
              </Label>
            ) : null}
          </Panel>
        </>
      ) : null}
      <Label size="small" tone="textMuted">
        Start: {journey.state.start?.name}. Ends at your destination; no return leg is included.
      </Label>
      {estimate.stops.map((stop, index) => (
        <Panel key={stop.point.id} style={layout.section}>
          <Label size="small" tone="primary">
            {index + 1 === estimate.stops.length ? 'DESTINATION' : `STOP ${index + 1}`}
          </Label>
          <Label size="heading">{stop.point.name}</Label>
          <Label size="small">
            {arrivals
              ? `Estimated arrival ${arrivalLabel(journey.state.departureTime, arrivals[index])} · road model without live traffic`
              : stop.arrivalMinutes !== null
                ? `Illustrative arrival ${arrivalLabel(journey.state.departureTime, stop.arrivalMinutes)} · ~${formatMinutes(stop.travelMinutes!)} travel`
                : 'Arrival unavailable until transport is chosen'}
          </Label>
          <Label size="small" tone="textMuted">
            {stop.visitMinutes
              ? `${formatMinutes(stop.visitMinutes)} suggested visit`
              : 'Town centre · no visit duration assumed'}
          </Label>
          {journey.state.stopIds.includes(stop.point.id) ? (
            <View style={layout.wrap}>
              <Button
                label="Remove stop"
                secondary
                onPress={() => journey.toggleStop(stop.point.id)}
              />
              <Button
                label="Place details"
                secondary
                onPress={() => {
                  onNavigate();
                  router.push({ pathname: '/place/[id]', params: { id: stop.point.id } });
                }}
              />
            </View>
          ) : null}
        </Panel>
      ))}
      <Button
        label="Edit trip settings"
        secondary
        onPress={() => {
          onNavigate();
          router.push('/trip-options');
        }}
      />
      {copyIds.length > 0 ? (
        <Button
          label={copied ? 'Stops are in My plan' : 'Add these stops to My plan'}
          disabled={copied}
          onPress={() => {
            copyIds.forEach((id) => dispatch({ type: 'addStop', id }));
          }}
        />
      ) : null}
      <Label size="small" tone="textMuted">
        My plan remains a separate town-centre day outing. Copying stops preserves its current order
        and settings.
      </Label>
    </View>
  );
}
