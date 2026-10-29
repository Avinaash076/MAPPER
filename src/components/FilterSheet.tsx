import { useState } from 'react';
import { View } from 'react-native';
import { useApp } from '../features/state/AppProvider';
import { distanceOptions, timeOptions, type DiscoveryFilters } from '../features/places/types';
import { TransportChoices } from '../features/setup/TransportChoices';
import { formatMinutes } from '../features/planning/travel';
import { Button, Chip, Label, layout, Notice } from './ui';
import { Sheet } from './ui/Sheet';
export function FilterSheet({ close }: { visible: boolean; close: () => void }) {
  const { state, dispatch } = useApp();
  const [draft, setDraft] = useState<DiscoveryFilters>(state.filters);
  return (
    <Sheet title="Make it your kind of day" onClose={close}>
      <View style={layout.section}>
        <Label size="heading">Transport (optional)</Label>
        <TransportChoices
          selected={draft.transport}
          onChange={(transport) => setDraft({ ...draft, transport })}
        />
      </View>
      <View style={layout.section}>
        <Label size="heading">Distance from town centre</Label>
        <View style={layout.wrap}>
          {distanceOptions.map((radiusKm) => (
            <Chip
              key={radiusKm}
              label={radiusKm + ' km'}
              selected={draft.radiusKm === radiusKm}
              onPress={() => setDraft({ ...draft, radiusKm })}
            />
          ))}
        </View>
      </View>
      {draft.transport !== null && (
        <View style={layout.section}>
          <Label size="heading">Time for the whole outing</Label>
          <View style={layout.wrap}>
            {timeOptions.map((budgetMinutes) => (
              <Chip
                key={budgetMinutes}
                label={formatMinutes(budgetMinutes)}
                selected={draft.budgetMinutes === budgetMinutes}
                onPress={() => setDraft({ ...draft, budgetMinutes })}
              />
            ))}
          </View>
        </View>
      )}
      <Notice>
        {draft.transport
          ? 'Sample travel estimates include a return to town. They do not check roads or current access.'
          : 'Browse without travel-time filtering. Choose transport whenever you want estimates.'}
      </Notice>
      <Button
        label="Show nearby places"
        onPress={() => {
          dispatch({ type: 'filters', filters: draft });
          close();
        }}
      />
    </Sheet>
  );
}
