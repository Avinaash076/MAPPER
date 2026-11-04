import type { Coordinates, Transport } from '../../features/places/types.ts';

export interface AddressResult {
  id: string;
  name: string;
  coordinates: Coordinates;
}
export interface RouteResult {
  provider: 'Geoapify';
  fetchedAt: string;
  distanceMeters: number;
  durationSeconds: number;
  legSeconds: number[];
  geometry: { type: 'MultiLineString'; coordinates: number[][][] };
}
export interface WeatherResult {
  provider: 'Open-Meteo';
  fetchedAt: string;
  date: string;
  timezone: 'Asia/Kolkata';
  minC: number;
  maxC: number;
  rainChance: number | null;
}
export interface LiveAnswer {
  title: string;
  body: string;
  sources: { title: string; url: string }[];
  placeId?: string;
  demo: false;
}
export interface TravelRequests {
  search: { query: string };
  route: { points: Coordinates[]; transport: Transport };
  weather: { coordinates: Coordinates; date: string };
  assistant: { question: string; area: string; placeIds: string[] };
}
export interface TravelResults {
  search: AddressResult[];
  route: RouteResult;
  weather: WeatherResult;
  assistant: LiveAnswer;
}
export type TravelAction = keyof TravelRequests;
