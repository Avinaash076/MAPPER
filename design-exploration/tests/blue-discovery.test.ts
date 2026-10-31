import test from 'node:test';
import assert from 'node:assert/strict';
import { findDiscoveryPlaces } from '../src/stage4/blueDiscoveryData';
import { places } from '../src/data';

test('map search combines text, category and collection rather than replacing a filter', () => {
  assert.deepEqual(
    findDiscoveryPlaces(places, '  DHARWAD ', 'Nature', 'Lakes & landscapes').map(
      (place) => place.id,
    ),
    ['kelgeri-lake'],
  );
  assert.equal(findDiscoveryPlaces(places, 'Dharwad', 'Heritage', 'All places').length, 0);
  assert.equal(findDiscoveryPlaces(places, '', 'Nature', 'Heritage').length, 0);
});
test('empty search and unknown place recover predictably without changing sample records', () => {
  const initial = JSON.stringify(places);
  assert.equal(findDiscoveryPlaces(places, '', '', 'All places').length, places.length);
  assert.equal(findDiscoveryPlaces(places, 'not-a-real-sample', '', 'All places').length, 0);
  assert.equal(JSON.stringify(places), initial);
});
