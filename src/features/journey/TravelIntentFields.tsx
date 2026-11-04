import { View } from 'react-native';
import { Chip, Field, Label, layout } from '../../components/ui';
import type { BudgetPreference } from './model';

export function TravelIntentFields({
  budget,
  travelDate,
  onBudget,
  onDate,
}: {
  budget: BudgetPreference;
  travelDate: string;
  onBudget: (value: BudgetPreference) => void;
  onDate: (value: string) => void;
}) {
  return (
    <View style={layout.section}>
      <Label>Spending preference · optional</Label>
      <View style={layout.wrap}>
        {(
          [
            { id: 'any', label: 'Any budget' },
            { id: 'low', label: 'Keep costs low' },
            { id: 'flexible', label: 'Flexible' },
          ] as const
        ).map((choice) => (
          <Chip
            key={choice.id}
            label={choice.label}
            selected={budget === choice.id}
            onPress={() => onBudget(choice.id)}
          />
        ))}
      </View>
      <Label size="small" tone="textMuted">
        Saved as a preference. Prices are not verified, so this does not filter or rank places yet.
      </Label>
      <Label size="small">Travel date · optional · YYYY-MM-DD</Label>
      <Field
        accessibilityLabel="Optional travel date, year month day"
        placeholder="2026-12-15"
        value={travelDate}
        onChangeText={onDate}
        maxLength={10}
        autoCorrect={false}
      />
      <Label size="small" tone="textMuted">
        Trip details can check a destination forecast for today and the next six days when online
        services are enabled. Seasonal ranking and date-specific access are not verified.
      </Label>
    </View>
  );
}
