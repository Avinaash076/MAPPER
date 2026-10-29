import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { PlusIcon } from 'phosphor-react-native';
import { AppHeader } from '../../components/AppHeader';
import { Chip, Field, IconButton, Label, layout } from '../../components/ui';
import { useTheme } from '../../theme/ThemeProvider';
import { useApp } from '../state/AppProvider';
import { CityPicker } from '../setup/CityPicker';
import { InterestChoices } from '../setup/InterestChoices';

interface DiscoveryControlsProps {
  view: 'map' | 'list';
  onViewChange: (view: 'map' | 'list') => void;
  onFilters: () => void;
  count: number;
}

export function DiscoveryControls({
  view,
  onViewChange,
  onFilters,
  count,
}: DiscoveryControlsProps) {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  return (
    <View style={layout.section}>
      <AppHeader
        action={
          <IconButton label="Add a hidden place" onPress={() => router.push('/contributions')}>
            <PlusIcon color={colors.primary} size={24} />
          </IconButton>
        }
      />
      <CityPicker />
      <Field
        accessibilityLabel="Search places, localities or interests"
        placeholder="A lake, a temple, a little adventure…"
        value={state.filters.query}
        onChangeText={(query) => dispatch({ type: 'filters', filters: { query } })}
        autoCorrect={false}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <InterestChoices
          selected={state.filters.categories}
          onChange={(categories) => dispatch({ type: 'filters', filters: { categories } })}
        />
      </ScrollView>
      <View style={layout.wrap}>
        <Chip label="Map" selected={view === 'map'} onPress={() => onViewChange('map')} />
        <Chip label="List" selected={view === 'list'} onPress={() => onViewChange('list')} />
        <Chip label="Filters" onPress={onFilters} />
      </View>
      <Label size="small" tone="textMuted" accessibilityLiveRegion="polite">
        {count} nearby places ·{' '}
        {state.filters.transport
          ? 'sample travel estimates'
          : 'choose transport for travel estimates'}
      </Label>
    </View>
  );
}
