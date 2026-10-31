import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { CheckIcon } from 'phosphor-react-native';
import { Button, Label, layout, Notice } from '../../components/ui';
import { Sheet } from '../../components/ui/Sheet';
import { PlaceMap } from './PlaceMap';
import { useMapAppearance } from './MapPreferences';
import { useTheme } from '../../theme/ThemeProvider';
import { radii, space } from '../../theme/tokens';
import type { Coordinates } from '../places/types';
import type { MapStatus } from './types';

const ignoreSelection = () => {};
export function MapStyleChoices({ center }: { center: Coordinates }) {
  const { colors, scheme } = useTheme();
  const { appearance, choose, error } = useMapAppearance();
  const [status, setStatus] = useState<Record<string, MapStatus>>({});
  return (
    <View style={layout.section}>
      <Label tone="textMuted">Choose your map. Your app appearance stays independent.</Label>
      <View style={[layout.row, { alignItems: 'stretch' }]}>
        {(['liberty', 'dark'] as const).map((value) => (
          <View
            key={value}
            style={{
              flex: 1,
              borderWidth: appearance === value ? 2 : 1,
              borderColor: appearance === value ? colors.primary : colors.border,
              borderRadius: radii.medium,
              overflow: 'hidden',
            }}
          >
            <View style={{ height: 180 }}>
              <PlaceMap
                places={[]}
                center={center}
                selectedId={null}
                scheme={scheme}
                appearance={value}
                onSelect={ignoreSelection}
                onStatusChange={(next) =>
                  setStatus((previous) =>
                    previous[value] === next ? previous : { ...previous, [value]: next },
                  )
                }
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Use ${value === 'liberty' ? 'Liberty' : 'Dark'} map`}
              accessibilityState={{ selected: appearance === value }}
              onPress={() => choose(value)}
              style={{
                minHeight: 52,
                padding: space.md,
                flexDirection: 'row',
                gap: space.sm,
                alignItems: 'center',
                backgroundColor: appearance === value ? colors.primarySoft : colors.surface,
              }}
            >
              <Label style={{ flex: 1 }}>{value === 'liberty' ? 'Liberty' : 'Dark'}</Label>
              {appearance === value && <CheckIcon size={20} color={colors.primary} />}
            </Pressable>
            {status[value] === 'error' && (
              <Label size="small">Preview unavailable · choice still works</Label>
            )}
          </View>
        ))}
      </View>
      {error && (
        <Notice warning>Map appearance could not be saved. Choose it again to retry.</Notice>
      )}
    </View>
  );
}
export function MapLayers({ center }: { center: Coordinates }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label="Map layers" secondary onPress={() => setOpen(true)} />
      {open && (
        <Sheet title="Choose your map" onClose={() => setOpen(false)}>
          <MapStyleChoices center={center} />
          <Button label="Use this map" onPress={() => setOpen(false)} />
        </Sheet>
      )}
    </>
  );
}
