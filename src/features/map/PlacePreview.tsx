import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { ArrowRightIcon } from 'phosphor-react-native';
import type { Place } from '../places/types';
import { Label } from '../../components/ui';
import { useTheme } from '../../theme/ThemeProvider';
import { radii, space } from '../../theme/tokens';
import { formatMinutes } from '../planning/travel';

export function PlacePreview({ place }: { place: Place }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${place.name}`}
      onPress={() => router.push({ pathname: '/place/[id]', params: { id: place.id } })}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        minHeight: 72,
        padding: space.lg,
        borderRadius: radii.medium,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flex: 1, gap: space.xs }}>
        <Label>{place.name}</Label>
        <Label size="small" tone="textMuted">
          {place.locality} · {formatMinutes(place.visitMinutes)} suggested visit
        </Label>
      </View>
      <ArrowRightIcon size={24} color={colors.primary} />
    </Pressable>
  );
}
