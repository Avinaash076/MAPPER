import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Chip, Label, layout, Notice, Screen } from '../components/ui';
import { Disclosure } from '../components/ui/Disclosure';
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
  const [step, setStep] = useState(0);
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
          <View style={layout.wrap}>
            {['Location', 'Photos', 'Story'].map((name, index) => (
              <Chip
                key={name}
                label={`${index + 1}. ${name}`}
                selected={step === index}
                onPress={() => setStep(index)}
              />
            ))}
          </View>
          <View style={layout.section} pointerEvents={busy ? 'none' : 'auto'}>
            <View style={{ display: step === 0 ? 'flex' : 'none' }}>
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
                  {duplicates.map((place) => place.name).join(', ')}. Check whether your discovery
                  is the same spot before submitting.
                </Notice>
              )}
            </View>
            <View style={{ display: step === 1 ? 'flex' : 'none' }}>
              <PhotoFields
                photos={draft.photos}
                addPhotos={(camera) => {
                  void editor.addPhotos(camera);
                }}
                onChange={(photos) => {
                  void change({ photos });
                }}
              />
            </View>
            <View style={{ display: step === 2 ? 'flex' : 'none' }}>
              <PlaceStoryFields
                draft={draft}
                onChange={(patch) => {
                  void change(patch);
                }}
              />
            </View>
          </View>
          {step < 2 && (
            <Button label="Continue" disabled={Boolean(busy)} onPress={() => setStep(step + 1)} />
          )}
          <Button
            label="Save draft"
            secondary={ready}
            disabled={Boolean(busy)}
            onPress={() => {
              void change({});
            }}
          />
          {step === 2 && (
            <Disclosure title="Send privately for review">
              <SignInPanel />
              <Button
                label={busy ? busy : 'Send for review'}
                disabled={Boolean(busy)}
                onPress={() => {
                  void editor.sendForReview();
                }}
              />
              {error && <Notice warning>{error}</Notice>}
            </Disclosure>
          )}
          <Label size="small" tone="textMuted">
            Only approved places can appear publicly. Your precise captured coordinates stay private
            until a reviewer chooses the public location.
          </Label>
        </>
      )}
    </Screen>
  );
}
