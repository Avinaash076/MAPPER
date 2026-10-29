import { Chip, Field, Label, layout, Panel } from '../../components/ui';
import { CheckRow } from '../../components/ui/CheckRow';
import { View } from 'react-native';
import { InterestChoices } from '../setup/InterestChoices';
import type { PlaceDraft } from './types';

export function PlaceStoryFields({
  draft,
  onChange,
}: {
  draft: PlaceDraft;
  onChange: (patch: Partial<PlaceDraft>) => void;
}) {
  return (
    <Panel style={layout.section}>
      <Label size="heading">3 · Tell the place’s story</Label>
      <Field
        accessibilityLabel="Place name"
        placeholder="Place name"
        value={draft.name}
        onChangeText={(name) => onChange({ name })}
        maxLength={100}
      />
      <Field
        accessibilityLabel="Nearest village, town or area"
        placeholder="Nearest village, town or area"
        value={draft.locality}
        onChangeText={(locality) => onChange({ locality })}
        maxLength={150}
      />
      <Label>Your interests</Label>
      <InterestChoices
        selected={draft.categories}
        onChange={(categories) => onChange({ categories })}
      />
      <Field
        accessibilityLabel="Place description"
        placeholder="What makes it special? What can someone do here?"
        value={draft.description}
        onChangeText={(description) => onChange({ description })}
        multiline
        maxLength={3000}
        style={{ minHeight: 120, textAlignVertical: 'top' }}
      />
      <Label>What do you know about entry?</Label>
      <View style={layout.wrap}>
        {(
          [
            { id: 'public', label: 'Public access' },
            { id: 'permission', label: 'Permission needed' },
            { id: 'unknown', label: 'Not sure yet' },
          ] as const
        ).map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            selected={draft.access === option.id}
            onPress={() => onChange({ access: option.id })}
          />
        ))}
      </View>
      <Field
        accessibilityLabel="Access and seasonal notes"
        placeholder="Approach, walking stretch, seasonal changes or permission contact · optional"
        value={draft.accessNotes}
        onChangeText={(accessNotes) => onChange({ accessNotes })}
        multiline
        maxLength={1500}
      />
      <CheckRow
        label="This location needs extra care before sharing its exact position"
        checked={draft.sensitiveLocation}
        onChange={(sensitiveLocation) => onChange({ sensitiveLocation })}
      />
      <Label size="small" tone="textMuted">
        For example, private land, a fragile habitat or a culturally restricted site. Reviewers can
        withhold or generalize its position.
      </Label>
      <CheckRow
        label="I took these photos or have permission to share them"
        checked={draft.photoRightsConfirmed}
        onChange={(photoRightsConfirmed) => onChange({ photoRightsConfirmed })}
      />
      <CheckRow
        label="Send this location, description and photos for private review"
        checked={draft.sharingConsent}
        onChange={(sharingConsent) => onChange({ sharingConsent })}
      />
    </Panel>
  );
}
