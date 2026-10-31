import assert from 'node:assert/strict';
import test from 'node:test';
import { designs, readMapAppearance, readThemePreference, resolveTheme } from '../src/designs';

test('the exploration contains four named, complete directions', () => {
  assert.deepEqual(Object.keys(designs), ['A', 'B', 'C', 'D']);
  for (const design of Object.values(designs)) {
    assert.ok(design.headingFont);
    assert.ok(design.radius >= 8);
    assert.equal(Object.keys(design.colors.light).length, 12);
    assert.equal(Object.keys(design.colors.dark).length, 12);
  }
});

test('theme preference restores safely and system mode resolves from the device', () => {
  assert.equal(readThemePreference('dark'), 'dark');
  assert.equal(readThemePreference('invalid'), 'system');
  assert.equal(resolveTheme('system', 'dark'), 'dark');
  assert.equal(resolveTheme('light', 'dark'), 'light');
});

test('map preference exposes exactly Liberty and Dark with a safe Liberty fallback', () => {
  assert.equal(readMapAppearance('dark'), 'dark');
  assert.equal(readMapAppearance('liberty'), 'liberty');
  assert.equal(readMapAppearance('anything else'), 'liberty');
});
