import React, { useState } from 'react';
import { View } from 'react-native';
import { CompassIcon, SlidersHorizontalIcon } from 'phosphor-react-native';
import { useApp } from '../../features/state/AppProvider';
import { areas, categories, transportLabels } from '../../features/places/types';
import { placeRepository } from '../../features/places/repository';
import { filterPlaces } from '../../features/places/discovery';
import { formatMinutes } from '../../features/planning/travel';
import {
  Button,
  Chip,
  EmptyState,
  Field,
  Label,
  layout,
  Notice,
  Screen,
} from '../../components/ui';
import { PlaceCard } from '../../components/PlaceCard';
import { FilterSheet } from '../../components/FilterSheet';
import { colors } from '../../theme/tokens';
export default function DiscoverScreen() {
  const { state, dispatch } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const results = filterPlaces(placeRepository.list(), state.filters);
  const area = areas.find((a) => a.id === state.filters.area)!;
  return (
    <Screen>
      <View style={layout.row}>
        <CompassIcon size={24} color={colors.green} weight="duotone" />
        <Label size="eyebrow" tone="green">
          NORTHERN TRAILS
        </Label>
      </View>
      <View style={layout.section}>
        <Label size="title" accessibilityRole="header">
          A little nearby.{'\n'}A lot to discover.
        </Label>
        <Label tone="muted">
          Find a little nature, a piece of history, or a new way to spend your day.
        </Label>
      </View>
      <View style={layout.section}>
        <Label size="eyebrow" tone="muted">
          START EXPLORING FROM
        </Label>
        <View style={layout.wrap}>
          {areas.map((a) => (
            <Chip
              key={a.id}
              label={a.name}
              selected={a.id === state.filters.area}
              onPress={() => dispatch({ type: 'filters', filters: { area: a.id } })}
            />
          ))}
        </View>
      </View>
      <Field
        accessibilityLabel="Search places, localities or categories"
        placeholder="A lake, a temple, a little adventure…"
        value={state.filters.query}
        onChangeText={(query) => dispatch({ type: 'filters', filters: { query } })}
        returnKeyType="search"
        autoCorrect={false}
      />
      <View style={layout.wrap}>
        <Chip
          label="All interests"
          selected={!state.filters.categories.length}
          onPress={() => dispatch({ type: 'filters', filters: { categories: [] } })}
        />
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.label}
            selected={state.filters.categories.includes(category.id)}
            onPress={() =>
              dispatch({
                type: 'filters',
                filters: {
                  categories: state.filters.categories.includes(category.id)
                    ? state.filters.categories.filter((c) => c !== category.id)
                    : [...state.filters.categories, category.id],
                },
              })
            }
          />
        ))}
      </View>
      <Button
        label={`${transportLabels[state.filters.transport]} · ${state.filters.radiusKm} km · ${formatMinutes(state.filters.budgetMinutes)}`}
        accessibilityLabel="Open transport, distance and available time filters"
        secondary
        onPress={() => setShowFilters(true)}
        icon={<SlidersHorizontalIcon size={20} color={colors.green} />}
      />
      <View style={layout.section}>
        <Label size="heading" accessibilityRole="header">
          Around {area.name}
        </Label>
        <Label size="small" tone="muted" accessibilityLiveRegion="polite">
          {results.length} {results.length === 1 ? 'place fits' : 'places fit'} your day · nearest
          first
        </Label>
      </View>
      {!results.length ? (
        <EmptyState
          title="A different kind of day?"
          message="Try another interest, more time or a wider distance range. Reset keeps your starting town."
          action="Reset search and filters"
          onAction={() => dispatch({ type: 'resetFilters' })}
        />
      ) : (
        results.map((place) => <PlaceCard key={place.id} place={place} />)
      )}
      <Notice>
        Curated sample places, approximate coordinates and travel times. Confirm access before
        visiting. Live maps and local questions are coming in later milestones.
      </Notice>
      {showFilters && <FilterSheet visible close={() => setShowFilters(false)} />}
    </Screen>
  );
}
