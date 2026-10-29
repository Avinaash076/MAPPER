import { router } from 'expo-router';
import { View } from 'react-native';
import type { Place } from '../places/types';
import { Button, Label, layout } from '../../components/ui';
import { formatMinutes } from '../planning/travel';

export function PlacePreview({ place }: { place: Place }) {
  return (
    <View style={layout.section}>
      <Label size="heading">{place.name}</Label>
      <Label size="small" tone="textMuted">
        {place.locality} · {formatMinutes(place.visitMinutes)} suggested visit
      </Label>
      <Button
        label="View place"
        secondary
        onPress={() => router.push({ pathname: '/place/[id]', params: { id: place.id } })}
      />
    </View>
  );
}
