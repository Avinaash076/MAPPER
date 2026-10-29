import { Text, type TextProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme/palettes';

import { useUIStyles } from './styles';

export function Label({
  style,
  tone = 'text',
  size = 'body',
  ...props
}: TextProps & {
  tone?: keyof ThemeColors;
  size?: 'body' | 'small' | 'title' | 'heading' | 'eyebrow';
}) {
  const { colors } = useTheme();
  const styles = useUIStyles();
  return <Text {...props} style={[styles.text, styles[size], { color: colors[tone] }, style]} />;
}
