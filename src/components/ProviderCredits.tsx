import { View } from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '../theme/ThemeProvider';
import { fonts, space } from '../theme/tokens';
import { layout } from './ui';

export function ProviderCredits({ provider }: { provider: 'Geoapify' | 'Open-Meteo' }) {
  const { colors } = useTheme();
  const style = {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: space.md,
    minHeight: 48,
    textDecorationLine: 'underline' as const,
  };
  return (
    <View style={layout.wrap}>
      <Link
        href={provider === 'Geoapify' ? 'https://www.geoapify.com/' : 'https://open-meteo.com/'}
        style={style}
      >
        Powered by {provider}
      </Link>
      {provider === 'Geoapify' ? (
        <Link href="https://www.openstreetmap.org/copyright" style={style}>
          © OpenStreetMap contributors
        </Link>
      ) : null}
    </View>
  );
}
