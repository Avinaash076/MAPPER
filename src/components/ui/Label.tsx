import { Text, type TextProps } from 'react-native';
import { colors } from '../../theme/tokens';
import { styles } from './styles';

export function Label({
  style,
  tone = 'ink',
  size = 'body',
  ...props
}: TextProps & {
  tone?: keyof typeof colors;
  size?: 'body' | 'small' | 'title' | 'heading' | 'eyebrow';
}) {
  return <Text {...props} style={[styles.text, styles[size], { color: colors[tone] }, style]} />;
}
