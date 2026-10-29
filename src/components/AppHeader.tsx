import { View } from 'react-native';
import type { ReactNode } from 'react';
import { CompassIcon } from 'phosphor-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Label, layout } from './ui';
import { AppearancePicker } from './AppearancePicker';

export function AppHeader({
  label = 'NORTHERN TRAILS',
  action,
}: {
  label?: string;
  action?: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={layout.between}>
      <View style={[layout.row, { flex: 1 }]}>
        <CompassIcon size={24} color={colors.primary} weight="duotone" />
        <Label size="eyebrow" tone="primary">
          {label}
        </Label>
      </View>
      {action}
      <AppearancePicker />
    </View>
  );
}
