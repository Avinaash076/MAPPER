import { useState } from 'react';
import { Button, Label, Notice } from '../../components/ui';
import { Sheet } from '../../components/ui/Sheet';

export function DemoAssistant({ city }: { city: string }) {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  return (
    <>
      <Button label="Ask about this area" secondary onPress={() => setOpen(true)} />
      {open && (
        <Sheet title="A little local help" onClose={() => setOpen(false)}>
          <Notice>Design preview · sample answers, not a connected AI service.</Notice>
          <Button
            label={`How can I explore ${city}?`}
            secondary
            onPress={() =>
              setAnswer(
                `Start with the nearby place list around ${city}. Pick an interest, then choose transport if you want sample travel estimates. Confirm access and opening hours before travelling.`,
              )
            }
          />
          <Button
            label="Can I save a hidden place?"
            secondary
            onPress={() =>
              setAnswer(
                'Use Share a place to save its location, your photos and a description privately. You can finish it later; community publication requires review.',
              )
            }
          />
          {answer && <Label accessibilityLiveRegion="polite">{answer}</Label>}
        </Sheet>
      )}
    </>
  );
}
