import type React from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { space } from '../../theme/tokens';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StorageBanner } from '../../features/state/StorageBanner';
import { useUIStyles } from './styles';

export function Screen({ children }: React.PropsWithChildren) {
  const styles = useUIStyles();
  const { width } = useWindowDimensions();
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[styles.screen, { padding: width < 600 ? space.lg : space.xxl }]}
      >
        <StorageBanner />
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
