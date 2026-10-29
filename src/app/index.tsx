import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRightIcon } from 'phosphor-react-native';
import { AppHeader } from '../components/AppHeader';
import { WovenArtwork } from '../components/WovenArtwork';
import { Button, Label } from '../components/ui';
import { useTheme } from '../theme/ThemeProvider';
import { radii, space } from '../theme/tokens';

export default function WelcomeScreen() {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, maxWidth: 960, width: '100%', alignSelf: 'center' }}
      >
        <View style={{ paddingHorizontal: space.xl, paddingBottom: space.sm }}>
          <AppHeader />
        </View>
        <View
          style={{
            flex: 1,
            minHeight: 380,
            overflow: 'hidden',
            borderRadius: radii.large,
            marginHorizontal: space.lg,
            justifyContent: 'flex-end',
          }}
        >
          <WovenArtwork style={StyleSheet.absoluteFill} />
          <View
            style={{
              margin: space.lg,
              padding: space.xl,
              gap: space.md,
              borderRadius: radii.medium,
              backgroundColor: '#12251CF0',
            }}
          >
            <Label size="eyebrow" style={{ color: '#D8E7D6' }}>
              NORTHERN KARNATAKA, AT YOUR PACE
            </Label>
            <Label size="title" accessibilityRole="header" style={{ color: '#FFFFFF' }}>
              A little nearby.{'\n'}A lot to discover.
            </Label>
            <Label style={{ color: '#FFFFFF' }}>
              Quiet lakes. Stories in stone. A day that feels like yours.
            </Label>
            <Label size="small" style={{ color: '#D8E7D6' }}>
              An illustrated invitation to explore
            </Label>
          </View>
        </View>
        <View style={{ padding: space.xl, gap: space.md }}>
          <Button
            label="Plan my day"
            onPress={() => router.push('/setup')}
            icon={<ArrowRightIcon size={20} color={colors.onPrimary} />}
          />
          <Button label="Explore map" secondary onPress={() => router.push('/discover')} />
          <Label size="small" tone="textMuted" style={{ textAlign: 'center' }}>
            Hubballi · Dharwad · Belagavi
          </Label>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
