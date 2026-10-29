import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { Platform, useColorScheme } from 'react-native';
import { darkColors, lightColors, type ThemeColors } from './palettes';
import {
  createThemeWriter,
  decodeThemePreference,
  resolveColorScheme,
  THEME_STORAGE_KEY,
  type ColorScheme,
  type ThemePreference,
} from './preferences';

interface ThemeContextValue {
  colors: ThemeColors;
  scheme: ColorScheme;
  preference: ThemePreference;
  ready: boolean;
  storageError: string | null;
  chooseTheme: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const writePreference = useRef(createThemeWriter(AsyncStorage));
  const saveRevision = useRef(0);
  const scheme = resolveColorScheme(preference, systemScheme === 'dark' ? 'dark' : 'light');
  const colors = scheme === 'dark' ? darkColors : lightColors;

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((value) => {
        if (active) setPreference(decodeThemePreference(value));
      })
      .catch(() => {
        if (active)
          setStorageError('Appearance could not be restored. Choose a theme to save it again.');
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    document.documentElement.style.colorScheme = scheme;
    document.documentElement.style.backgroundColor = colors.background;
    document.documentElement.dataset.theme = scheme;
  }, [scheme, colors.background]);

  function chooseTheme(next: ThemePreference) {
    setPreference(next);
    setStorageError(null);
    const revision = ++saveRevision.current;
    void writePreference.current(next).catch(() => {
      if (revision === saveRevision.current)
        setStorageError('Theme changed, but could not be saved. Tap your choice to retry.');
    });
  }

  return (
    <ThemeContext.Provider value={{ colors, scheme, preference, ready, storageError, chooseTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be inside ThemeProvider');
  return context;
}
