import { useTheme } from '../../theme/ThemeProvider';
import { AppHeader } from '../../components/AppHeader';
import { router } from 'expo-router';
import { BookmarkSimpleIcon } from 'phosphor-react-native';
import { View } from 'react-native';
import { useApp } from '../../features/state/AppProvider';
import { usePlaceCatalog } from '../../features/places/PlaceCatalogProvider';
import { EmptyState, Label, layout, Screen } from '../../components/ui';
import { PlaceCard } from '../../components/PlaceCard';

export default function SavedScreen() {
  const catalog = usePlaceCatalog();
  const { colors } = useTheme();
  const { state } = useApp();
  const saved = state.savedIds.flatMap((id) => {
    const place = catalog.places.find((item) => item.id === id);
    return place ? [place] : [];
  });
  return (
    <Screen>
      <AppHeader />
      <View style={layout.row}>
        <BookmarkSimpleIcon size={24} color={colors.primary} />
        <Label size="eyebrow" tone="primary">
          FOR ANOTHER LITTLE ADVENTURE
        </Label>
      </View>
      <Label size="title" accessibilityRole="header">
        Your saved places
      </Label>
      <Label tone="textMuted">
        A few ideas for your next free afternoon. Saved places stay here even when you change
        filters.
      </Label>
      {!saved.length ? (
        <EmptyState
          title="Keep a little inspiration"
          message="Tap the bookmark on any place to keep it here for later."
          action="Discover places"
          onAction={() => router.navigate('/discover')}
        />
      ) : (
        saved.map((place) => <PlaceCard key={place.id} place={place} />)
      )}
    </Screen>
  );
}
