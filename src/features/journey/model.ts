import {
  areas,
  type Coordinates,
  type Place,
  type Transport,
  type Category,
} from '../places/types';
import { distanceKm, estimateTravelMinutes } from '../planning/travel';

export interface TravelPoint {
  id: string;
  name: string;
  coordinates: Coordinates;
  placeId?: string;
}
export type TripExperience = 'direct' | 'along-route' | 'destination' | 'both';
export type BudgetPreference = 'any' | 'low' | 'flexible';
export const destinationRadii = [5, 10, 25, 50, 100] as const;
export const corridorRadii = [1, 3, 5, 10] as const;
export const experiences: { id: TripExperience; title: string; description: string }[] = [
  { id: 'direct', title: 'Direct trip', description: 'Keep the focus on your destination.' },
  {
    id: 'along-route',
    title: 'Explore along the way',
    description: 'Find stops near the road you take. Routing connection pending.',
  },
  {
    id: 'destination',
    title: 'Explore the destination',
    description: 'Find places around your destination.',
  },
  {
    id: 'both',
    title: 'Both',
    description: 'Explore the route and destination. Route suggestions pending.',
  },
];
export interface JourneyState {
  destination: TravelPoint | null;
  start: TravelPoint | null;
  experience: TripExperience;
  destinationRadiusKm: number;
  corridorRadiusKm: number;
  transport: Transport | null;
  departureTime: string;
  stopIds: string[];
  recent: TravelPoint[];
  exploreOrigin: TravelPoint | null;
  budget: BudgetPreference;
  travelDate: string;
}
export const initialJourney: JourneyState = {
  destination: null,
  start: null,
  experience: 'destination',
  destinationRadiusKm: 10,
  corridorRadiusKm: 3,
  transport: null,
  departureTime: '09:00',
  stopIds: [],
  recent: [],
  exploreOrigin: null,
  budget: 'any',
  travelDate: '',
};
export function townPoints(): TravelPoint[] {
  return areas.map((area) => ({
    id: `town:${area.id}`,
    name: area.name,
    coordinates: area.coordinates,
  }));
}
export function placePoint(place: Place): TravelPoint {
  return { id: place.id, placeId: place.id, name: place.name, coordinates: place.coordinates };
}
export function searchDestinations(query: string, places: Place[]): TravelPoint[] {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return [...townPoints(), ...places.map(placePoint)]
    .filter((point) => {
      const place = places.find((item) => item.id === point.placeId);
      const text = `${point.name} ${place?.locality ?? ''}`.toLocaleLowerCase();
      return words.every((word) => text.includes(word));
    })
    .slice(0, 8);
}
export function rememberDestination(recent: TravelPoint[], point: TravelPoint): TravelPoint[] {
  return [point, ...recent.filter((item) => item.id !== point.id)].slice(0, 5);
}
export function destinationSuggestions(
  places: Place[],
  journey: JourneyState,
  categories: Category[],
): Place[] {
  if (!journey.destination || !['destination', 'both'].includes(journey.experience)) return [];
  const origin = journey.destination.coordinates;
  return places
    .filter(
      (place) =>
        place.id !== journey.destination!.placeId &&
        (!categories.length ||
          categories.some((category) => place.categories.includes(category))) &&
        distanceKm(origin, place.coordinates) <= journey.destinationRadiusKm,
    )
    .sort((a, b) => distanceKm(origin, a.coordinates) - distanceKm(origin, b.coordinates));
}
export function validClock(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}
export function validTravelDate(value: string): boolean {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function arrivalLabel(departure: string, offsetMinutes: number): string | null {
  if (!validClock(departure)) return null;
  const [hours, minutes] = departure.split(':').map(Number);
  const total = hours * 60 + minutes + offsetMinutes;
  const days = Math.floor(total / 1440);
  const clock = `${String(Math.floor((total % 1440) / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  return days ? `${clock} (+${days} ${days === 1 ? 'day' : 'days'})` : clock;
}
export interface TripVisit {
  point: TravelPoint;
  visitMinutes: number;
  travelMinutes: number | null;
  arrivalMinutes: number | null;
}
export function estimateJourney(journey: JourneyState, places: Place[]) {
  if (!journey.start || !journey.destination) return null;
  const selected = [...new Set(journey.stopIds)].flatMap((id) => {
    const place = places.find((item) => item.id === id);
    return place && id !== journey.destination!.placeId ? [place] : [];
  });
  const target = places.find((place) => place.id === journey.destination!.placeId);
  const visits = [
    ...selected.map((place) => ({ point: placePoint(place), visitMinutes: place.visitMinutes })),
    { point: journey.destination, visitMinutes: target?.visitMinutes ?? 0 },
  ];
  let previous = journey.start.coordinates;
  let distance = 0;
  let elapsed = 0;
  let travel = 0;
  const stops: TripVisit[] = visits.map(({ point, visitMinutes }) => {
    distance += distanceKm(previous, point.coordinates);
    const minutes = journey.transport
      ? estimateTravelMinutes(previous, point.coordinates, journey.transport)
      : null;
    previous = point.coordinates;
    elapsed += minutes ?? 0;
    travel += minutes ?? 0;
    const arrivalMinutes = journey.transport ? elapsed : null;
    elapsed += visitMinutes;
    return { point, visitMinutes, travelMinutes: minutes, arrivalMinutes };
  });
  return {
    stops,
    straightLineKm: distance,
    travelMinutes: journey.transport ? travel : null,
    visitMinutes: visits.reduce((total, visit) => total + visit.visitMinutes, 0),
    totalMinutes: journey.transport ? elapsed : null,
  };
}
