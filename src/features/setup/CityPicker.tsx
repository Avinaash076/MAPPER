import { useState } from 'react';
import { Button, Label } from '../../components/ui';
import { Sheet } from '../../components/ui/Sheet';
import { useApp } from '../state/AppProvider';
import { areas } from '../places/types';
import { useJourney } from '../journey/JourneyProvider';

export function CityPicker({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const { state, dispatch } = useApp();
  const journey = useJourney();
  const city = journey.state.exploreOrigin ?? areas.find((area) => area.id === state.filters.area)!;
  return (
    <>
      <Button
        label={compact ? `${city.name} ▾` : `${city.name} · change city`}
        accessibilityLabel={`Change starting town, currently ${city.name}`}
        secondary
        onPress={() => setOpen(true)}
      />
      {open && (
        <Sheet title="Start exploring from" onClose={() => setOpen(false)}>
          <Label tone="textMuted">Choose a town centre for nearby places.</Label>
          {areas.map((area) => (
            <Button
              key={area.id}
              label={
                (area.id === city.id || `town:${area.id}` === city.id ? 'Selected · ' : '') +
                area.name
              }
              secondary
              onPress={() => {
                dispatch({ type: 'filters', filters: { area: area.id } });
                journey.update({ exploreOrigin: null });
                setOpen(false);
              }}
            />
          ))}
        </Sheet>
      )}
    </>
  );
}
