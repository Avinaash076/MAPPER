import test from 'node:test';
import assert from 'node:assert/strict';
import { assistantQuestions, getExampleAnswer } from '../src/features/assistant/model';
import { getMapStyle } from '../src/features/map/model';

test('assistant example preserves supplied source references and admits unverified conditions', () => {
  const context = {
    area: 'Dharwad',
    place: {
      id: 'sample-place',
      name: 'A lake',
      sources: [{ title: 'Background', url: 'https://example.org/place' }],
    },
  };
  const answer = getExampleAnswer(assistantQuestions[0], context);
  assert.equal(answer.demo, true);
  assert.deepEqual(answer.sources, context.place.sources);
  assert.equal(answer.placeId, context.place.id);
  assert.match(answer.body, /cannot confirm/);
});
test('unrecognised questions do not produce invented answers or sources', () => {
  const answer = getExampleAnswer('Is this road open today?', { area: 'Dharwad' });
  assert.match(answer.body, /live service is not connected/);
  assert.deepEqual(answer.sources, []);
  assert.equal(answer.placeId, undefined);
});
test('the two map appearances resolve independently of an app theme', () => {
  assert.equal(getMapStyle('liberty'), 'https://tiles.openfreemap.org/styles/liberty');
  assert.equal(getMapStyle('dark'), 'https://tiles.openfreemap.org/styles/dark');
  assert.equal(getMapStyle('light'), getMapStyle('liberty'));
});
