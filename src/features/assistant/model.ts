export interface AssistantPlace {
  id: string;
  name: string;
  sources: { title: string; url: string }[];
}
export interface AssistantContext {
  area: string;
  place?: AssistantPlace;
}
export const assistantQuestions = [
  'What should I check before visiting?',
  'How do I plan a day?',
  'How do I share a hidden place?',
] as const;
export interface AssistantAnswer {
  title: string;
  body: string;
  sources: { title: string; url: string }[];
  placeId?: string;
  demo: true;
}

// Deliberate examples for UI evaluation. No network request or generated destination claim.
export function getExampleAnswer(question: string, context: AssistantContext): AssistantAnswer {
  const base = { demo: true as const, sources: [] as AssistantAnswer['sources'] };
  if (question === assistantQuestions[0])
    return {
      ...base,
      title: context.place
        ? `Before visiting ${context.place.name}`
        : `Before exploring ${context.area}`,
      body: 'Check current access, weather and opening information with the venue or a local source. This example cannot confirm today’s conditions. The place references below provide background information.',
      sources: context.place?.sources ?? [],
      placeId: context.place?.id,
    };
  if (question === assistantQuestions[1])
    return {
      ...base,
      title: 'Build a day around your time',
      body: 'Choose places, add them from their details, then reorder your stops in My plan. Select transport before viewing approximate travel times. The app currently saves one local day plan; routes and live conditions still need checking.',
    };
  if (question === assistantQuestions[2])
    return {
      ...base,
      title: 'Your discovery starts privately',
      body: 'Save the location, add your own photographs and describe the place. You can finish a draft later. Submissions remain private until administrator review; a reviewer chooses the public location.',
    };
  return {
    ...base,
    title: 'Try an example question',
    body: 'This assistant is an interface demo. A live service is not connected, so it cannot answer this question yet. Try one of the example questions above to explore the conversation and source presentation.',
  };
}
