import { Button, Label, layout, Panel } from '../../components/ui';
import { View } from 'react-native';
import { submissionProblems } from './model';
import type { PlaceDraft } from './types';

export function DraftReview({
  draft,
  onEdit,
}: {
  draft: PlaceDraft;
  onEdit?: (step: number) => void;
}) {
  const problems = submissionProblems(draft);
  return (
    <View style={layout.section}>
      <Panel style={layout.section}>
        <Label size="heading">{draft.name || 'Your hidden place'}</Label>
        <Label tone="textMuted">{draft.locality || 'Nearest town not added'}</Label>
        <Label>{draft.description || 'Your story is still to come.'}</Label>
        <Label size="small">
          {draft.location ? 'Location captured privately' : 'Location needed'} ·{' '}
          {draft.photos.length} of 5 photos
        </Label>
        <Label size="small" tone="textMuted">
          {draft.sensitiveLocation
            ? 'Exact location needs extra care before publication.'
            : 'A reviewer chooses the public location. Capturing a pin does not publish it.'}
        </Label>
      </Panel>
      {onEdit && (
        <View style={layout.wrap}>
          <Button label="Edit location" secondary onPress={() => onEdit(0)} />
          <Button label="Edit photos" secondary onPress={() => onEdit(1)} />
          <Button label="Edit story" secondary onPress={() => onEdit(2)} />
        </View>
      )}
      {onEdit && problems.length > 0 && (
        <Panel style={layout.section}>
          <Label size="heading">Before you send</Label>
          {problems.map((problem) => (
            <Label key={problem} size="small">
              • {problem}
            </Label>
          ))}
          <Label size="small" tone="textMuted">
            Your draft is saved privately while you finish these details.
          </Label>
        </Panel>
      )}
    </View>
  );
}
