import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { Button, IconButton, Label, layout } from '../../components/ui';
import { AppearancePicker } from '../../components/AppearancePicker';
import { useApp } from '../state/AppProvider';
import { usePlaceCatalog } from '../places/PlaceCatalogProvider';
import { areas } from '../places/types';
import { useTheme } from '../../theme/ThemeProvider';
import { space } from '../../theme/tokens';
import { assistantQuestions, getExampleAnswer } from './model';
import { AssistantMessage, type ConversationTurn } from './AssistantMessage';
import { QuestionComposer } from './QuestionComposer';

export function AssistantScreen() {
  const { colors } = useTheme();
  const { state } = useApp();
  const { places } = usePlaceCatalog();
  const { placeId } = useLocalSearchParams<{ placeId?: string }>();
  const place = places.find((item) => item.id === placeId);
  const area = areas.find((item) => item.id === state.filters.area)!.name;
  const scroll = useRef<ScrollView>(null);
  const nextId = useRef(0);
  const shouldScroll = useRef(false);
  const [question, setQuestion] = useState('');
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  function ask(text: string) {
    const clean = text.trim();
    if (!clean) return;
    const turn = {
      id: nextId.current++,
      question: clean,
      answer: getExampleAnswer(clean, { area, place }),
    };
    setTurns((previous) => [...previous, turn]);
    setQuestion('');
    shouldScroll.current = true;
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center' }}>
          <View
            style={{
              padding: space.lg,
              gap: space.xs,
              borderBottomWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={layout.between}>
              <IconButton
                label="Back to exploring"
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/discover'))}
              >
                <ArrowLeftIcon size={24} color={colors.primary} />
              </IconButton>
              <AppearancePicker />
            </View>
            <Label size="heading" accessibilityRole="header">
              Ask about {place?.name ?? area}
            </Label>
            <Label size="small" tone="textMuted">
              AI preview · example answers, not live advice
            </Label>
          </View>
          <ScrollView
            ref={scroll}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{ padding: space.lg, gap: space.xxl }}
            onContentSizeChange={() => {
              if (shouldScroll.current) {
                scroll.current?.scrollToEnd({ animated: false });
                shouldScroll.current = false;
              }
            }}
          >
            {turns.length === 0 && (
              <View style={layout.section}>
                <Label size="title">What would help you explore?</Label>
                <Label tone="textMuted">
                  Start with a question. Keep the place and your next step in view.
                </Label>
              </View>
            )}
            {turns.map((turn) => (
              <AssistantMessage key={turn.id} turn={turn} />
            ))}
            <View style={layout.section}>
              <Label size="small" tone="textMuted">
                {turns.length ? 'Try another example' : 'A few starting points'}
              </Label>
              {assistantQuestions.map((text) => (
                <Button key={text} label={text} secondary onPress={() => ask(text)} />
              ))}
            </View>
            {turns.length > 0 && (
              <Button label="Clear conversation" secondary onPress={() => setTurns([])} />
            )}
          </ScrollView>
          <View
            style={{
              padding: space.lg,
              borderTopWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <QuestionComposer
              value={question}
              onChange={setQuestion}
              onSend={() => ask(question)}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
