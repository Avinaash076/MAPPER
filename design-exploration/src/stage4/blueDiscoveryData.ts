import type { SamplePlace } from '../data';

export const collectionNames = [
  'All places',
  'Lakes & landscapes',
  'Heritage',
  'Waterfalls',
] as const;
export type CollectionName = (typeof collectionNames)[number];
export function findDiscoveryPlaces(
  items: SamplePlace[],
  query: string,
  category: string,
  collection: CollectionName,
) {
  const search = query.trim().toLocaleLowerCase();
  const collectionCategory = {
    'All places': '',
    'Lakes & landscapes': 'Nature',
    Heritage: 'Heritage',
    Waterfalls: 'Waterfalls',
  }[collection];
  return items.filter((place) => {
    const matchesText = `${place.name} ${place.area}`.toLocaleLowerCase().includes(search);
    return (
      matchesText &&
      (!category || place.category === category) &&
      (!collectionCategory || place.category === collectionCategory)
    );
  });
}
