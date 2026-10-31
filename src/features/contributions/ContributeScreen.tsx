import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { Button, Chip, Label, layout, Notice, Screen } from '../../components/ui';
import { DraftReview } from './DraftReview';
import { CheckRow } from '../../components/ui/CheckRow';
import { useDraftEditor } from './useDraftEditor';
import { LocationFields } from './LocationFields';
import { PhotoFields } from './PhotoFields';
import { PlaceStoryFields } from './PlaceStoryFields';
import { nearbyDuplicates, submissionProblems } from './model';
import { SignInPanel } from './SignInPanel';
import { usePlaceCatalog } from '../places/PlaceCatalogProvider';

export function ContributeScreen() {
  const catalog = usePlaceCatalog();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editor = useDraftEditor(id);
  const [step, setStep] = useState(0);
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (step === 0) return false;
        setStep((value) => value - 1);
        return true;
      });
      return () => subscription.remove();
    }, [step]),
  );
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
        {step === 3 ? 'Review your discovery' : 'Add a hidden place'}
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
          <DraftReview draft={draft} />
          <Button
            label="Back to your hidden places"
            secondary
            onPress={() => router.replace('/contributions')}
          />
        </>
      ) : (
        <>
          <View style={layout.wrap}>
            {['Location', 'Photos', 'Story', 'Review'].map((name, index) => (
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
                rightsConfirmed={draft.photoRightsConfirmed}
                onRightsChange={(photoRightsConfirmed) => {
                  void change({ photoRightsConfirmed });
                }}
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
          {step === 3 && (
            <>
              <DraftReview draft={draft} onEdit={setStep} />
              <CheckRow
                label="Send this location, description and photos for private review"
                checked={draft.sharingConsent}
                onChange={(sharingConsent) => {
                  void change({ sharingConsent });
                }}
              />
            </>
          )}
          {step < 3 && (
            <Button
              label={step === 2 ? 'Review your discovery' : 'Continue'}
              disabled={Boolean(busy)}
              onPress={() => setStep(step + 1)}
            />
          )}
          {step > 0 && (
            <Button
              label="Previous step"
              secondary
              disabled={Boolean(busy)}
              onPress={() => setStep(step - 1)}
            />
          )}
          <Button
            label="Save draft"
            secondary
            disabled={Boolean(busy)}
            onPress={() => {
              void change({});
            }}
          />
          {step === 3 && (
            <View style={layout.section}>
              <SignInPanel />
              <Button
                label={busy ? busy : 'Send for review'}
                disabled={Boolean(busy) || !ready}
                onPress={() => {
                  void editor.sendForReview();
                }}
              />
            </View>
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
