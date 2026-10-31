import { photoCredits, referencePlaces } from './referenceData';
export interface SamplePlace {
  id: string;
  name: string;
  area: string;
  category: string;
  description: string;
  coordinates: [number, number];
  sourceUrl?: string;
}
export const places: SamplePlace[] = [
  {
    id: 'kelgeri-lake',
    name: 'Kelageri Lake',
    area: 'Dharwad',
    category: 'Nature',
    description: 'Make a little room for a lakeside pause.',
    coordinates: [74.987, 15.468],
  },
  {
    id: 'belagavi-fort',
    name: 'Belagavi Fort',
    area: 'Belagavi',
    category: 'Heritage',
    description: 'A different chapter in the city’s story.',
    coordinates: [74.528, 15.858],
  },
  {
    id: 'gokak-falls',
    name: 'Gokak Falls',
    area: 'Gokak',
    category: 'Waterfalls',
    description: 'Discover the landscape beyond the familiar.',
    coordinates: [74.775, 16.191],
  },
  {
    id: 'unkal-lake',
    name: 'Unkal Lake',
    area: 'Hubballi',
    category: 'Nature',
    description: 'A lakeside chapter in your city field guide.',
    coordinates: [75.123, 15.384],
    sourceUrl: 'https://en.wikipedia.org/wiki/Unkal_Lake',
  },
  ...referencePlaces.map((place) => ({
    id: place.id,
    name: place.name.split(',')[0],
    area: place.name.split(',')[0],
    category: ['dandeli', 'gokarna'].includes(place.id) ? 'Nature' : 'Heritage',
    description: ['dandeli', 'gokarna'].includes(place.id)
      ? 'Make space for a different horizon.'
      : 'Stone, detail and stories to explore at your own pace.',
    coordinates: place.coordinates as [number, number],
    sourceUrl: place.sourceUrl,
  })),
];
export function photoCredit(place: SamplePlace) {
  return photoCredits[place.id];
}
export const regions = {
  Dharwad: { center: [74.987, 15.468] as [number, number], zoom: 11 },
  Hubballi: { center: [75.124, 15.364] as [number, number], zoom: 11 },
  Belagavi: { center: [74.528, 15.858] as [number, number], zoom: 11 },
  Badami: { center: [75.676, 15.915] as [number, number], zoom: 11 },
  Hampi: { center: [76.46, 15.335] as [number, number], zoom: 11 },
  Gokarna: { center: [74.318, 14.547] as [number, number], zoom: 11 },
  Aihole: { center: [75.88194444, 16.01888889] as [number, number], zoom: 12 },
  Pattadakal: { center: [75.81472222, 15.95138889] as [number, number], zoom: 12 },
  Dandeli: { center: [74.622185, 15.252257] as [number, number], zoom: 11 },
};
export type Region = keyof typeof regions;
