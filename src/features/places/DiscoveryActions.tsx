import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Label, layout } from '../../components/ui';
import { Disclosure } from '../../components/ui/Disclosure';
import { InterestChoices } from '../setup/InterestChoices';
import { useApp } from '../state/AppProvider';

export function ContributionEntry() {
  return (
    <View style={layout.section}>
      <Button label="Know a place we’ve missed?" onPress={() => router.push('/contributions')} />
      <Label size="small" tone="textMuted">
        Add a location, your photos and its story. Private until reviewed.
      </Label>
    </View>
  );
}

export function DiscoveryActions({ placeId }: { placeId?: string }) {
  const { state, dispatch } = useApp();
  return (
    <View style={layout.section}>
      <Disclosure title="Explore by interest">
        <InterestChoices
          selected={state.filters.categories}
          onChange={(categories) => dispatch({ type: 'filters', filters: { categories } })}
        />
      </Disclosure>
      <Disclosure title="Plan your visit">
        <Label tone="textMuted">
          Add places from their details, then arrange your stops in My plan. Start with one day.
        </Label>
        <Button label="Open my plan" secondary onPress={() => router.navigate('/plan')} />
      </Disclosure>
      <Button
        label="Ask a local question · AI preview"
        secondary
        onPress={() => router.push({ pathname: '/assistant', params: { placeId } })}
      />
    </View>
  );
}
