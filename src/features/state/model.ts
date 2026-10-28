import { defaultFilters, type DiscoveryFilters } from '../places/types';
export interface AppState {
  filters: DiscoveryFilters;
  savedIds: string[];
  planIds: string[];
}
export const initialState: AppState = { filters: defaultFilters, savedIds: [], planIds: [] };
export type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'filters'; filters: Partial<DiscoveryFilters> }
  | { type: 'resetFilters' }
  | { type: 'toggleSaved'; id: string }
  | { type: 'addStop'; id: string }
  | { type: 'removeStop'; id: string }
  | { type: 'moveStop'; id: string; direction: -1 | 1 };
export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'filters':
      return { ...state, filters: { ...state.filters, ...action.filters } };
    case 'resetFilters':
      return { ...state, filters: { ...defaultFilters, area: state.filters.area } };
    case 'toggleSaved':
      return {
        ...state,
        savedIds: state.savedIds.includes(action.id)
          ? state.savedIds.filter((id) => id !== action.id)
          : [...state.savedIds, action.id],
      };
    case 'addStop':
      return state.planIds.includes(action.id)
        ? state
        : { ...state, planIds: [...state.planIds, action.id] };
    case 'removeStop':
      return { ...state, planIds: state.planIds.filter((id) => id !== action.id) };
    case 'moveStop': {
      const from = state.planIds.indexOf(action.id);
      const to = from + action.direction;
      if (from < 0 || to < 0 || to >= state.planIds.length) return state;
      const planIds = [...state.planIds];
      [planIds[from], planIds[to]] = [planIds[to], planIds[from]];
      return { ...state, planIds };
    }
  }
}
