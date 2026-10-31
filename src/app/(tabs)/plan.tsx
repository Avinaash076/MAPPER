import { useTheme } from '../../theme/ThemeProvider';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { PathIcon } from 'phosphor-react-native';
import { useApp } from '../../features/state/AppProvider';
import { usePlaceCatalog } from '../../features/places/PlaceCatalogProvider';
import { areas, transportLabels } from '../../features/places/types';
import { formatMinutes, summarizePlan } from '../../features/planning/travel';
import { Button, EmptyState, Label, layout, Notice, Panel, Screen } from '../../components/ui';
import { AppHeader } from '../../components/AppHeader';
import { PlanSettings } from '../../features/planning/PlanSettings';

import { PlanSummaryCard } from '../../features/planning/PlanSummaryCard';
import { PlanStopCard } from '../../features/planning/PlanStopCard';
export default function PlanScreen() {
  const { colors } = useTheme();
  const { state, storageStatus, dispatch } = useApp();
  const catalog = usePlaceCatalog();
  const [showFilters, setShowFilters] = useState(false);
  const [removed, setRemoved] = useState<{ id: string; name: string; index: number } | null>(null);
  const stops = state.planIds.flatMap((id) => {
    const p = catalog.places.find((place) => place.id === id);
    return p ? [p] : [];
  });
  const area = areas.find((a) => a.id === state.filters.area)!;
  const summary =
    state.filters.transport === null
      ? null
      : summarizePlan(
          stops,
          area.coordinates,
          state.filters.transport,
          state.filters.budgetMinutes,
        );
  return (
    <Screen>
      <AppHeader />
      <View style={layout.row}>
        <PathIcon size={24} color={colors.primary} />
        <Label size="eyebrow" tone="primary">
          A DAY, YOUR WAY
        </Label>
      </View>
      <Label size="title" accessibilityRole="header">
        My day plan
      </Label>
      <Label tone="textMuted">Start and finish at {area.name} town centre.</Label>
      {stops.length > 0 && (
        <Button
          label={
            state.filters.transport
              ? `${transportLabels[state.filters.transport]} · ${formatMinutes(state.filters.budgetMinutes)} available`
              : 'Choose transport for travel estimates'
          }
          secondary
          onPress={() => setShowFilters(true)}
        />
      )}
      {removed && (
        <Panel style={layout.section}>
          <Label accessibilityLiveRegion="polite">Removed {removed.name}</Label>
          <Button
            label="Undo removal"
            secondary
            onPress={() => {
              dispatch({ type: 'restoreStop', id: removed.id, index: removed.index });
              setRemoved(null);
            }}
          />
        </Panel>
      )}
      {!stops.length ? (
        <EmptyState
          title="Where shall we begin?"
          message="Explore a place and tap Add to plan. Your stops will appear here in the order you choose."
          action="Find your first stop"
          onAction={() => router.navigate('/discover')}
        />
      ) : (
        <>
          {summary ? (
            <PlanSummaryCard summary={summary} budgetMinutes={state.filters.budgetMinutes} />
          ) : (
            <Panel>
              <Label size="heading">
                {formatMinutes(stops.reduce((total, place) => total + place.visitMinutes, 0))} of
                suggested visits
              </Label>
              <Label tone="textMuted">
                Travel time is not included. Choose transport when you are ready.
              </Label>
            </Panel>
          )}
          {stops.map((place, index) => (
            <PlanStopCard
              key={place.id}
              place={place}
              index={index}
              stopCount={stops.length}
              travelMinutes={summary?.legs[index] ?? null}
              townName={area.name}
              onRemove={() => {
                setRemoved({ id: place.id, name: place.name, index });
                dispatch({ type: 'removeStop', id: place.id });
              }}
            />
          ))}
          {summary && (
            <Label size="small" tone="textMuted">
              ↓ ~{formatMinutes(summary.legs[stops.length])} back to {area.name} town centre
            </Label>
          )}
          <Button
            label="Find another stop"
            secondary
            onPress={() => router.navigate('/discover')}
          />
          <Notice>
            Sample estimates use straight line distances, a detour allowance and assumed speeds.
            They do not check roads, trails, opening hours, weather or vehicle access.
          </Notice>
        </>
      )}
      <Label size="small" tone="textMuted" accessibilityLiveRegion="polite">
        {storageStatus === 'saved'
          ? 'Saved on this device'
          : storageStatus === 'saving'
            ? 'Saving on this device…'
            : 'Changes are not saved yet'}
      </Label>
      {showFilters && <PlanSettings close={() => setShowFilters(false)} />}
    </Screen>
  );
}
