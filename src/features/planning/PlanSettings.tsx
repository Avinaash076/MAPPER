import { useState } from 'react';
import { View } from 'react-native';
import { Button, Chip, Label, layout } from '../../components/ui';
import { Sheet } from '../../components/ui/Sheet';
import { useApp } from '../state/AppProvider';
import { areas, timeOptions } from '../places/types';
import { TransportChoices } from '../setup/TransportChoices';
import { formatMinutes } from './travel';

export function PlanSettings({ close }: { close: () => void }) {
  const { state, dispatch } = useApp();
  const [draft, setDraft] = useState(state.filters);
  return (
    <Sheet title="Your day settings" onClose={close}>
      <View style={layout.section}>
        <Label size="heading">Start and finish</Label>
        <View style={layout.wrap}>
          {areas.map((area) => (
            <Chip
              key={area.id}
              label={area.name}
              selected={area.id === draft.area}
              onPress={() => setDraft({ ...draft, area: area.id })}
            />
          ))}
        </View>
        <Label size="small" tone="textMuted">
          Uses the town centre. This also updates your discovery area.
        </Label>
      </View>
      <View style={layout.section}>
        <Label size="heading">Getting around</Label>
        <TransportChoices
          selected={draft.transport}
          onChange={(transport) => setDraft({ ...draft, transport })}
        />
      </View>
      <View style={layout.section}>
        <Label size="heading">Time available</Label>
        <View style={layout.wrap}>
          {timeOptions.map((budgetMinutes) => (
            <Chip
              key={budgetMinutes}
              label={formatMinutes(budgetMinutes)}
              selected={budgetMinutes === draft.budgetMinutes}
              onPress={() => setDraft({ ...draft, budgetMinutes })}
            />
          ))}
        </View>
        <Label size="small" tone="textMuted">
          Choose transport to include approximate travel time.
        </Label>
      </View>
      <Button
        label="Save day settings"
        onPress={() => {
          dispatch({
            type: 'filters',
            filters: {
              area: draft.area,
              transport: draft.transport,
              budgetMinutes: draft.budgetMinutes,
            },
          });
          close();
        }}
      />
    </Sheet>
  );
}
