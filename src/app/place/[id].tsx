import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { Linking, View } from 'react-native';
import { BookmarkSimpleIcon, CheckIcon, PlusIcon } from 'phosphor-react-native';
import { PlacePhoto } from '../../components/PlaceCard';
import { Button, EmptyState, Label, layout, Notice, Panel, Screen } from '../../components/ui';
import { placeRepository } from '../../features/places/repository';
import { categories } from '../../features/places/types';
import { useApp } from '../../features/state/AppProvider';
import { formatMinutes } from '../../features/planning/travel';
import { colors, space } from '../../theme/tokens';
export function generateStaticParams() {
  return placeRepository.list().map((place) => ({ id: place.id }));
}
export default function PlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useApp();
  const [linkError, setLinkError] = React.useState(false);
  const place = placeRepository.get(id);
  const openSource = async (url: string) => {
    try {
      setLinkError(false);
      await Linking.openURL(url);
    } catch {
      setLinkError(true);
    }
  };
  if (!place)
    return (
      <Screen>
        <EmptyState
          title="Place not found"
          message="This place is not in the current sample collection. Discover somewhere else nearby."
          action="Back to Discover"
          onAction={() => router.replace('/')}
        />
      </Screen>
    );
  const saved = state.savedIds.includes(id);
  const added = state.planIds.includes(id);
  return (
    <Screen>
      <Label size="eyebrow" tone="ochre">
        {place.locality.toUpperCase()}
      </Label>
      <Label size="title" accessibilityRole="header">
        {place.name}
      </Label>
      <View style={{ borderRadius: 24, overflow: 'hidden' }}>
        <PlacePhoto place={place} large />
      </View>
      {place.photo && (
        <Label size="small" tone="muted">
          Photo: {place.photo.author} · {place.photo.license}
        </Label>
      )}
      <View style={layout.wrap}>
        {place.categories.map((c) => (
          <Label key={c} size="small" tone="green">
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
            <CheckIcon color={colors.surface} size={20} />
          ) : (
            <PlusIcon color={colors.surface} size={20} />
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
          <BookmarkSimpleIcon color={colors.green} size={20} weight={saved ? 'fill' : 'regular'} />
        }
      />
      <Panel style={{ gap: space.md }}>
        <Label size="heading">Make room for it</Label>
        <Label>Suggested visit: {formatMinutes(place.visitMinutes)}</Label>
        <Label size="small" tone="muted">
          Visit durations and coordinates are approximate sample values.
        </Label>
        <Label>Opening hours: {place.openingHours || 'Not verified'}</Label>
        <Label size="small" tone="muted">
          Entry fees are not verified. Check with the venue before visiting.
        </Label>
      </Panel>
      <View style={layout.section}>
        <Label size="heading">Getting there and getting around</Label>
        <Label tone="muted">{place.access}</Label>
      </View>
      <View style={layout.section}>
        <Label size="heading">A note on the season</Label>
        <Label tone="muted">{place.seasonalNotes}</Label>
      </View>
      <Notice>
        This is a discovery prototype. Current entry conditions, accessibility and transport
        suitability need local confirmation.
      </Notice>
      <View style={layout.section}>
        <Label size="heading">Read more and photo credits</Label>
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
      </View>
    </Screen>
  );
}
