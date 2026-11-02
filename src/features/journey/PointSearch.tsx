import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Button, Field, Label, layout, Notice, Panel } from '../../components/ui';
import { usePlaceCatalog } from '../places/PlaceCatalogProvider';
import { searchDestinations, townPoints, type TravelPoint } from './model';

export function PointSearch({
  label,
  selected,
  onSelect,
  recent = [],
}: {
  label: string;
  selected: TravelPoint | null;
  onSelect: (point: TravelPoint | null) => void;
  recent?: TravelPoint[];
}) {
  const catalog = usePlaceCatalog();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchDestinations(query, catalog.places), [query, catalog.places]);
  function choose(point: TravelPoint) {
    onSelect(point);
  }
  const choices = query.trim() ? results : recent.length ? recent : townPoints();
  return (
    <View style={layout.section}>
      <Label size="small">{label}</Label>
      <Field
        accessibilityLabel={label}
        placeholder="Try Dharwad or Unkal Lake"
        value={query}
        onChangeText={(value) => {
          setQuery(value);
          onSelect(null);
        }}
        autoCorrect={false}
        returnKeyType="search"
      />
      <Label size="small" tone="textMuted">
        Suggestions from our regional catalog · live address search is not connected.
      </Label>
      {catalog.loading && (
        <Label size="small" accessibilityLiveRegion="polite">
          Loading reviewed places; bundled destinations are available.
        </Label>
      )}
      {catalog.error && (
        <View style={layout.section}>
          <Notice>{catalog.error}</Notice>
          <Button
            label="Retry catalog refresh"
            secondary
            onPress={() => {
              void catalog.refresh();
            }}
          />
        </View>
      )}
      <Label size="small" tone="textMuted">
        {query.trim()
          ? `${choices.length} matching destinations`
          : recent.length
            ? 'Recent selections'
            : 'Start with a pilot town'}
      </Label>
      {choices.map((point) => (
        <Button
          key={point.id}
          label={`${selected?.id === point.id ? 'Selected · ' : ''}${point.name}`}
          secondary
          onPress={() => choose(point)}
        />
      ))}
      {query.trim() && !results.length && (
        <Panel style={layout.section}>
          <Label size="heading">No catalog match</Label>
          <Label tone="textMuted">
            Try a pilot town or a shorter place name. Coverage currently focuses on Hubballi,
            Dharwad and Belagavi.
          </Label>
          <Button
            label="Clear search"
            secondary
            onPress={() => {
              setQuery('');
              onSelect(null);
            }}
          />
        </Panel>
      )}
    </View>
  );
}
