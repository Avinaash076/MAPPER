import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Label, layout, Panel } from '../../components/ui';
import { PlacePhoto } from '../../components/PlaceCard';
import { useTheme } from '../../theme/ThemeProvider';
import { formatMinutes } from '../planning/travel';
import type { Place } from './types';
import { space } from '../../theme/tokens';

export function PlaceResult({
  place,
  selected,
  onSelect,
}: {
  place: Place;
  selected: boolean;
  onSelect: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Panel style={[layout.section, { borderColor: selected ? colors.primary : colors.border }]}>
      <View style={[layout.row, { alignItems: 'flex-start' }]}>
        <View style={{ width: 80, overflow: 'hidden' }}>
          <PlacePhoto place={place} large thumbnail />
        </View>
        <View style={{ flex: 1, gap: space.xs }}>
          <Label size="heading">{place.name}</Label>
          <Label size="small" tone="textMuted">
            {place.locality} · {formatMinutes(place.visitMinutes)} visit
          </Label>
          {selected && (
            <Label size="small" tone="primary">
              Selected on map
            </Label>
          )}
        </View>
      </View>
      <View style={layout.between}>
        <Button
          label="View details"
          onPress={() => router.push({ pathname: '/place/[id]', params: { id: place.id } })}
          secondary
        />
        {!selected && <Button label="Show on map" secondary onPress={onSelect} />}
      </View>
    </Panel>
  );
}
