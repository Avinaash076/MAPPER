import { View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { Chip, Field, Label, layout } from '../../components/ui';
import { useApp } from '../state/AppProvider';
import { CityPicker } from '../setup/CityPicker';
import { defaultFilters } from './types';
interface Props {
  view: 'map' | 'list';
  onViewChange: (view: 'map' | 'list') => void;
  onFilters: () => void;
  count: number;
  expanded?: boolean;
}
export function DiscoveryControls({ view, onViewChange, onFilters, count, expanded }: Props) {
  const { state, dispatch } = useApp();
  const filters = state.filters;
  const activeCount =
    Number(filters.categories.length > 0) +
    Number(filters.transport !== null) +
    Number(filters.radiusKm !== defaultFilters.radiusKm) +
    Number(filters.transport !== null && filters.budgetMinutes !== defaultFilters.budgetMinutes);
  return (
    <View style={layout.section}>
      <AppHeader />
      <View style={layout.between}>
        <Label size="heading" accessibilityRole="header">
          Discover
        </Label>
        <CityPicker compact />
      </View>
      <View style={layout.section}>
        <Label size="small">Search places</Label>
        <Field
          accessibilityLabel="Search places by name, locality or interest"
          placeholder="Place, town or interest"
          value={filters.query}
          onChangeText={(query) => dispatch({ type: 'filters', filters: { query } })}
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>
      <View style={layout.between}>
        <Chip
          label={activeCount ? `Filters · ${activeCount} active` : 'Filters'}
          onPress={onFilters}
        />
        {!expanded && (
          <Chip
            label={view === 'map' ? `List · ${count}` : 'View map'}
            onPress={() => onViewChange(view === 'map' ? 'list' : 'map')}
          />
        )}
      </View>
    </View>
  );
}
