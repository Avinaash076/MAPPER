import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { placeRepository } from './repository';
import { loadCommunityPlaces } from './communityRepository';
import type { Place } from './types';
import { decodeCatalogCache } from './catalogCache';
import { communityClient } from '../../services/communityClient';
const CACHE_KEY = 'northern-trails:reviewed-places';
interface CatalogValue {
  loading: boolean;
  places: Place[];
  refresh: () => Promise<void>;
  error: string | null;
}
const CatalogContext = createContext<CatalogValue | null>(null);

export function PlaceCatalogProvider({ children }: PropsWithChildren) {
  const [community, setCommunity] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    if (!communityClient) {
      setLoading(false);
      return;
    }
    try {
      const places = await loadCommunityPlaces();
      setCommunity(places);
      setError(null);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(places));
    } catch {
      setError('Community places could not be refreshed. Bundled places are still available.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(CACHE_KEY)
      .then((raw) => {
        if (!raw || !active) return;
        setCommunity(decodeCatalogCache(raw));
      })
      .catch(() => {})
      .finally(() => {
        if (active) void refresh();
      });
    return () => {
      active = false;
    };
  }, [refresh]);
  return (
    <CatalogContext.Provider
      value={{ places: [...placeRepository.list(), ...community], refresh, error, loading }}
    >
      {children}
    </CatalogContext.Provider>
  );
}
export function usePlaceCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('usePlaceCatalog must be inside PlaceCatalogProvider');
  return context;
}
