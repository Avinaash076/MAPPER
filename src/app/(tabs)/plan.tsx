import React, { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { PathIcon } from 'phosphor-react-native';
import { useApp } from '../../features/state/AppProvider';
import { placeRepository } from '../../features/places/repository';
import { areas, transportLabels } from '../../features/places/types';
import { formatMinutes, summarizePlan } from '../../features/planning/travel';
import { Button, EmptyState, Label, layout, Notice, Screen } from '../../components/ui';
import { FilterSheet } from '../../components/FilterSheet';
import { colors } from '../../theme/tokens';
import { PlanSummaryCard } from '../../features/planning/PlanSummaryCard';
import { PlanStopCard } from '../../features/planning/PlanStopCard';
export default function PlanScreen() {
  const { state, storageStatus } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const stops = state.planIds.flatMap((id) => {
    const p = placeRepository.get(id);
    return p ? [p] : [];
  });
  const area = areas.find((a) => a.id === state.filters.area)!;
  const summary = summarizePlan(
    stops,
    area.coordinates,
    state.filters.transport,
    state.filters.budgetMinutes,
  );
  return (
    <Screen>
      <View style={layout.row}>
        <PathIcon size={24} color={colors.green} />
        <Label size="eyebrow" tone="green">
          A DAY, YOUR WAY
        </Label>
      </View>
      <Label size="title" accessibilityRole="header">
        A little plan.{'\n'}Room to explore.
      </Label>
      <Label tone="muted">
        Start and finish at {area.name} town centre. Change the starting town in Discover.
      </Label>
      <Button
        label={`${transportLabels[state.filters.transport]} · ${formatMinutes(state.filters.budgetMinutes)} available`}
        secondary
        onPress={() => setShowFilters(true)}
      />
      {!stops.length ? (
        <EmptyState
          title="Where shall we begin?"
          message="Explore a place and tap Add to plan. Your stops will appear here in the order you choose."
          action="Find your first stop"
          onAction={() => router.navigate('/')}
        />
      ) : (
        <>
          <PlanSummaryCard summary={summary} budgetMinutes={state.filters.budgetMinutes} />
          {stops.map((place, index) => (
            <PlanStopCard
              key={place.id}
              place={place}
              index={index}
              stopCount={stops.length}
              travelMinutes={summary.legs[index]}
              townName={area.name}
            />
          ))}
          <Label size="small" tone="muted">
            ↓ ~{formatMinutes(summary.legs[stops.length])} back to {area.name} town centre
          </Label>
          <Button label="Find another stop" secondary onPress={() => router.navigate('/')} />
          <Notice>
            Sample estimates use straight line distances, a detour allowance and assumed speeds.
            They do not check roads, trails, opening hours, weather or vehicle access.
          </Notice>
        </>
      )}
      <Label size="small" tone="muted" accessibilityLiveRegion="polite">
        {storageStatus === 'saved'
          ? 'Saved on this device'
          : storageStatus === 'saving'
            ? 'Saving on this device…'
            : 'Changes are not saved yet'}
      </Label>
      {showFilters && <FilterSheet visible close={() => setShowFilters(false)} />}
    </Screen>
  );
}
