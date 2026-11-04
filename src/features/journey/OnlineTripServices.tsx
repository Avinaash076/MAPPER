import { View } from 'react-native';
import { Button, Label, Notice, layout } from '../../components/ui';
import { Disclosure } from '../../components/ui/Disclosure';
import { travelServicesEnabled } from '../../services/travel/client';
import { SignInPanel } from '../contributions/SignInPanel';
import type { OnlineTrip } from './useOnlineTrip';
import { ProviderCredits } from '../../components/ProviderCredits';

export function OnlineTripServices({
  online,
  hasTransport,
}: {
  online: OnlineTrip;
  hasTransport: boolean;
}) {
  if (!travelServicesEnabled)
    return (
      <Notice>
        Online routes, forecasts and AI are not configured. Local place browsing and illustrative
        trip estimates remain available.
      </Notice>
    );
  return (
    <View style={layout.section}>
      <Label size="heading">Route & destination forecast</Label>
      <Label size="small" tone="textMuted">
        When you check, trip waypoints are sent to Geoapify and an approximate destination location
        to Open-Meteo. Private contribution drafts are excluded.
      </Label>
      {!online.account ? (
        <SignInPanel purpose="travel" />
      ) : (
        <>
          <Button
            label={
              online.route.busy || online.weather.busy
                ? 'Checking online services…'
                : 'Check route and weather'
            }
            secondary
            disabled={online.route.busy || online.weather.busy}
            onPress={() => {
              void online.refresh();
            }}
          />
          {!hasTransport ? (
            <Label size="small">
              Choose transport in trip settings to request a route. You can check the destination
              forecast now.
            </Label>
          ) : null}
          <Disclosure title="Online services account">
            <SignInPanel purpose="travel" />
          </Disclosure>
        </>
      )}
      {online.route.error ? <Notice warning>Route: {online.route.error}</Notice> : null}
      {online.weather.error ? <Notice warning>Weather: {online.weather.error}</Notice> : null}
      {online.weather.data ? (
        <View style={layout.section}>
          <Label size="heading">{online.weather.data.date} · destination forecast</Label>
          <Label>
            {online.weather.data.minC.toFixed(0)}–{online.weather.data.maxC.toFixed(0)} °C ·{' '}
            {online.weather.data.rainChance === null
              ? 'Rain probability unavailable'
              : `${online.weather.data.rainChance}% maximum rain probability`}
          </Label>
          <Label size="small" tone="textMuted">
            Open-Meteo · Asia/Kolkata · fetched{' '}
            {new Date(online.weather.data.fetchedAt).toLocaleString()}. Forecasts can change and do
            not confirm waterfall or road safety.
          </Label>
          <ProviderCredits provider="Open-Meteo" />
        </View>
      ) : null}
    </View>
  );
}
