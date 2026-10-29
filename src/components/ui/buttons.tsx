import { useTheme } from '../../theme/ThemeProvider';
import type React from 'react';
import { useState } from 'react';
import { CheckIcon } from 'phosphor-react-native';
import { Pressable } from 'react-native';
import { fonts } from '../../theme/tokens';
import { Label } from './Label';
import { useUIStyles } from './styles';

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
  const { colors } = useTheme();
  const styles = useUIStyles();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.button,
        focused && styles.focus,
        secondary && styles.secondary,
        disabled && { opacity: 0.45 },
        pressed && { opacity: 0.75 },
      ]}
    >
      {icon}
      <Label
        style={{
          color: secondary ? colors.primary : colors.onPrimary,
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
  const styles = useUIStyles();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      disabled={disabled}
      style={({ pressed }) => [
        styles.iconButton,
        focused && styles.focus,
        { opacity: disabled ? 0.3 : pressed ? 0.6 : 1 },
      ]}
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
  const { colors } = useTheme();
  const styles = useUIStyles();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.chip,
        focused && styles.focus,
        selected && styles.chipSelected,
        pressed && { opacity: 0.7 },
      ]}
    >
      {icon}
      {selected && <CheckIcon size={16} color={colors.onPrimary} />}
      <Label
        size="small"
        style={{ color: selected ? colors.onPrimary : colors.text, fontFamily: fonts.semibold }}
      >
        {label}
      </Label>
    </Pressable>
  );
}
