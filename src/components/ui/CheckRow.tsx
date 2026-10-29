import { Pressable, View } from 'react-native';
import { CheckIcon } from 'phosphor-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Label } from './Label';
import { radii, space } from '../../theme/tokens';

export function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 48,
        gap: space.md,
        paddingVertical: space.sm,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: radii.small,
          borderWidth: 1,
          borderColor: colors.primary,
          backgroundColor: checked ? colors.primary : colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && <CheckIcon size={20} color={colors.onPrimary} />}
      </View>
      <Label style={{ flex: 1 }}>{label}</Label>
    </Pressable>
  );
}
