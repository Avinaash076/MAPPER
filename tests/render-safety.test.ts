import test from 'node:test';
import assert from 'node:assert/strict';
import { ESLint } from 'eslint';
import { mapFailureMessage } from '../src/features/map/errors';

test('lint rejects JSX conditions that leak empty strings or zero into native views', async () => {
  const lint = new ESLint();
  const [result] = await lint.lintText(
    `
    import { View, Text } from 'react-native';
    export function Example({ error, query, count }: {error: string; query: string; count: number}) {
      return <View>{error && <Text>{error}</Text>}{query.trim() && <Text>Results</Text>}{count && <Text>Count</Text>}</View>;
    }
  `,
    { filePath: 'src/components/RenderSafetyExample.tsx' },
  );
  assert.equal(
    result.messages.filter((message) => message.ruleId === 'react/jsx-no-leaked-render').length,
    3,
  );
});

test('explicit null fallbacks are accepted for empty/error/result states', async () => {
  const lint = new ESLint();
  const [result] = await lint.lintText(
    `
    import { View, Text } from 'react-native';
    export function Example({ error, query }: {error: string; query: string}) {
      return <View>{error ? <Text>{error}</Text> : null}{query.trim() ? <Text>Results</Text> : null}</View>;
    }
  `,
    { filePath: 'src/components/RenderSafetyExample.tsx' },
  );
  assert.equal(
    result.messages.filter((message) => message.ruleId === 'react/jsx-no-leaked-render').length,
    0,
  );
});

test('map failures explain graphics, worker and network recovery without leaking source URLs', () => {
  assert.match(mapFailureMessage(new Error('Failed to initialize WebGL')), /graphics acceleration/);
  assert.match(mapFailureMessage(new Error('Failed to load worker module')), /renderer/);
  const message = mapFailureMessage(
    new Error('Failed to fetch https://example.test/style?key=private-token'),
  );
  assert.match(message, /connection/);
  assert.ok(!message.includes('private-token'));
  assert.ok(!message.includes('example.test'));
});
