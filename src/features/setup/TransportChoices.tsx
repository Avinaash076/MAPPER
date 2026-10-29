import { View } from 'react-native';
import { transportLabels, type Transport } from '../places/types';
import { Chip, layout } from '../../components/ui';

interface TransportChoicesProps {
  selected: Transport | null;
  onChange: (transport: Transport | null) => void;
}

export function TransportChoices({ selected, onChange }: TransportChoicesProps) {
  return (
    <View style={layout.wrap}>
      <Chip label="Choose later" selected={selected === null} onPress={() => onChange(null)} />
      {(Object.keys(transportLabels) as Transport[]).map((mode) => (
        <Chip
          key={mode}
          label={transportLabels[mode]}
          selected={selected === mode}
          onPress={() => onChange(mode)}
        />
      ))}
    </View>
  );
}
