import { View } from 'react-native';
import { Button, Field, Label, layout } from '../../components/ui';

export function QuestionComposer({
  value,
  onChange,
  onSend,
  busy = false,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  busy?: boolean;
  disabled?: boolean;
}) {
  return (
    <View style={layout.section}>
      <Label size="small">Your question</Label>
      <View style={[layout.row, { alignItems: 'flex-end' }]}>
        <Field
          accessibilityLabel="Your question"
          placeholder="Ask about this place or your plan"
          value={value}
          onChangeText={onChange}
          multiline
          maxLength={600}
          style={{ flex: 1, minHeight: 56, maxHeight: 120, textAlignVertical: 'top' }}
        />
        <Button
          label={busy ? 'Asking…' : 'Send'}
          disabled={busy || disabled || !value.trim()}
          onPress={onSend}
        />
      </View>
    </View>
  );
}
