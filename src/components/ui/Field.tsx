import { useTheme } from '../../theme/ThemeProvider';
import { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { useUIStyles } from './styles';

export function Field(props: TextInputProps) {
  const { colors } = useTheme();
  const styles = useUIStyles();
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.textMuted}
      onFocus={(event) => {
        setFocused(true);
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        props.onBlur?.(event);
      }}
      style={[styles.field, focused && { borderColor: colors.primary }, props.style]}
    />
  );
}
