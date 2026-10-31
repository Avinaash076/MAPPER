import { useState } from 'react';
import { Linking, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SparkleIcon } from 'phosphor-react-native';
import { Button, Field, Label, layout, Notice, Panel, Screen } from '../../components/ui';
import { Disclosure } from '../../components/ui/Disclosure';
import { useApp } from '../state/AppProvider';
import { usePlaceCatalog } from '../places/PlaceCatalogProvider';
import { areas } from '../places/types';
import { useTheme } from '../../theme/ThemeProvider';
import { assistantQuestions, getExampleAnswer, type AssistantAnswer } from './model';

export function AssistantScreen() {
  const { colors } = useTheme();
  const { state } = useApp();
  const { places } = usePlaceCatalog();
  const { placeId } = useLocalSearchParams<{ placeId?: string }>();
  const place = places.find((item) => item.id === placeId);
  const area = areas.find((item) => item.id === state.filters.area)!.name;
  const [question, setQuestion] = useState('');
  const [exchange, setExchange] = useState<{ question: string; answer: AssistantAnswer } | null>(
    null,
  );
  const [linkError, setLinkError] = useState(false);
  function ask(text: string) {
    if (!text.trim()) return;
    setExchange({ question: text.trim(), answer: getExampleAnswer(text.trim(), { area, place }) });
    setQuestion('');
  }
  return (
    <Screen>
      <View style={layout.row}>
        <SparkleIcon size={28} color={colors.primary} />
        <Label size="eyebrow" tone="primary">
          LOCAL HELP / AI PREVIEW
        </Label>
      </View>
      <Label size="title" accessibilityRole="header">
        A little guidance.{'\n'}Your kind of day.
      </Label>
      <Label tone="textMuted">
        About {place?.name ?? area}. Try a question before making your plan.
      </Label>
      <Label size="small" tone="accent">
        Interactive demo · example answers
      </Label>
      {!exchange && (
        <Panel style={layout.section}>
          {assistantQuestions.map((text) => (
            <Button key={text} label={text} secondary onPress={() => ask(text)} />
          ))}
        </Panel>
      )}
      {exchange && (
        <View style={layout.section}>
          <Panel>
            <Label tone="primary">You asked</Label>
            <Label>{exchange.question}</Label>
          </Panel>
          <Panel style={layout.section}>
            <Label size="small" tone="accent">
              EXAMPLE RESPONSE
            </Label>
            <Label size="heading">{exchange.answer.title}</Label>
            <Label>{exchange.answer.body}</Label>
            {exchange.answer.sources.length > 0 && (
              <Disclosure title="Background sources">
                {exchange.answer.sources.map((source) => (
                  <Button
                    key={source.url}
                    label={source.title}
                    secondary
                    onPress={() => {
                      void Linking.openURL(source.url).catch(() => setLinkError(true));
                    }}
                  />
                ))}
              </Disclosure>
            )}
            {exchange.answer.placeId && (
              <Button
                label="Open place details"
                onPress={() =>
                  router.push({ pathname: '/place/[id]', params: { id: exchange.answer.placeId! } })
                }
              />
            )}
          </Panel>
          <Button label="Try another example" secondary onPress={() => setExchange(null)} />
        </View>
      )}
      <Label size="small">Your question</Label>
      <Field
        accessibilityLabel="Your question for the local assistant"
        value={question}
        onChangeText={setQuestion}
        placeholder="Ask about this place or your plan"
        multiline
        maxLength={600}
      />
      <Button label="Send question" disabled={!question.trim()} onPress={() => ask(question)} />
      {linkError && (
        <Notice warning>Could not open the source. Check your connection and retry.</Notice>
      )}
    </Screen>
  );
}
