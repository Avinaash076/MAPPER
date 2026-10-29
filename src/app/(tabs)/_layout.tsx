import { useTheme } from '../../theme/ThemeProvider';
import { Tabs } from 'expo-router';
import { BookmarkSimpleIcon, CompassIcon, PathIcon } from 'phosphor-react-native';
import { fonts } from '../../theme/tokens';
export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 12 },
        tabBarItemStyle: { paddingVertical: 4 },
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
          tabBarIcon: ({ color }) => <PathIcon size={24} color={String(color)} />,
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
