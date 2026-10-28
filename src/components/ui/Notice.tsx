import type React from 'react';
import { View } from 'react-native';
import { WarningCircleIcon } from 'phosphor-react-native';
import { colors } from '../../theme/tokens';
import { Label } from './Label';
import { styles } from './styles';

export function Notice({
  children,
  warning = false,
}: React.PropsWithChildren<{ warning?: boolean }>) {
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.notice, warning && { backgroundColor: colors.paleDanger }]}
    >
      {warning && <WarningCircleIcon size={20} color={colors.danger} />}
      <View style={{ flex: 1 }}>
        <Label size="small" tone={warning ? 'danger' : 'muted'}>
          {children}
        </Label>
      </View>
    </View>
  );
}
