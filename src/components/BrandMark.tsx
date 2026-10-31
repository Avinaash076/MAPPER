import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

export function BrandMark() {
  const { colors } = useTheme();
  return (
    <Svg width={32} height={32} viewBox="0 0 64 64" accessible={false}>
      <Path
        d="M9 47 22 16 32 36 42 16 55 47"
        fill="none"
        stroke={colors.primary}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={55} cy={47} r={3} fill={colors.primary} />
    </Svg>
  );
}
