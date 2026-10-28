import type React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StorageBanner } from '../../features/state/StorageBanner';
import { styles } from './styles';

export function Screen({ children }: React.PropsWithChildren) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
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
