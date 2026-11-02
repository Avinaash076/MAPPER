import { router } from 'expo-router';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRightIcon } from 'phosphor-react-native';
import { AppHeader } from '../../components/AppHeader';
import { WovenArtwork } from '../../components/WovenArtwork';
import { Button, Label, layout } from '../../components/ui';
import { useTheme } from '../../theme/ThemeProvider';
import { radii, space } from '../../theme/tokens';

export function WelcomeScreen() {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const expanded = width >= 900;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          maxWidth: 1200,
          width: '100%',
          alignSelf: 'center',
          padding: space.lg,
          gap: space.lg,
        }}
      >
        <AppHeader />
        <View
          style={{
            flex: 1,
            flexDirection: expanded ? 'row' : 'column',
            gap: expanded ? space.xxxl : space.xl,
            alignItems: expanded ? 'center' : 'stretch',
          }}
        >
          <View
            style={{
              flex: expanded ? 1.15 : undefined,
              overflow: 'hidden',
              borderRadius: radii.large,
            }}
          >
            <WovenArtwork
              style={{ height: expanded ? 560 : Math.min(240, height * 0.28), width: '100%' }}
            />
            <View style={{ padding: space.md, backgroundColor: colors.surface }}>
              <Label size="small" tone="textMuted">
                Karnataka, seen with a little curiosity.
              </Label>
            </View>
          </View>
          <View
            style={[
              layout.section,
              { flex: expanded ? 1 : undefined, paddingHorizontal: space.sm },
            ]}
          >
            <Label size="eyebrow" tone="accent">
              NORTHERN KARNATAKA
            </Label>
            <Label
              accessibilityRole="header"
              size="title"
              style={{ fontSize: expanded ? 48 : 36, lineHeight: expanded ? 56 : 44 }}
            >
              Your next day out{'\n'}starts here.
            </Label>
            <Label tone="textMuted">
              Discover destinations and hidden places across northern Karnataka.
            </Label>
            <View style={layout.section}>
              <Button
                label="I know where I want to go"
                onPress={() => router.push('/destination')}
                icon={<ArrowRightIcon size={20} color={colors.onPrimary} />}
              />
              <Label size="small" tone="textMuted">
                Choose a destination and plan your journey.
              </Label>
            </View>
            <View style={layout.section}>
              <Button label="Surprise me" secondary onPress={() => router.push('/surprise')} />
              <Label size="small" tone="textMuted">
                Discover places based on your interests, location, and budget.
              </Label>
            </View>
            <Label size="small" tone="textMuted">
              Hubballi · Dharwad · Belagavi
            </Label>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
