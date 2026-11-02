import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { initialJourney, rememberDestination, type JourneyState, type TravelPoint } from './model';
import { createJourneyWriter, decodeJourney, JOURNEY_KEY } from './persistence';

interface JourneyContextValue {
  state: JourneyState;
  ready: boolean;
  canWrite: boolean;
  error: string | null;
  update: (patch: Partial<JourneyState>) => void;
  chooseDestination: (point: TravelPoint) => void;
  toggleStop: (id: string) => void;
  retry: () => void;
}
const Context = createContext<JourneyContextValue | null>(null);
export function JourneyProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(initialJourney);
  const latest = useRef(initialJourney);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const revision = useRef(0);
  const writer = useRef(createJourneyWriter(AsyncStorage));
  const mounted = useRef(true);
  const restore = useCallback(() => {
    AsyncStorage.getItem(JOURNEY_KEY)
      .then((raw) => {
        if (!mounted.current) return;
        latest.current = decodeJourney(raw);
        setState(latest.current);
        setCanWrite(true);
        setError(null);
      })
      .catch(() => {
        if (mounted.current)
          setError(
            'Your saved journey could not be restored. Existing data is preserved. Retry restoration before making changes.',
          );
      })
      .finally(() => {
        if (mounted.current) setReady(true);
      });
  }, []);
  useEffect(() => {
    mounted.current = true;
    restore();
    return () => {
      mounted.current = false;
    };
  }, [restore]);
  function save(value: JourneyState) {
    if (!canWrite) return;
    const current = ++revision.current;
    void writer
      .current(value)
      .then(() => {
        if (current === revision.current) setError(null);
      })
      .catch(() => {
        if (current === revision.current)
          setError('Journey changes are not saved yet. Retry before leaving.');
      });
  }
  function update(patch: Partial<JourneyState>) {
    if (!canWrite) {
      setError(
        'Journey storage is unavailable. Retry restoration before making changes. Existing data is preserved.',
      );
      return;
    }
    latest.current = { ...latest.current, ...patch };
    setState(latest.current);
    save(latest.current);
  }
  function chooseDestination(point: TravelPoint) {
    const unchanged =
      latest.current.destination?.id === point.id &&
      latest.current.destination.coordinates.latitude === point.coordinates.latitude &&
      latest.current.destination.coordinates.longitude === point.coordinates.longitude;
    update({
      destination: point,
      ...(unchanged ? {} : { start: null, stopIds: [] }),
      recent: rememberDestination(latest.current.recent, point),
    });
  }
  function toggleStop(id: string) {
    const ids = latest.current.stopIds;
    update({ stopIds: ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id] });
  }
  return (
    <Context.Provider
      value={{
        state,
        ready,
        canWrite,
        error,
        update,
        chooseDestination,
        toggleStop,
        retry: () => (canWrite ? save(latest.current) : restore()),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useJourney() {
  const value = useContext(Context);
  if (!value) throw new Error('JourneyProvider is required');
  return value;
}
