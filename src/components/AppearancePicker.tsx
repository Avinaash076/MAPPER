import { useState } from 'react';
import { View } from 'react-native';
import { CheckIcon, MoonIcon, SunIcon } from 'phosphor-react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { ThemePreference } from '../theme/preferences';
import { Button, IconButton, Label, layout, Notice } from './ui';
import { Sheet } from './ui/Sheet';

const choices: { id: ThemePreference; label: string; description: string }[] = [
  {
    id: 'system',
    label: 'Use device appearance',
    description: 'Follow your phone or browser’s light and dark setting.',
  },
  {
    id: 'light',
    label: 'Light',
    description: 'Pale surfaces, slate blue controls and clear contrast.',
  },
  { id: 'dark', label: 'Dark', description: 'Deep slate surfaces and soft blue accents.' },
];

export function AppearancePicker() {
  const [open, setOpen] = useState(false);
  const { colors, scheme, preference, chooseTheme, storageError } = useTheme();
  return (
    <>
      <IconButton
        label={`Appearance: ${preference}. Open light and dark settings`}
        onPress={() => setOpen(true)}
      >
        {scheme === 'dark' ? (
          <MoonIcon size={24} color={colors.primary} />
        ) : (
          <SunIcon size={24} color={colors.primary} />
        )}
      </IconButton>
      {open && (
        <Sheet title="Appearance" onClose={() => setOpen(false)}>
          <Label tone="textMuted">Choose your app appearance. Map style stays independent.</Label>
          {choices.map((choice) => (
            <View key={choice.id} style={layout.section}>
              <Button
                label={`${preference === choice.id ? 'Selected · ' : ''}${choice.label}`}
                secondary
                onPress={() => chooseTheme(choice.id)}
                icon={
                  preference === choice.id ? (
                    <CheckIcon size={20} color={colors.primary} />
                  ) : undefined
                }
              />
              <Label size="small" tone="textMuted">
                {choice.description}
              </Label>
            </View>
          ))}
          {storageError && <Notice warning>{storageError}</Notice>}
        </Sheet>
      )}
    </>
  );
}
