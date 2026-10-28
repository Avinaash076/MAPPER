import { places } from './data';
export const placeRepository = {
  list: () => places,
  get: (id: string) => places.find((place) => place.id === id),
};
