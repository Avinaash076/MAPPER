import { useId, useState, type PropsWithChildren } from 'react';
import { Pressable, View } from 'react-native';
import { CaretDownIcon, CaretRightIcon } from 'phosphor-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { space } from '../../theme/tokens';
import { Label } from './Label';
import { layout } from './layout';

export function Disclosure({
  title,
  children,
  initiallyOpen = false,
}: PropsWithChildren<{ title: string; initiallyOpen?: boolean }>) {
  const [open, setOpen] = useState(initiallyOpen);
  const [focused, setFocused] = useState(false);
  const id = useId();
  const { colors } = useTheme();
  const Caret = open ? CaretDownIcon : CaretRightIcon;
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={({ pressed }) => ({
          minHeight: 56,
          paddingVertical: space.lg,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.sm,
          opacity: pressed ? 0.7 : 1,
          outlineWidth: focused ? 2 : 0,
          outlineColor: colors.primary,
          outlineOffset: 2,
        })}
      >
        <Caret size={20} color={colors.text} />
        <Label style={{ flex: 1 }}>{title}</Label>
      </Pressable>
      <View
        nativeID={id}
        style={[
          layout.section,
          { paddingBottom: open ? space.lg : 0, display: open ? 'flex' : 'none' },
        ]}
      >
        {children}
      </View>
    </View>
  );
}
