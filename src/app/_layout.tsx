import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { AppProvider, useApp } from '../features/state/AppProvider';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';
import { useReducedMotion } from '../theme/useReducedMotion';
import { Label, Panel, Screen } from '../components/ui';
import { AppearancePicker } from '../components/AppearancePicker';
import { fonts } from '../theme/tokens';
import { PlaceCatalogProvider } from '../features/places/PlaceCatalogProvider';
import { MapPreferences } from '../features/map/MapPreferences';
import { JourneyProvider, useJourney } from '../features/journey/JourneyProvider';
export { ErrorBoundary } from 'expo-router';
function AppNavigation() {
  const { colors, scheme, ready: themeReady } = useTheme();
  const { ready } = useApp();
  const { ready: journeyReady } = useJourney();
  const reducedMotion = useReducedMotion();
  if (!ready || !themeReady || !journeyReady)
    return (
      <Screen>
        <Label size="eyebrow">NORTHERN TRAILS</Label>
        <Panel>
          <Label>Opening your little corner of Karnataka...</Label>
        </Panel>
      </Screen>
    );
  const header = {
    headerShown: true,
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.primary,
    headerTitleStyle: { fontFamily: fonts.semibold },
    headerRight: () => <AppearancePicker />,
  };
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: reducedMotion ? 'none' : 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="setup" options={{ ...header, title: 'Your kind of day' }} />
        <Stack.Screen name="destination" options={{ ...header, title: 'Choose destination' }} />
        <Stack.Screen name="surprise" options={{ ...header, title: 'Discover nearby' }} />
        <Stack.Screen name="starting-point" options={{ ...header, title: 'Starting point' }} />
        <Stack.Screen name="trip-experience" options={{ ...header, title: 'Travel experience' }} />
        <Stack.Screen name="trip-options" options={{ ...header, title: 'Trip settings' }} />
        <Stack.Screen name="trip-map" options={{ ...header, title: 'Your trip' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="place/[id]" options={{ ...header, title: 'A closer look' }} />
        <Stack.Screen name="contributions" options={{ ...header, title: 'Community' }} />
        <Stack.Screen name="contribute" options={{ ...header, title: 'Share a place' }} />
        <Stack.Screen name="assistant" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
export default function RootLayout() {
  const [loaded, error] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  if (!loaded && !error) return null;
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PlaceCatalogProvider>
          <AppProvider>
            <JourneyProvider>
              <MapPreferences>
                <AppNavigation />
              </MapPreferences>
            </JourneyProvider>
          </AppProvider>
        </PlaceCatalogProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
