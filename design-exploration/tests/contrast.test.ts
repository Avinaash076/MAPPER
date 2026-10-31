import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { designs, semanticColors } from '../src/designs';
import { places, photoCredit } from '../src/data';

function luminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/../g)!
    .map((channel) => parseInt(channel, 16) / 255)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(first: string, second: string) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('text, theme-inherited icons and essential boundaries meet their numerical contrast thresholds', () => {
  for (const design of Object.values(designs)) {
    for (const mode of ['light', 'dark'] as const) {
      const colors = design.colors[mode];
      for (const background of [colors.background, colors.surface, colors.raised]) {
        for (const foreground of [
          colors.text,
          colors.muted,
          colors.accent,
          ...Object.values(semanticColors[mode]),
        ]) {
          assert.ok(
            contrast(foreground, background) >= 4.5,
            `${design.id} ${mode}: ${foreground} on ${background}`,
          );
        }
        assert.ok(
          contrast(colors.border, background) >= 3,
          `${design.id} ${mode} control boundary`,
        );
      }
      assert.ok(contrast(colors.onPrimary, colors.primary) >= 4.5);
      assert.ok(contrast(colors.onSecondary, colors.secondary) >= 4.5);
    }
  }
});

test('every displayed photo has a local asset, author and source, with stable unique place IDs', () => {
  assert.equal(new Set(places.map((place) => place.id)).size, places.length);
  for (const place of places) {
    const credit = photoCredit(place);
    assert.ok(credit.author && credit.license && credit.sourceUrl.startsWith('https://'));
    assert.ok(existsSync(new URL(`../assets/photos/${place.id}.jpg`, import.meta.url)), place.id);
    assert.ok(place.coordinates.every(Number.isFinite));
  }
  assert.equal(
    photoCredit(places.find((place) => place.id === 'gokak-falls')!).author,
    'Sandeep Prakash',
  );
});
