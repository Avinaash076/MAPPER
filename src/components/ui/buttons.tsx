import type React from 'react';
import { Pressable } from 'react-native';
import { colors, fonts } from '../../theme/tokens';
import { Label } from './Label';
import { styles } from './styles';

export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
  icon,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        disabled && { opacity: 0.45 },
        pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
      ]}
    >
      {icon}
      <Label
        style={{
          color: secondary ? colors.green : colors.surface,
          fontFamily: fonts.semibold,
          flexShrink: 1,
        }}
      >
        {label}
      </Label>
    </Pressable>
  );
}

export function IconButton({
  label,
  onPress,
  children,
  disabled = false,
}: React.PropsWithChildren<{ label: string; onPress: () => void; disabled?: boolean }>) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.iconButton, { opacity: disabled ? 0.3 : pressed ? 0.6 : 1 }]}
    >
      {children}
    </Pressable>
  );
}

export function Chip({
  label,
  selected = false,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && { opacity: 0.7 },
      ]}
    >
      {icon}
      <Label
        size="small"
        style={{ color: selected ? colors.surface : colors.ink, fontFamily: fonts.semibold }}
      >
        {label}
      </Label>
    </Pressable>
  );
}
