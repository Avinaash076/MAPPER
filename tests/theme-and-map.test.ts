import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lightColors, darkColors } from '../src/theme/palettes';
import {
  createThemeWriter,
  decodeThemePreference,
  resolveColorScheme,
} from '../src/theme/preferences';
import { placesToGeoJson, getMapStyle } from '../src/features/map/model';
import { places } from '../src/features/places/data';
import { filterPlaces } from '../src/features/places/discovery';
import { defaultFilters } from '../src/features/places/types';
import { decodeState } from '../src/features/state/persistence';
import { initialState } from '../src/features/state/model';
import { decodeCatalogCache } from '../src/features/places/catalogCache';

function luminance(hex: string) {
  const parts = [1, 3, 5]
    .map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return parts[0] * 0.2126 + parts[1] * 0.7152 + parts[2] * 0.0722;
}
function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('both themes meet ordinary-text contrast for active controls and notices', () => {
  for (const palette of [lightColors, darkColors]) {
    for (const [foreground, background] of [
      [palette.text, palette.background],
      [palette.text, palette.surface],
      [palette.textMuted, palette.background],
      [palette.textMuted, palette.surface],
      [palette.onPrimary, palette.primary],
      [palette.primary, palette.primarySoft],
      [palette.accent, palette.surface],
      [palette.danger, palette.dangerSoft],
      [palette.textMuted, palette.accentSoft],
    ]) {
      assert.ok(
        contrast(foreground, background) >= 4.5,
        `${foreground} on ${background}: ${contrast(foreground, background).toFixed(2)}`,
      );
    }
  }
});
test('system appearance resolves safely and explicit choices take precedence', () => {
  assert.equal(resolveColorScheme('system', 'dark'), 'dark');
  assert.equal(resolveColorScheme('system', null), 'light');
  assert.equal(resolveColorScheme('light', 'dark'), 'light');
  assert.equal(resolveColorScheme('dark', 'light'), 'dark');
  assert.equal(decodeThemePreference(null), 'system');
  assert.equal(decodeThemePreference('dark'), 'dark');
  assert.throws(() => decodeThemePreference('invalid'));
});
test('appearance writes keep order and recover after storage failure', async () => {
  let fails = true;
  const writes: string[] = [];
  const write = createThemeWriter({
    getItem: async () => null,
    setItem: async (_key, value) => {
      if (fails) {
        fails = false;
        throw new Error('disk full');
      }
      writes.push(value);
    },
  });
  await assert.rejects(write('light'));
  await Promise.all([write('dark'), write('system')]);
  assert.deepEqual(writes, ['dark', 'system']);
});
test('optional transport does not silently apply car or travel-time filtering', () => {
  const sample = { ...places[0], visitMinutes: 500 };
  assert.equal(
    filterPlaces([sample], { ...defaultFilters, transport: null, budgetMinutes: 120 }).length,
    1,
  );
  assert.equal(
    filterPlaces([sample], { ...defaultFilters, transport: 'car', budgetMinutes: 120 }).length,
    0,
  );
});
test('v1 migration preserves plans, bookmarks and chosen transport; v2 accepts no transport', () => {
  const legacy = {
    ...initialState,
    planIds: [places[0].id],
    savedIds: [places[1].id],
    filters: { ...defaultFilters, transport: 'motorbike' },
  };
  const restored = decodeState(
    JSON.stringify({ version: 1, state: legacy }),
    places.map((place) => place.id),
  );
  assert.deepEqual(restored.planIds, legacy.planIds);
  assert.deepEqual(restored.savedIds, legacy.savedIds);
  assert.equal(restored.filters.transport, 'motorbike');
  assert.equal(
    decodeState(JSON.stringify({ version: 2, state: initialState }), []).filters.transport,
    null,
  );
});
test('map geometry uses longitude first and switches style without altering place data', () => {
  const collection = placesToGeoJson([places[0]]);
  assert.ok(collection.features[0].geometry);
  assert.ok(collection.features[0].properties);
  assert.deepEqual(collection.features[0].geometry.coordinates, [
    places[0].coordinates.longitude,
    places[0].coordinates.latitude,
  ]);
  assert.equal(collection.features[0].properties.id, places[0].id);
  assert.notEqual(getMapStyle('light'), getMapStyle('dark'));
  assert.deepEqual(placesToGeoJson([]).features, []);
});
test('catalog cache rejects damaged records and keeps community plan IDs while offline', () => {
  const id = 'community:11111111-1111-4111-8111-111111111111';
  const place = { ...places[0], id };
  assert.equal(decodeCatalogCache(JSON.stringify([place]))[0].id, id);
  assert.throws(() => decodeCatalogCache(JSON.stringify([{ id, coordinates: { latitude: 10 } }])));
  const restored = decodeState(
    JSON.stringify({ version: 2, state: { ...initialState, planIds: [id] } }),
    [],
  );
  assert.deepEqual(restored.planIds, [id]);
});
