import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DiscoveryControls } from '../../features/places/DiscoveryControls';
import { Button, EmptyState, Label, layout, Notice } from '../../components/ui';
import { FilterSheet } from '../../components/FilterSheet';
import { PlaceCard } from '../../components/PlaceCard';
import { useApp } from '../../features/state/AppProvider';
import { StorageBanner } from '../../features/state/StorageBanner';
import { usePlaceCatalog } from '../../features/places/PlaceCatalogProvider';
import { filterPlaces } from '../../features/places/discovery';
import { areas } from '../../features/places/types';
import { PlaceMap } from '../../features/map/PlaceMap';
import type { MapStatus } from '../../features/map/types';
import { PlacePreview } from '../../features/map/PlacePreview';
import { Disclosure } from '../../components/ui/Disclosure';
import { InterestChoices } from '../../features/setup/InterestChoices';
import { MapLayers } from '../../features/map/MapStyleChoices';
import { useMapAppearance } from '../../features/map/MapPreferences';
import { useTheme } from '../../theme/ThemeProvider';
import { radii, space } from '../../theme/tokens';

export default function DiscoverScreen() {
  const { colors, scheme } = useTheme();
  const { appearance } = useMapAppearance();
  const { state, dispatch } = useApp();
  const catalog = usePlaceCatalog();
  const [view, setView] = useState<'map' | 'list'>('map');
  const [showFilters, setShowFilters] = useState(false);
  const [mapStatus, setMapStatus] = useState<MapStatus>('loading');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const results = useMemo(
    () => filterPlaces(catalog.places, state.filters),
    [state.filters, catalog.places],
  );
  const city = areas.find((area) => area.id === state.filters.area)!;
  const selected = results.find((place) => place.id === selectedId) ?? results[0];
  const reset = () => dispatch({ type: 'resetFilters' });

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <FlatList
        data={view === 'list' ? results : []}
        keyExtractor={(place) => place.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          padding: space.lg,
          gap: space.lg,
          maxWidth: 960,
          width: '100%',
          alignSelf: 'center',
        }}
        renderItem={({ item }) => <PlaceCard place={item} />}
        ListHeaderComponent={
          <View style={layout.section}>
            <DiscoveryControls
              view={view}
              onViewChange={setView}
              onFilters={() => setShowFilters(true)}
              count={results.length}
            />
            <StorageBanner />
            {catalog.error && <Notice>{catalog.error}</Notice>}
            <View
              style={{
                height: view === 'map' ? 360 : 0,
                overflow: 'hidden',
                borderRadius: radii.large,
              }}
              pointerEvents={view === 'map' ? 'auto' : 'none'}
              accessibilityElementsHidden={view !== 'map'}
              importantForAccessibility={view === 'map' ? 'auto' : 'no-hide-descendants'}
            >
              <PlaceMap
                places={results}
                center={city.coordinates}
                selectedId={selected?.id ?? null}
                scheme={scheme}
                appearance={appearance}
                onSelect={setSelectedId}
                onStatusChange={setMapStatus}
              />
              <View style={{ position: 'absolute', top: space.md, left: space.md }}>
                <MapLayers center={city.coordinates} />
              </View>
              {selected && (
                <View
                  style={{
                    position: 'absolute',
                    left: space.md,
                    right: space.md,
                    bottom: space.xxxl,
                  }}
                >
                  <PlacePreview place={selected} />
                </View>
              )}
            </View>
            {view === 'map' && mapStatus !== 'ready' && (
              <Notice warning={mapStatus === 'error'}>
                {mapStatus === 'error'
                  ? 'The map could not fully load. Your place list is still available.'
                  : 'Loading the map. You can browse the list while it loads.'}
              </Notice>
            )}
            {!results.length && (
              <EmptyState
                title="A different kind of day?"
                message="Try another interest or a wider distance range."
                action="Reset search and filters"
                onAction={reset}
              />
            )}
            <Button
              label="Know a place we’ve missed?"
              onPress={() => router.push('/contributions')}
            />
            <Label size="small" tone="textMuted">
              Add its location, your photos and story. Private until reviewed.
            </Label>
          </View>
        }
        ListFooterComponent={
          <View style={layout.section}>
            <Disclosure title="Explore by interest">
              <InterestChoices
                selected={state.filters.categories}
                onChange={(categories) => dispatch({ type: 'filters', filters: { categories } })}
              />
            </Disclosure>
            <Disclosure title="Plan your visit">
              <Label tone="textMuted">
                Open a place and tap Add to plan. In My plan, order your stops and choose transport.
                One local day plan is supported.
              </Label>
              <Button label="Open my plan" secondary onPress={() => router.push('/plan')} />
            </Disclosure>
            <Button
              label="Ask about these places · AI preview"
              secondary
              onPress={() =>
                router.push({ pathname: '/assistant', params: { placeId: selected?.id } })
              }
            />
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
              Place information and coordinates are sample data. Check access locally before
              visiting.
            </Label>
          </View>
        }
      />
      {showFilters && <FilterSheet visible close={() => setShowFilters(false)} />}
    </SafeAreaView>
  );
}
