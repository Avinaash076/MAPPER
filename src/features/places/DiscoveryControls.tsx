import { View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { Chip, Field, Label, layout } from '../../components/ui';
import { useApp } from '../state/AppProvider';
import { CityPicker } from '../setup/CityPicker';
interface Props {
  view: 'map' | 'list';
  onViewChange: (view: 'map' | 'list') => void;
  onFilters: () => void;
  count: number;
}
export function DiscoveryControls({ view, onViewChange, onFilters, count }: Props) {
  const { state, dispatch } = useApp();
  return (
    <View style={layout.section}>
      <AppHeader />
      <Label size="heading" accessibilityRole="header">
        Discover
      </Label>
      <Label size="small">Search the map</Label>
      <Field
        accessibilityLabel="Search the map by place, locality or interest"
        placeholder="Place, town or interest"
        value={state.filters.query}
        onChangeText={(query) => dispatch({ type: 'filters', filters: { query } })}
        autoCorrect={false}
        returnKeyType="search"
      />
      <View style={layout.between}>
        <Chip label="Filters" onPress={onFilters} />
        <Chip
          label={view === 'map' ? `View list (${count})` : 'View map'}
          onPress={() => onViewChange(view === 'map' ? 'list' : 'map')}
        />
      </View>
      <CityPicker />
    </View>
  );
}
