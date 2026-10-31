import { Linking, View } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Button, Label, layout, Notice, Panel } from '../../components/ui';
import { Disclosure } from '../../components/ui/Disclosure';
import { useTheme } from '../../theme/ThemeProvider';
import type { AssistantAnswer } from './model';

export interface ConversationTurn {
  id: number;
  question: string;
  answer: AssistantAnswer;
}

export function AssistantMessage({ turn }: { turn: ConversationTurn }) {
  const { colors } = useTheme();
  const [linkError, setLinkError] = useState(false);
  async function openSource(url: string) {
    setLinkError(false);
    try {
      await Linking.openURL(url);
    } catch {
      setLinkError(true);
    }
  }
  return (
    <View style={layout.section}>
      <Panel
        style={{ backgroundColor: colors.primarySoft, alignSelf: 'flex-end', maxWidth: '92%' }}
      >
        <Label size="small" tone="primary">
          You
        </Label>
        <Label>{turn.question}</Label>
      </Panel>
      <View style={layout.section}>
        <Label size="small" tone="accent">
          MAPPER · example answer
        </Label>
        <Label size="heading">{turn.answer.title}</Label>
        <Label>{turn.answer.body}</Label>
        {turn.answer.sources.length > 0 && (
          <Disclosure title={`Background sources (${turn.answer.sources.length})`}>
            {turn.answer.sources.map((source) => (
              <Button
                key={source.url}
                label={source.title}
                secondary
                onPress={() => {
                  void openSource(source.url);
                }}
              />
            ))}
            {linkError && (
              <Notice warning>Could not open the source. Tap it again to retry.</Notice>
            )}
          </Disclosure>
        )}
        {turn.answer.placeId && (
          <Button
            label="View this place"
            secondary
            onPress={() =>
              router.push({ pathname: '/place/[id]', params: { id: turn.answer.placeId! } })
            }
          />
        )}
      </View>
    </View>
  );
}
