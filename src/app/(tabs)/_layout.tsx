import { useTheme } from '../../theme/ThemeProvider';
import { Tabs } from 'expo-router';
import { BookmarkSimpleIcon, CompassIcon, PathIcon } from 'phosphor-react-native';
import { fonts } from '../../theme/tokens';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function TabLayout() {
  const { colors } = useTheme();
  const { fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 80 + insets.bottom + Math.max(0, fontScale - 1) * 24,
          paddingTop: 8,
          paddingBottom: Math.max(8, insets.bottom),
        },
        tabBarAllowFontScaling: true,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 18 },
        tabBarItemStyle: { paddingVertical: 0 },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <CompassIcon size={24} color={String(color)} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'My plan',
          tabBarIcon: ({ color, focused }) => (
            <PathIcon size={24} color={String(color)} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <BookmarkSimpleIcon
              size={24}
              color={String(color)}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
