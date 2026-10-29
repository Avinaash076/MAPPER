import { useLocalSearchParams, router } from 'expo-router';
import { View } from 'react-native';
import { Button, Label, layout, Notice, Screen } from '../components/ui';
import { useDraftEditor } from '../features/contributions/useDraftEditor';
import { LocationFields } from '../features/contributions/LocationFields';
import { PhotoFields } from '../features/contributions/PhotoFields';
import { PlaceStoryFields } from '../features/contributions/PlaceStoryFields';
import { nearbyDuplicates, submissionProblems } from '../features/contributions/model';
import { SignInPanel } from '../features/contributions/SignInPanel';
import { usePlaceCatalog } from '../features/places/PlaceCatalogProvider';

export default function ContributeScreen() {
  const catalog = usePlaceCatalog();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editor = useDraftEditor(id);
  const { draft, busy, error, saveState, change } = editor;
  if (!draft)
    return (
      <Screen>
        <Label>{error || 'Opening your draft…'}</Label>
        <Button
          label="Back to your hidden places"
          secondary
          onPress={() => router.replace('/contributions')}
        />
      </Screen>
    );
  const duplicates = nearbyDuplicates(draft, catalog.places);
  const editable = draft.status === 'draft' || draft.status === 'rejected';
  const ready = submissionProblems(draft).length === 0;
  return (
    <Screen>
      <Label size="title" accessibilityRole="header">
        A little place worth sharing.
      </Label>
      <Label tone="textMuted">Save it now. Finish the story whenever you have time.</Label>
      <Label size="small" accessibilityLiveRegion="polite">
        {busy || saveState}
      </Label>
      {error ? <Notice warning>{error}</Notice> : null}
      {!editable ? (
        <>
          <Notice>
            {draft.status === 'approved'
              ? 'This contribution has been approved.'
              : 'Sent privately for review. It is not public yet.'}
          </Notice>
          {draft.reviewNote && <Label>{draft.reviewNote}</Label>}
          <Button
            label="Back to your hidden places"
            secondary
            onPress={() => router.replace('/contributions')}
          />
        </>
      ) : (
        <>
          <View style={layout.section} pointerEvents={busy ? 'none' : 'auto'}>
            <LocationFields
              location={draft.location}
              confirmed={draft.locationConfirmed}
              capture={() => {
                void editor.captureLocation();
              }}
              onChange={(location) => {
                void change({ location, locationConfirmed: false });
              }}
              onConfirm={(locationConfirmed) => {
                void change({ locationConfirmed });
              }}
            />
            {duplicates.length > 0 && (
              <Notice>
                There may already be a place nearby:{' '}
                {duplicates.map((place) => place.name).join(', ')}. Check whether your discovery is
                the same spot before submitting.
              </Notice>
            )}
            <PhotoFields
              photos={draft.photos}
              addPhotos={(camera) => {
                void editor.addPhotos(camera);
              }}
              onChange={(photos) => {
                void change({ photos });
              }}
            />
            <PlaceStoryFields
              draft={draft}
              onChange={(patch) => {
                void change(patch);
              }}
            />
          </View>
          <Button
            label="Save draft"
            secondary={ready}
            disabled={Boolean(busy)}
            onPress={() => {
              void change({});
            }}
          />
          <SignInPanel />
          <Button
            label={busy ? busy : 'Send for review'}
            disabled={Boolean(busy)}
            onPress={() => {
              void editor.sendForReview();
            }}
          />
          <Label size="small" tone="textMuted">
            Only approved places can appear publicly. Your precise captured coordinates stay private
            until a reviewer chooses the public location.
          </Label>
        </>
      )}
    </Screen>
  );
}
