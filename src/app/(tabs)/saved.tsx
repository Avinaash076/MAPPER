import { router } from 'expo-router';
import { BookmarkSimpleIcon } from 'phosphor-react-native';
import { View } from 'react-native';
import { useApp } from '../../features/state/AppProvider';
import { placeRepository } from '../../features/places/repository';
import { EmptyState, Label, layout, Screen } from '../../components/ui';
import { PlaceCard } from '../../components/PlaceCard';
import { colors } from '../../theme/tokens';
export default function SavedScreen() {
  const { state } = useApp();
  const saved = state.savedIds.flatMap((id) => {
    const place = placeRepository.get(id);
    return place ? [place] : [];
  });
  return (
    <Screen>
      <View style={layout.row}>
        <BookmarkSimpleIcon size={24} color={colors.green} />
        <Label size="eyebrow" tone="green">
          FOR ANOTHER LITTLE ADVENTURE
        </Label>
      </View>
      <Label size="title" accessibilityRole="header">
        Your saved places
      </Label>
      <Label tone="muted">
        A few ideas for your next free afternoon. Saved places stay here even when you change
        filters.
      </Label>
      {!saved.length ? (
        <EmptyState
          title="Keep a little inspiration"
          message="Tap the bookmark on any place to keep it here for later."
          action="Discover places"
          onAction={() => router.navigate('/')}
        />
      ) : (
        saved.map((place) => <PlaceCard key={place.id} place={place} />)
      )}
    </Screen>
  );
}
