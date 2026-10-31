import { useTheme } from '../../theme/ThemeProvider';
import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { Linking, View } from 'react-native';
import { BookmarkSimpleIcon, CheckIcon, PlusIcon } from 'phosphor-react-native';
import { PlacePhoto } from '../../components/PlaceCard';
import { Button, EmptyState, Label, layout, Notice, Panel, Screen } from '../../components/ui';
import { placeRepository } from '../../features/places/repository';
import { usePlaceCatalog } from '../../features/places/PlaceCatalogProvider';
import { categories } from '../../features/places/types';
import { useApp } from '../../features/state/AppProvider';
import { formatMinutes } from '../../features/planning/travel';
import { radii, space } from '../../theme/tokens';
import { Disclosure } from '../../components/ui/Disclosure';
export function generateStaticParams() {
  return placeRepository.list().map((place) => ({ id: place.id }));
}
export default function PlaceScreen() {
  const catalog = usePlaceCatalog();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useApp();
  const [linkError, setLinkError] = React.useState(false);
  const place = catalog.places.find((item) => item.id === id);
  const openSource = async (url: string) => {
    try {
      setLinkError(false);
      await Linking.openURL(url);
    } catch {
      setLinkError(true);
    }
  };
  if (!place && catalog.loading)
    return (
      <Screen>
        <Label>Loading place information…</Label>
      </Screen>
    );
  if (!place)
    return (
      <Screen>
        <EmptyState
          title="Place not found"
          message="This place is not in the current sample collection. Discover somewhere else nearby."
          action="Back to Discover"
          onAction={() => router.replace('/discover')}
        />
      </Screen>
    );
  const saved = state.savedIds.includes(id);
  const added = state.planIds.includes(id);
  return (
    <Screen>
      <Label size="eyebrow" tone="accent">
        {place.locality.toUpperCase()}
      </Label>
      <Label size="title" accessibilityRole="header">
        {place.name}
      </Label>
      <View style={{ borderRadius: radii.large, overflow: 'hidden' }}>
        <PlacePhoto place={place} large />
      </View>
      {place.photo && (
        <Label size="small" tone="textMuted">
          Photo: {place.photo.author} · {place.photo.license}
        </Label>
      )}
      <View style={layout.wrap}>
        {place.categories.map((c) => (
          <Label key={c} size="small" tone="primary">
            {categories.find((category) => category.id === c)?.label}
          </Label>
        ))}
      </View>
      <Label>{place.description}</Label>
      <Button
        label={added ? 'Added to your plan' : 'Add to plan'}
        disabled={added}
        onPress={() => dispatch({ type: 'addStop', id })}
        icon={
          added ? (
            <CheckIcon color={colors.onPrimary} size={20} />
          ) : (
            <PlusIcon color={colors.onPrimary} size={20} />
          )
        }
      />
      {added && (
        <Button label="View my day plan" secondary onPress={() => router.navigate('/plan')} />
      )}
      <Button
        label={saved ? 'Saved · tap to remove' : 'Save for another day'}
        secondary
        onPress={() => dispatch({ type: 'toggleSaved', id })}
        icon={
          <BookmarkSimpleIcon
            color={colors.primary}
            size={20}
            weight={saved ? 'fill' : 'regular'}
          />
        }
      />
      <Panel style={{ gap: space.md }}>
        <Label size="heading">Plan your visit</Label>
        <View style={layout.between}>
          <View style={layout.section}>
            <Label size="small" tone="textMuted">
              Suggested visit
            </Label>
            <Label>{formatMinutes(place.visitMinutes)}</Label>
          </View>
          <View style={layout.section}>
            <Label size="small" tone="textMuted">
              Opening hours
            </Label>
            <Label>{place.openingHours || 'Not verified'}</Label>
          </View>
        </View>
        <Label size="small" tone="textMuted">
          Sample duration and coordinates. Confirm fees, current access and transport suitability
          locally before visiting.
        </Label>
      </Panel>
      <Disclosure title="Access & getting around">
        <Label tone="textMuted">{place.access}</Label>
      </Disclosure>
      <Disclosure title="Season & current conditions">
        <Label tone="textMuted">{place.seasonalNotes}</Label>
      </Disclosure>
      <Button
        label="Ask about this place · AI preview"
        secondary
        onPress={() => router.push({ pathname: '/assistant', params: { placeId: id } })}
      />
      <Disclosure title="Sources & photo credits">
        {place.sources.map((source) => (
          <Button
            key={source.url}
            label={source.title}
            secondary
            onPress={() => {
              void openSource(source.url);
            }}
          />
        ))}
        {place.photo && (
          <Button
            label="Photo source and attribution"
            secondary
            onPress={() => {
              void openSource(place.photo!.sourceUrl);
            }}
          />
        )}
        {place.photo?.licenseUrl && (
          <Button
            label="Photo reuse license"
            secondary
            onPress={() => {
              void openSource(place.photo!.licenseUrl!);
            }}
          />
        )}
        {linkError && (
          <Notice warning>Could not open this link. Check your connection and try again.</Notice>
        )}
      </Disclosure>
    </Screen>
  );
}
