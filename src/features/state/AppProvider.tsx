import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { appReducer, initialState, type Action, type AppState } from './model';
import { createStateWriter, loadState } from './persistence';
import { placeRepository } from '../places/repository';

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  ready: boolean;
  storageStatus: 'loading' | 'saving' | 'saved' | 'error' | 'blocked';
  retryStorage: () => void;
  resetStorage: () => void;
}
const AppContext = createContext<AppContextValue | null>(null);
export function AppProvider({ children }: React.PropsWithChildren) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [ready, setReady] = useState(false);
  const [storageStatus, setStorageStatus] = useState<AppContextValue['storageStatus']>('loading');
  const [canWrite, setCanWrite] = useState(false);
  const [revision, setRevision] = useState(0);
  const writer = useRef(createStateWriter(AsyncStorage));
  const loading = useRef(false);
  const hydrate = useCallback(async () => {
    if (loading.current) return;
    loading.current = true;
    try {
      const loaded = await loadState(
        AsyncStorage,
        placeRepository.list().map((p) => p.id),
      );
      dispatch({ type: 'hydrate', state: loaded });
      setCanWrite(true);
      setStorageStatus('saved');
    } catch {
      setStorageStatus('blocked');
    } finally {
      setReady(true);
      loading.current = false;
    }
  }, []);
  // Loading external storage is a one-time synchronization, not derived UI state.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void hydrate();
  }, [hydrate]);
  useEffect(() => {
    if (!ready || !canWrite) return;
    let active = true;
    // Saving status reflects synchronization with the external storage system.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStorageStatus('saving');
    writer
      .current(state)
      .then(() => {
        if (active) setStorageStatus('saved');
      })
      .catch(() => {
        if (active) setStorageStatus('error');
      });
    return () => {
      active = false;
    };
  }, [state, ready, canWrite, revision]);
  const retryStorage = () => {
    if (canWrite) setRevision((r) => r + 1);
    else {
      setStorageStatus('loading');
      void hydrate();
    }
  };
  const resetStorage = () => {
    dispatch({ type: 'hydrate', state: initialState });
    setCanWrite(true);
    setRevision((r) => r + 1);
  };
  return (
    <AppContext.Provider
      value={{ state, dispatch, ready, storageStatus, retryStorage, resetStorage }}
    >
      {children}
    </AppContext.Provider>
  );
}
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be inside AppProvider');
  return context;
}
