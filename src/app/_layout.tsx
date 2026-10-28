import React from 'react';
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
import { Label, Panel, Screen } from '../components/ui';
import { colors, fonts } from '../theme/tokens';

export { ErrorBoundary } from 'expo-router';
function AppNavigation() {
  const { ready } = useApp();
  if (!ready)
    return (
      <Screen>
        <Label size="eyebrow">NORTHERN TRAILS</Label>
        <Label size="title">A little closer to your next adventure.</Label>
        <Panel>
          <Label>Loading your places and plan…</Label>
        </Panel>
      </Screen>
    );
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="place/[id]"
        options={{
          headerShown: true,
          title: 'A closer look',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.green,
          headerTitleStyle: { fontFamily: fonts.semibold },
          animation: 'default',
        }}
      />
    </Stack>
  );
}
export default function RootLayout() {
  const [loaded, error] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  // Bundled fonts require no network. Retain readable platform text if loading fails.
  if (!loaded && !error) return null;
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <AppNavigation />
      </AppProvider>
    </SafeAreaProvider>
  );
}
