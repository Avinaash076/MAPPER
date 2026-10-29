import type React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StorageBanner } from '../../features/state/StorageBanner';
import { useUIStyles } from './styles';

export function Screen({ children }: React.PropsWithChildren) {
  const styles = useUIStyles();
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.screen}
      >
        <StorageBanner />
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
