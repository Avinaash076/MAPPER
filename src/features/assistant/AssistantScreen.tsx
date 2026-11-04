import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { Button, Chip, IconButton, Label, Notice, layout } from '../../components/ui';
import { Disclosure } from '../../components/ui/Disclosure';
import { SignInPanel } from '../contributions/SignInPanel';
import { requestTravel, travelServicesEnabled } from '../../services/travel/client';
import { useServiceSession } from '../../services/travel/useServiceSession';
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
  const account = useServiceSession();
  const { placeId } = useLocalSearchParams<{ placeId?: string }>();
  const { state } = useApp();
  return (
    <AssistantConversation key={`${account}:${placeId ?? state.filters.area}`} account={account} />
  );
}

function AssistantConversation({ account }: { account: string | null }) {
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
  const [mode, setMode] = useState<'example' | 'live'>('example');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const liveUnavailable = mode === 'live' ? !travelServicesEnabled || !account : false;
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);
  function resetConversation() {
    pending.current?.abort();
    pending.current = null;
    setBusy(false);
    setTurns([]);
    setError('');
  }
  function chooseMode(next: 'example' | 'live') {
    if (next === mode) return;
    resetConversation();
    setMode(next);
  }
  async function ask(text: string) {
    const clean = text.trim();
    if (!clean || (pending.current && !pending.current.signal.aborted)) return;
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setError('');
    try {
      const answer =
        mode === 'live'
          ? await requestTravel(
              'assistant',
              {
                question: clean,
                area,
                placeIds: place
                  ? [place.id]
                  : state.planIds.filter((id) => places.some((item) => item.id === id)).slice(0, 5),
              },
              controller.signal,
            )
          : getExampleAnswer(clean, { area, place });
      if (controller.signal.aborted) return;
      setTurns((previous) => [...previous, { id: nextId.current++, question: clean, answer }]);
      setQuestion('');
      shouldScroll.current = true;
    } catch (error) {
      if (!controller.signal.aborted) {
        setQuestion(clean);
        setError(error instanceof Error ? error.message : 'The answer could not be loaded. Retry.');
      }
    } finally {
      if (!controller.signal.aborted) setBusy(false);
      if (pending.current === controller) pending.current = null;
    }
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
              {mode === 'example'
                ? 'Example answers · no network request'
                : 'Mistral AI · public place context · check important details'}
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
            <View style={layout.wrap}>
              <Chip
                label="Examples"
                selected={mode === 'example'}
                onPress={() => chooseMode('example')}
              />
              <Chip label="Ask AI" selected={mode === 'live'} onPress={() => chooseMode('live')} />
            </View>
            {mode === 'live' ? (
              <>
                <Label size="small" tone="textMuted">
                  Each question is answered independently. Your question and up to five public place
                  records are sent to Mistral. Private drafts, photographs and your captured
                  location are excluded. Avoid personal details in questions.
                </Label>
                {!travelServicesEnabled ? (
                  <Notice>
                    Live AI has not been configured yet. You can explore the labelled examples.
                  </Notice>
                ) : !account ? (
                  <SignInPanel purpose="travel" />
                ) : (
                  <Disclosure title="Online services account">
                    <SignInPanel purpose="travel" />
                  </Disclosure>
                )}
              </>
            ) : null}
            {turns.length === 0 ? (
              <View style={layout.section}>
                <Label size="title">What would help you explore?</Label>
                <Label tone="textMuted">
                  Start with a question. Keep the place and your next step in view.
                </Label>
              </View>
            ) : null}
            {turns.map((turn) => (
              <AssistantMessage key={turn.id} turn={turn} />
            ))}
            <View style={layout.section}>
              <Label size="small" tone="textMuted">
                {mode === 'example' && turns.length
                  ? 'Try another example'
                  : 'A few starting points'}
              </Label>
              {assistantQuestions.map((text) => (
                <Button
                  key={text}
                  label={text}
                  secondary
                  disabled={busy || liveUnavailable}
                  onPress={() => {
                    void ask(text);
                  }}
                />
              ))}
            </View>
            {turns.length > 0 ? (
              <Button label="Clear conversation" secondary onPress={resetConversation} />
            ) : null}
            {error ? <Notice warning>{error}</Notice> : null}
            {busy ? <Label accessibilityLiveRegion="polite">Asking Mistral…</Label> : null}
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
              busy={busy}
              disabled={liveUnavailable}
              onSend={() => {
                void ask(question);
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
