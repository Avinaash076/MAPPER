import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Button, Label, Notice, layout } from '../../components/ui';
import { requestTravel, travelServicesEnabled } from '../../services/travel/client';
import type { AddressResult } from '../../services/travel/types';
import { useServiceSession } from '../../services/travel/useServiceSession';
import { SignInPanel } from '../contributions/SignInPanel';
import type { TravelPoint } from './model';
import { ProviderCredits } from '../../components/ProviderCredits';

export function OnlineAddressSearch({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (point: TravelPoint) => void;
}) {
  const account = useServiceSession();
  return (
    <AddressSearchResults
      key={`${account}:${query}`}
      query={query}
      account={account}
      onSelect={onSelect}
    />
  );
}
function AddressSearchResults({
  query,
  account,
  onSelect,
}: {
  query: string;
  account: string | null;
  onSelect: (point: TravelPoint) => void;
}) {
  const [result, setResult] = useState<{ query: string; points: AddressResult[] } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  async function search() {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const points = await requestTravel('search', { query: query.trim() }, controller.signal);
      if (!controller.signal.aborted) setResult({ query, points });
    } catch (error) {
      if (!controller.signal.aborted)
        setError(error instanceof Error ? error.message : 'Search failed. Retry.');
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  if (!travelServicesEnabled)
    return (
      <Label size="small" tone="textMuted">
        Online address search is not configured. The regional catalog works offline.
      </Label>
    );
  return (
    <View style={layout.section}>
      <Label size="small" tone="textMuted">
        Search addresses in India using Geoapify. Only your search text is sent; your GPS location
        is not included.
      </Label>
      {!account ? (
        <SignInPanel purpose="travel" />
      ) : (
        <Button
          label={busy ? 'Searching addresses…' : 'Search online addresses'}
          secondary
          disabled={busy || query.trim().length < 3}
          onPress={() => {
            void search();
          }}
        />
      )}
      {error ? <Notice warning>{error}</Notice> : null}
      {result?.query === query ? (
        <>
          <Label size="small" accessibilityLiveRegion="polite">
            {result.points.length
              ? 'Online address matches'
              : 'No online address match. Try a town and district.'}
          </Label>
          {result.points.map((point) => (
            <Button key={point.id} label={point.name} secondary onPress={() => onSelect(point)} />
          ))}
          <ProviderCredits provider="Geoapify" />
        </>
      ) : null}
    </View>
  );
}
