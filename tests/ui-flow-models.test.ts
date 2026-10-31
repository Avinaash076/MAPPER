import test from 'node:test';
import assert from 'node:assert/strict';
import { appReducer, initialState } from '../src/features/state/model';
import { placesToGeoJson } from '../src/features/map/model';
import { filterPlaces } from '../src/features/places/discovery';
import { defaultFilters } from '../src/features/places/types';
import { placeRepository } from '../src/features/places/repository';

test('undo restores a removed stop at its original position without duplicates', () => {
  const state = { ...initialState, planIds: ['lake', 'fort', 'park'] };
  const removed = appReducer(state, { type: 'removeStop', id: 'fort' });
  const restored = appReducer(removed, { type: 'restoreStop', id: 'fort', index: 1 });
  assert.deepEqual(restored.planIds, state.planIds);
  assert.equal(appReducer(restored, { type: 'restoreStop', id: 'fort', index: 0 }), restored);
  assert.deepEqual(
    appReducer(initialState, { type: 'restoreStop', id: 'fort', index: 3 }).planIds,
    ['fort'],
  );
});

test('private location preview uses longitude first and does not fabricate a destination', () => {
  const pin = { latitude: 15.36, longitude: 75.12 };
  const data = placesToGeoJson([], pin);
  assert.deepEqual(data.features[0].geometry?.coordinates, [75.12, 15.36]);
  assert.equal(data.features[0].properties?.id, 'private-location');
  assert.deepEqual(placesToGeoJson([]).features, []);
});

test('filter preview count follows the same query and combined filters as discovery', () => {
  const places = placeRepository.list();
  const filters = { ...defaultFilters, query: 'unkal', categories: ['nature' as const] };
  assert.equal(filterPlaces(places, filters).length, 1);
  assert.equal(filterPlaces(places, { ...filters, query: 'not-a-place' }).length, 0);
});
