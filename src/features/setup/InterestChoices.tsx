import { View } from 'react-native';
import { categories, type Category } from '../places/types';
import { Chip, layout } from '../../components/ui';

interface InterestChoicesProps {
  selected: Category[];
  onChange: (categories: Category[]) => void;
}

export function InterestChoices({ selected, onChange }: InterestChoicesProps) {
  return (
    <View style={layout.wrap}>
      <Chip label="All interests" selected={selected.length === 0} onPress={() => onChange([])} />
      {categories.map((category) => (
        <Chip
          key={category.id}
          label={category.label}
          selected={selected.includes(category.id)}
          onPress={() =>
            onChange(
              selected.includes(category.id)
                ? selected.filter((id) => id !== category.id)
                : [...selected, category.id],
            )
          }
        />
      ))}
    </View>
  );
}
