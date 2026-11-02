import { useApp } from '../state/AppProvider';
import { useJourney } from '../journey/JourneyProvider';
import { areas } from './types';

export function useDiscoveryOrigin() {
  const { state } = useApp();
  const journey = useJourney();
  return journey.state.exploreOrigin ?? areas.find((area) => area.id === state.filters.area)!;
}
