import React, { useState } from 'react';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  ArrowUpRightIcon,
  BookmarkSimpleIcon,
  ClockIcon,
  MountainsIcon,
} from 'phosphor-react-native';
import { colors, radii, space } from '../theme/tokens';
import { type Place, areas } from '../features/places/types';
import { photoAssets } from '../features/places/photoAssets';
import { distanceKm, estimateTravelMinutes, formatMinutes } from '../features/planning/travel';
import { useApp } from '../features/state/AppProvider';
import { IconButton, Label, layout } from './ui';

export function PlacePhoto({ place, large = false }: { place: Place; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const source = photoAssets[place.id];
  return (
    <View style={[styles.photo, large && { aspectRatio: 1.25 }]}>
      {source && !failed ? (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          accessibilityLabel={`Photo of ${place.name}`}
          onError={() => setFailed(true)}
        />
      ) : (
        <View style={styles.placeholder}>
          <MountainsIcon size={40} color={colors.green} weight="duotone" />
          <Label size="small" tone="green">
            {failed ? 'Photo unavailable' : 'Destination photo coming soon'}
          </Label>
        </View>
      )}
    </View>
  );
}
export function PlaceCard({ place }: { place: Place }) {
  const { state, dispatch } = useApp();
  const saved = state.savedIds.includes(place.id);
  const origin = areas.find((a) => a.id === state.filters.area)!.coordinates;
  const distance = distanceKm(origin, place.coordinates);
  const travel = estimateTravelMinutes(origin, place.coordinates, state.filters.transport);
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Explore ${place.name}`}
        onPress={() => router.push({ pathname: '/place/[id]', params: { id: place.id } })}
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      >
        <PlacePhoto place={place} />
        <View style={styles.body}>
          <View style={layout.between}>
            <Label size="eyebrow" tone="ochre">
              {place.categories[0].toUpperCase()}
            </Label>
            <ArrowUpRightIcon size={20} color={colors.green} />
          </View>
          <Label size="heading">{place.name}</Label>
          <Label size="small" tone="muted">
            {place.locality}
          </Label>
          <View style={layout.wrap}>
            <Label size="small" tone="muted">
              {distance.toFixed(1)} km straight line
            </Label>
            <Label size="small" tone="muted">
              · ~{formatMinutes(travel)} away
            </Label>
          </View>
        </View>
      </Pressable>
      <View style={styles.footer}>
        <View style={layout.row}>
          <ClockIcon size={18} color={colors.muted} />
          <Label size="small" tone="muted">
            {formatMinutes(place.visitMinutes)} visit
          </Label>
        </View>
        <IconButton
          label={`${saved ? 'Unsave' : 'Save'} ${place.name}`}
          onPress={() => dispatch({ type: 'toggleSaved', id: place.id })}
        >
          <BookmarkSimpleIcon size={24} color={colors.green} weight={saved ? 'fill' : 'regular'} />
        </IconButton>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.large,
    overflow: 'hidden',
    borderColor: colors.line,
    borderWidth: 1,
  },
  photo: { aspectRatio: 1.8, backgroundColor: colors.paleGreen },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
    gap: space.md,
  },
  body: { padding: space.lg, gap: space.sm },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
});
