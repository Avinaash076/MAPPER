import { initialState, type AppState } from './model';
import {
  areas,
  categories,
  distanceOptions,
  timeOptions,
  transportLabels,
  type Category,
  type DiscoveryFilters,
  type Transport,
} from '../places/types';
export const STORAGE_KEY = 'northern-trails:v1';
export interface StoragePort {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readFilters(value: unknown): DiscoveryFilters {
  if (!isRecord(value)) throw new Error('Invalid saved preferences');
  const area = areas.find((item) => item.id === value.area);
  const validTransport =
    typeof value.transport === 'string' && Object.hasOwn(transportLabels, value.transport);
  const validCategories =
    Array.isArray(value.categories) &&
    value.categories.every((item) => categories.some((category) => category.id === item));
  if (
    !area ||
    !validTransport ||
    !validCategories ||
    typeof value.query !== 'string' ||
    typeof value.radiusKm !== 'number' ||
    !distanceOptions.includes(value.radiusKm) ||
    typeof value.budgetMinutes !== 'number' ||
    !timeOptions.includes(value.budgetMinutes)
  ) {
    throw new Error('Invalid saved preferences');
  }
  return {
    area: area.id,
    query: value.query,
    categories: [...new Set(value.categories as Category[])],
    transport: value.transport as Transport,
    radiusKm: value.radiusKm,
    budgetMinutes: value.budgetMinutes,
  };
}

function knownUniqueIds(values: unknown[], knownIds: string[]): string[] {
  const validIds = values.filter(
    (id): id is string => typeof id === 'string' && knownIds.includes(id),
  );
  return [...new Set(validIds)];
}

export function decodeState(raw: string | null, knownIds: string[]): AppState {
  if (raw === null) return initialState;
  const data: unknown = JSON.parse(raw);
  if (!isRecord(data) || data.version !== 1 || !isRecord(data.state))
    throw new Error('Unsupported saved data');
  const state = data.state;
  if (!Array.isArray(state.savedIds) || !Array.isArray(state.planIds))
    throw new Error('Invalid saved places');
  return {
    filters: readFilters(state.filters),
    savedIds: knownUniqueIds(state.savedIds, knownIds),
    planIds: knownUniqueIds(state.planIds, knownIds),
  };
}
export async function loadState(storage: StoragePort, ids: string[]) {
  return decodeState(await storage.getItem(STORAGE_KEY), ids);
}
// Serialize writes so a slower old write cannot replace a newer plan.
export function createStateWriter(storage: StoragePort) {
  let pending = Promise.resolve();
  return (state: AppState): Promise<void> => {
    const serialized = JSON.stringify({ version: 1, state });
    pending = pending.catch(() => {}).then(() => storage.setItem(STORAGE_KEY, serialized));
    return pending;
  };
}
