import type { StoragePort } from '../features/state/persistence';
export type ThemePreference = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';
export const THEME_STORAGE_KEY = 'northern-trails:appearance';

export function decodeThemePreference(value: string | null): ThemePreference {
  if (value === null) return 'system';
  if (value === 'system' || value === 'light' || value === 'dark') return value;
  throw new Error('Unknown appearance preference');
}

export function resolveColorScheme(
  preference: ThemePreference,
  systemScheme: ColorScheme | null | undefined,
): ColorScheme {
  return preference === 'system' ? (systemScheme ?? 'light') : preference;
}

export function createThemeWriter(storage: StoragePort) {
  let pending = Promise.resolve();
  return (preference: ThemePreference) => {
    pending = pending.catch(() => {}).then(() => storage.setItem(THEME_STORAGE_KEY, preference));
    return pending;
  };
}
