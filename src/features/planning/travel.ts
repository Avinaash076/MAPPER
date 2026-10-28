import type { Coordinates, Place, Transport } from '../places/types';
export function distanceKm(a: Coordinates, b: Coordinates): number {
  const rad = (n: number) => (n * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}
const speeds: Record<Transport, number> = { walking: 4, bicycle: 12, motorbike: 35, car: 35 };
export function estimateTravelMinutes(a: Coordinates, b: Coordinates, mode: Transport): number {
  return Math.ceil(((distanceKm(a, b) * 1.3) / speeds[mode]) * 60);
}
export interface PlanSummary {
  travelMinutes: number;
  visitMinutes: number;
  totalMinutes: number;
  overBudget: boolean;
  legs: number[];
}
export function summarizePlan(
  places: Place[],
  origin: Coordinates,
  mode: Transport,
  budget: number,
): PlanSummary {
  let previous = origin;
  const legs = places.map((place) => {
    const minutes = estimateTravelMinutes(previous, place.coordinates, mode);
    previous = place.coordinates;
    return minutes;
  });
  const returnMinutes = places.length ? estimateTravelMinutes(previous, origin, mode) : 0;
  const travelMinutes = legs.reduce((a, b) => a + b, 0) + returnMinutes;
  const visitMinutes = places.reduce((sum, p) => sum + p.visitMinutes, 0);
  return {
    travelMinutes,
    visitMinutes,
    totalMinutes: travelMinutes + visitMinutes,
    overBudget: travelMinutes + visitMinutes > budget,
    legs: [...legs, returnMinutes],
  };
}
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} hr${minutes % 60 ? ` ${minutes % 60} min` : ''}`;
}
