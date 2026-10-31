import { View } from 'react-native';
import type { ReactNode } from 'react';
import { BrandMark } from './BrandMark';
import { Label, layout } from './ui';
import { AppearancePicker } from './AppearancePicker';

export function AppHeader({ label = 'MAPPER', action }: { label?: string; action?: ReactNode }) {
  return (
    <View style={layout.between}>
      <View style={[layout.row, { flex: 1 }]}>
        <BrandMark />
        <Label size="eyebrow" tone="primary">
          {label}
        </Label>
      </View>
      {action}
      <AppearancePicker />
    </View>
  );
}
