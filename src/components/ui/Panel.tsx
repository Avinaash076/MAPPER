import type React from 'react';
import { View, type ViewStyle, type StyleProp } from 'react-native';
import { useUIStyles } from './styles';

export function Panel({
  children,
  style,
}: React.PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const styles = useUIStyles();
  return <View style={[styles.panel, style]}>{children}</View>;
}
