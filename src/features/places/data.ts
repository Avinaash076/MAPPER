import type { Place } from './types';
import { seedPlaces } from './seedPlaces';
import photos from './photos.json';

const photoById: Record<string, Place['photo']> = photos;

export const places: Place[] = seedPlaces.map((place) => ({
  ...place,
  photo: photoById[place.id],
}));
