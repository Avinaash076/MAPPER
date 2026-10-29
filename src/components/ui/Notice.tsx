import { useTheme } from '../../theme/ThemeProvider';
import type React from 'react';
import { View } from 'react-native';
import { WarningCircleIcon } from 'phosphor-react-native';

import { Label } from './Label';
import { useUIStyles } from './styles';

export function Notice({
  children,
  warning = false,
}: React.PropsWithChildren<{ warning?: boolean }>) {
  const { colors } = useTheme();
  const styles = useUIStyles();
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.notice, warning && { backgroundColor: colors.dangerSoft }]}
    >
      {warning && <WarningCircleIcon size={20} color={colors.danger} />}
      <View style={{ flex: 1 }}>
        <Label size="small" tone={warning ? 'danger' : 'textMuted'}>
          {children}
        </Label>
      </View>
    </View>
  );
}
