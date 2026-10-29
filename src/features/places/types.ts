export type Category = 'nature' | 'waterfalls' | 'heritage' | 'spiritual' | 'activities';
export type Transport = 'walking' | 'bicycle' | 'motorbike' | 'car';
export type AreaId = 'hubballi' | 'dharwad' | 'belagavi';
export interface Coordinates {
  latitude: number;
  longitude: number;
}
export interface Place {
  id: string;
  name: string;
  locality: string;
  categories: Category[];
  coordinates: Coordinates;
  description: string;
  visitMinutes: number;
  access: string;
  seasonalNotes: string;
  openingHours: string | null;
  sources: { title: string; url: string }[];
  photo?: { uri: string; author: string; license: string; sourceUrl: string; licenseUrl?: string };
}
export interface DiscoveryFilters {
  area: AreaId;
  query: string;
  categories: Category[];
  transport: Transport | null;
  radiusKm: number;
  budgetMinutes: number;
}
export const categories: { id: Category; label: string }[] = [
  { id: 'nature', label: 'Nature' },
  { id: 'waterfalls', label: 'Waterfalls' },
  { id: 'heritage', label: 'Heritage' },
  { id: 'spiritual', label: 'Spiritual' },
  { id: 'activities', label: 'Activities' },
];
export const transportLabels: Record<Transport, string> = {
  walking: 'Walking',
  bicycle: 'Bicycle',
  motorbike: 'Motorbike',
  car: 'Car',
};
export const areas: { id: AreaId; name: string; coordinates: Coordinates }[] = [
  { id: 'hubballi', name: 'Hubballi', coordinates: { latitude: 15.3647, longitude: 75.124 } },
  { id: 'dharwad', name: 'Dharwad', coordinates: { latitude: 15.4589, longitude: 75.0078 } },
  { id: 'belagavi', name: 'Belagavi', coordinates: { latitude: 15.8497, longitude: 74.4977 } },
];
export const defaultFilters: DiscoveryFilters = {
  area: 'hubballi',
  query: '',
  categories: [],
  transport: null,
  radiusKm: 100,
  budgetMinutes: 480,
};
export const distanceOptions = [5, 15, 30, 60, 100, 150];
export const timeOptions = [120, 240, 480, 720];
