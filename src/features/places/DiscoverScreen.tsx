import { useMemo, useState } from 'react';
import { FlatList, ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DiscoveryControls } from './DiscoveryControls';
import { Button, EmptyState, Label, layout, Notice } from '../../components/ui';
import { FilterSheet } from '../../components/FilterSheet';
import { PlaceCard } from '../../components/PlaceCard';
import { useApp } from '../state/AppProvider';
import { StorageBanner } from '../state/StorageBanner';
import { usePlaceCatalog } from './PlaceCatalogProvider';
import { filterPlaces } from './discovery';
import { areas } from './types';
import { DiscoveryMap } from '../map/DiscoveryMap';
import { ContributionEntry, DiscoveryActions } from './DiscoveryActions';
import { PlaceResult } from './PlaceResult';
import { useTheme } from '../../theme/ThemeProvider';
import { space } from '../../theme/tokens';

export function DiscoverScreen() {
  const { colors } = useTheme();
  const { width, height, fontScale } = useWindowDimensions();
  const expanded = width >= 1100 && fontScale < 1.5;
  const { state, dispatch } = useApp();
  const catalog = usePlaceCatalog();
  const [view, setView] = useState<'map' | 'list'>('map');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const results = useMemo(
    () => filterPlaces(catalog.places, state.filters),
    [state.filters, catalog.places],
  );
  const city = areas.find((area) => area.id === state.filters.area)!;
  const selected = results.find((place) => place.id === selectedId) ?? results[0];
  const map = (
    <DiscoveryMap
      places={results}
      center={selectedId ? (selected?.coordinates ?? city.coordinates) : city.coordinates}
      selected={selected}
      onSelect={setSelectedId}
      height={
        expanded
          ? Math.max(420, height - 270)
          : Math.max(300, Math.min(440, height * 0.43 * fontScale))
      }
      onList={() => setView('list')}
    />
  );
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: expanded ? 'row' : 'column',
          maxWidth: 1680,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        <FlatList
          style={
            expanded
              ? { width: 400, flexGrow: 0, borderRightWidth: 1, borderColor: colors.border }
              : { flex: 1 }
          }
          data={expanded || view === 'list' ? results : []}
          keyExtractor={(place) => place.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ padding: expanded ? space.xl : space.lg, gap: space.lg }}
          renderItem={({ item }) =>
            expanded ? (
              <PlaceResult
                place={item}
                selected={selected?.id === item.id}
                onSelect={() => setSelectedId(item.id)}
              />
            ) : (
              <PlaceCard place={item} />
            )
          }
          ListHeaderComponent={
            <View style={layout.section}>
              <DiscoveryControls
                view={view}
                onViewChange={setView}
                onFilters={() => setShowFilters(true)}
                count={results.length}
                expanded={expanded}
              />
              <StorageBanner />
              {catalog.error && <Notice>{catalog.error}</Notice>}
              {!expanded && (
                <>
                  <View
                    style={{ height: view === 'map' ? undefined : 0, overflow: 'hidden' }}
                    pointerEvents={view === 'map' ? 'auto' : 'none'}
                    accessibilityElementsHidden={view !== 'map'}
                    importantForAccessibility={view === 'map' ? 'auto' : 'no-hide-descendants'}
                  >
                    {map}
                  </View>
                  <ContributionEntry />
                </>
              )}
              {!results.length && (
                <EmptyState
                  title="No places match yet"
                  message="Try another interest or a wider distance range."
                  action="Reset search and filters"
                  onAction={() => dispatch({ type: 'resetFilters' })}
                />
              )}
              {expanded && (
                <Label size="small" tone="textMuted">
                  {results.length} places · nearest to {city.name} first
                </Label>
              )}
            </View>
          }
          ListFooterComponent={
            <View style={layout.section}>
              <DiscoveryActions placeId={selected?.id} />
              {catalog.error && (
                <Button
                  label="Refresh community places"
                  secondary
                  onPress={() => {
                    void catalog.refresh();
                  }}
                />
              )}
              <Label size="small" tone="textMuted">
                Sample place information. Check current access locally.
              </Label>
            </View>
          }
        />
        {expanded && (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: space.xl, gap: space.lg }}
          >
            <View style={layout.between}>
              <Label size="heading">Around {city.name}</Label>
              <Label size="small" tone="textMuted">
                Select a place to take a closer look
              </Label>
            </View>
            {map}
            <ContributionEntry />
          </ScrollView>
        )}
      </View>
      {showFilters && <FilterSheet close={() => setShowFilters(false)} />}
    </SafeAreaView>
  );
}
