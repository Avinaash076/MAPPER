import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterPlaces } from '../src/features/places/discovery';
import { areas, defaultFilters, type Place } from '../src/features/places/types';
import { distanceKm, estimateTravelMinutes, summarizePlan } from '../src/features/planning/travel';
import { appReducer, initialState } from '../src/features/state/model';
import {
  createStateWriter,
  decodeState,
  loadState,
  STORAGE_KEY,
} from '../src/features/state/persistence';
import { places } from '../src/features/places/data';

const origin = areas[0].coordinates;
const near: Place = {
  ...places[0],
  id: 'near',
  name: 'Quiet Lake',
  locality: 'Hubballi',
  categories: ['nature'],
  coordinates: origin,
  visitMinutes: 60,
};
const far: Place = {
  ...near,
  id: 'far',
  name: 'Forest Falls',
  categories: ['nature', 'waterfalls'],
  coordinates: { latitude: origin.latitude + 0.1, longitude: origin.longitude },
};
test('search, category, distance and time combine; interests match any selected category', () => {
  assert.deepEqual(
    filterPlaces([near, far], {
      ...defaultFilters,
      query: ' quiet ',
      categories: ['nature', 'heritage'],
      radiusKm: 5,
    }).map((p) => p.id),
    ['near'],
  );
  assert.equal(filterPlaces([near], { ...defaultFilters, categories: ['heritage'] }).length, 0);
  assert.equal(filterPlaces([far], { ...defaultFilters, radiusKm: 5 }).length, 0);
  assert.equal(
    filterPlaces([far], { ...defaultFilters, transport: 'walking', budgetMinutes: 120 }).length,
    0,
  );
  assert.equal(
    filterPlaces([far], { ...defaultFilters, transport: 'car', budgetMinutes: 120 }).length,
    1,
  );
  assert.equal(filterPlaces([near], { ...defaultFilters, query: 'HUBBALLI' }).length, 1);
});
test('results are nearest first and time includes return travel', () => {
  assert.deepEqual(
    filterPlaces([far, near], defaultFilters).map((p) => p.id),
    ['near', 'far'],
  );
  const oneWay = estimateTravelMinutes(origin, far.coordinates, 'car');
  assert.equal(
    filterPlaces([far], {
      ...defaultFilters,
      transport: 'car',
      budgetMinutes: far.visitMinutes + oneWay,
    }).length,
    0,
  );
});
test('distance and transport estimates behave at zero and across modes', () => {
  assert.equal(distanceKm(origin, origin), 0);
  assert.equal(estimateTravelMinutes(origin, origin, 'walking'), 0);
  assert.ok(
    estimateTravelMinutes(origin, far.coordinates, 'walking') >
      estimateTravelMinutes(origin, far.coordinates, 'bicycle'),
  );
  assert.ok(
    estimateTravelMinutes(origin, far.coordinates, 'bicycle') >
      estimateTravelMinutes(origin, far.coordinates, 'motorbike'),
  );
});
test('day total includes ordered legs, visits and return; exact budget fits', () => {
  const plan = summarizePlan([near, far], origin, 'car', 1);
  assert.equal(plan.visitMinutes, 120);
  assert.equal(
    plan.travelMinutes,
    plan.legs.reduce((sum, leg) => sum + leg, 0),
  );
  assert.equal(plan.legs.length, 3);
  assert.ok(plan.legs[2] > 0);
  assert.equal(plan.totalMinutes, plan.visitMinutes + plan.travelMinutes);
  assert.equal(plan.overBudget, true);
  assert.equal(summarizePlan([near, far], origin, 'car', plan.totalMinutes).overBudget, false);
  assert.equal(summarizePlan([], origin, 'walking', 120).totalMinutes, 0);
});
test('stops cannot duplicate; ordering, boundaries and removal are immutable', () => {
  const first = appReducer(initialState, { type: 'addStop', id: 'near' });
  assert.equal(appReducer(first, { type: 'addStop', id: 'near' }), first);
  const second = appReducer(first, { type: 'addStop', id: 'far' });
  assert.deepEqual(appReducer(second, { type: 'moveStop', id: 'far', direction: -1 }).planIds, [
    'far',
    'near',
  ]);
  assert.equal(appReducer(second, { type: 'moveStop', id: 'near', direction: -1 }), second);
  assert.equal(appReducer(second, { type: 'moveStop', id: 'missing', direction: 1 }), second);
  assert.deepEqual(appReducer(second, { type: 'removeStop', id: 'near' }).planIds, ['far']);
  assert.deepEqual(first.planIds, ['near']);
});
test('bookmarks toggle and resetting filters preserves town and plan', () => {
  const saved = appReducer(initialState, { type: 'toggleSaved', id: 'near' });
  assert.deepEqual(appReducer(saved, { type: 'toggleSaved', id: 'near' }).savedIds, []);
  const state = {
    ...saved,
    filters: { ...defaultFilters, area: 'belagavi' as const, query: 'x' },
    planIds: ['near'],
  };
  const reset = appReducer(state, { type: 'resetFilters' });
  assert.equal(reset.filters.area, 'belagavi');
  assert.equal(reset.filters.query, '');
  assert.deepEqual(reset.planIds, ['near']);
  assert.deepEqual(reset.savedIds, ['near']);
});
test('storage round trip recovers known unique IDs and preferences', async () => {
  let raw: string | null = null;
  const storage = {
    getItem: async (key: string) => {
      assert.equal(key, STORAGE_KEY);
      return raw;
    },
    setItem: async (_key: string, value: string) => {
      raw = value;
    },
  };
  assert.deepEqual(await loadState(storage, ['near']), initialState);
  await createStateWriter(storage)({
    ...initialState,
    savedIds: ['near', 'gone', 'near'],
    planIds: ['near', 'near'],
  });
  assert.deepEqual((await loadState(storage, ['near'])).savedIds, ['near']);
  assert.deepEqual((await loadState(storage, ['near'])).planIds, ['near']);
});
test('corrupt, unknown-version and invalid preferences fail without writing', async () => {
  for (const raw of [
    '{bad',
    'null',
    '{}',
    JSON.stringify({ version: 999, state: initialState }),
    JSON.stringify({
      version: 1,
      state: { ...initialState, filters: { ...defaultFilters, transport: 'train' } },
    }),
    JSON.stringify({
      version: 1,
      state: { ...initialState, filters: { ...defaultFilters, radiusKm: -1 } },
    }),
  ]) {
    assert.throws(() => decodeState(raw, []));
  }
  let writes = 0;
  await assert.rejects(
    loadState(
      {
        getItem: async () => '{bad',
        setItem: async () => {
          writes++;
        },
      },
      [],
    ),
  );
  assert.equal(writes, 0);
  await assert.rejects(
    loadState(
      {
        getItem: async () => {
          throw new Error('read failed');
        },
        setItem: async () => {},
      },
      [],
    ),
  );
});
test('writes are ordered and recover after a failed write', async () => {
  const writes: string[][] = [];
  let fail = true;
  const writer = createStateWriter({
    getItem: async () => null,
    setItem: async (_key, value) => {
      if (fail) {
        fail = false;
        throw new Error('disk full');
      }
      writes.push(JSON.parse(value).state.planIds);
    },
  });
  await assert.rejects(writer(initialState));
  await Promise.all([
    writer({ ...initialState, planIds: ['near'] }),
    writer({ ...initialState, planIds: ['near', 'far'] }),
  ]);
  assert.deepEqual(writes, [['near'], ['near', 'far']]);
});
test('seed data has stable IDs, usable coordinates, sources and honest hours', () => {
  assert.equal(places.length, 15);
  assert.equal(new Set(places.map((p) => p.id)).size, 15);
  for (const place of places) {
    assert.ok(place.coordinates.latitude > 14 && place.coordinates.latitude < 17);
    assert.ok(place.coordinates.longitude > 73 && place.coordinates.longitude < 76);
    assert.ok(place.sources.length);
    assert.equal(place.openingHours, null);
    if (place.photo) {
      assert.ok(place.photo.author);
      assert.ok(place.photo.license);
      assert.ok(place.photo.sourceUrl.startsWith('https://'));
    }
  }
});
