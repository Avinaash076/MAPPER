import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import type { MapAppearance } from './types';

const key = 'mapper:map-appearance:v1';
const Context = createContext<{
  appearance: MapAppearance;
  choose: (value: MapAppearance) => void;
  error: boolean;
} | null>(null);
export function MapPreferences({ children }: PropsWithChildren) {
  const [appearance, setAppearance] = useState<MapAppearance>('liberty');
  const [error, setError] = useState(false);
  const revision = useRef(0);
  const queue = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(key)
      .then((value) => {
        if (active && revision.current === 0) setAppearance(value === 'dark' ? 'dark' : 'liberty');
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);
  function choose(value: MapAppearance) {
    revision.current += 1;
    setAppearance(value);
    queue.current = queue.current
      .catch(() => {})
      .then(() => AsyncStorage.setItem(key, value))
      .then(() => setError(false))
      .catch(() => setError(true));
  }
  return <Context.Provider value={{ appearance, choose, error }}>{children}</Context.Provider>;
}
export function useMapAppearance() {
  const value = useContext(Context);
  if (!value) throw new Error('MapPreferences provider is required');
  return value;
}
