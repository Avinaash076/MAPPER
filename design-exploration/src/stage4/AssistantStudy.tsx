import { useState } from 'react';
import { Icon } from '../components/Icon';
import { places } from '../data';
import {
  assistantQuestions,
  getExampleAnswer,
  type AssistantAnswer,
} from '../../../src/features/assistant/model';
import { openStudy, type ScreenProps } from './studyTypes';
import './blue-polish.css';

export function AssistantStudy(props: ScreenProps) {
  const place =
    places.find((item) => item.id === new URLSearchParams(location.search).get('place')) ??
    places[0];
  const [question, setQuestion] = useState('');
  const [exchange, setExchange] = useState<{ question: string; answer: AssistantAnswer } | null>(
    null,
  );
  function ask(text: string) {
    if (!text.trim()) return;
    const sources = place.sourceUrl
      ? [{ title: 'Place background', url: place.sourceUrl }]
      : [
          {
            title: 'Destination photo & location reference',
            url: 'https://commons.wikimedia.org/wiki/File:Kelageri_Lake.jpg',
          },
        ];
    setExchange({
      question: text.trim(),
      answer: getExampleAnswer(text.trim(), {
        area: place.area,
        place: { id: place.id, name: place.name, sources },
      }),
    });
    setQuestion('');
  }
  return (
    <section className="lens-assistant">
      <header>
        <p className="eyebrow">LOCAL HELP / AI PREVIEW</p>
        <h1>
          A little guidance.
          <br />
          Your kind of day.
        </h1>
        <p>
          About {place.name}, {place.area}.
        </p>
        <span className="lens-demo-badge">Interactive demo · example answers</span>
      </header>
      <div className="lens-conversation" aria-live="polite">
        {!exchange ? (
          <div className="lens-prompts">
            <p>What would you like to know?</p>
            {assistantQuestions.map((text) => (
              <button key={text} onClick={() => ask(text)}>
                {text}
                <Icon name="arrow" size={20} />
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="lens-user-message">
              <small>You asked</small>
              <p>{exchange.question}</p>
            </div>
            <article className="lens-answer">
              <span className="eyebrow">EXAMPLE RESPONSE</span>
              <h2>{exchange.answer.title}</h2>
              <p>{exchange.answer.body}</p>
              {exchange.answer.sources.length > 0 && (
                <details>
                  <summary>Background sources</summary>
                  {exchange.answer.sources.map((source) => (
                    <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                      {source.title} ↗
                    </a>
                  ))}
                </details>
              )}
              {exchange.answer.placeId && (
                <button
                  className="blue-secondary"
                  onClick={() => openStudy('Place details', props.variant, props.mode, place.id)}
                >
                  Open place details
                </button>
              )}
            </article>
            <button className="blue-text-action" onClick={() => setExchange(null)}>
              Try another example
            </button>
          </>
        )}
      </div>
      <form
        className="lens-composer"
        onSubmit={(event) => {
          event.preventDefault();
          ask(question);
        }}
      >
        <label htmlFor={`assistant-${props.variant}`}>Your question</label>
        <textarea
          id={`assistant-${props.variant}`}
          rows={2}
          maxLength={600}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about this place or your plan"
        />
        <button type="submit" disabled={!question.trim()}>
          Send question <Icon name="arrow" size={20} />
        </button>
      </form>
    </section>
  );
}
