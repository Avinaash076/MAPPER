import { useState } from 'react';
import { View } from 'react-native';
import { useApp } from '../features/state/AppProvider';
import {
  defaultFilters,
  distanceOptions,
  timeOptions,
  type DiscoveryFilters,
} from '../features/places/types';
import { usePlaceCatalog } from '../features/places/PlaceCatalogProvider';
import { filterPlaces } from '../features/places/discovery';
import { TransportChoices } from '../features/setup/TransportChoices';
import { InterestChoices } from '../features/setup/InterestChoices';
import { formatMinutes } from '../features/planning/travel';
import { Button, Chip, Label, layout, Notice } from './ui';
import { Sheet } from './ui/Sheet';
export function FilterSheet({ close }: { close: () => void }) {
  const { state, dispatch } = useApp();
  const [draft, setDraft] = useState<DiscoveryFilters>(state.filters);
  const { places } = usePlaceCatalog();
  const count = filterPlaces(places, draft).length;
  return (
    <Sheet title="Filter nearby places" onClose={close}>
      <Button
        label="Reset filters"
        secondary
        onPress={() => setDraft({ ...defaultFilters, area: draft.area, query: draft.query })}
      />
      <View style={layout.section}>
        <Label size="heading">Interests</Label>
        <InterestChoices
          selected={draft.categories}
          onChange={(categories) => setDraft({ ...draft, categories })}
        />
      </View>
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
        label={`Show ${count} ${count === 1 ? 'place' : 'places'}`}
        onPress={() => {
          dispatch({ type: 'filters', filters: draft });
          close();
        }}
      />
    </Sheet>
  );
}
