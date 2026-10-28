import { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { colors } from '../../theme/tokens';
import { styles } from './styles';

export function Field(props: TextInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.muted}
      onFocus={(event) => {
        setFocused(true);
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        props.onBlur?.(event);
      }}
      style={[styles.field, focused && { borderColor: colors.green }, props.style]}
    />
  );
}
