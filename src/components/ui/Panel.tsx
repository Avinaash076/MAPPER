import type React from 'react';
import { View, type ViewStyle, type StyleProp } from 'react-native';
import { styles } from './styles';

export function Panel({
  children,
  style,
}: React.PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.panel, style]}>{children}</View>;
}
