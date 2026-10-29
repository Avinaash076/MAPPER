import { categories, type Place } from '../places/types';
import { distanceKm } from '../planning/travel';
import type { PlaceDraft } from './types';

export function createEmptyDraft(id: string, now = new Date().toISOString()): PlaceDraft {
  return {
    id,
    name: '',
    locality: '',
    description: '',
    categories: [],
    location: null,
    photos: [],
    access: 'unknown',
    accessNotes: '',
    sensitiveLocation: false,
    locationConfirmed: false,
    photoRightsConfirmed: false,
    sharingConsent: false,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
}

export function validCoordinates(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function submissionProblems(draft: PlaceDraft): string[] {
  const problems: string[] = [];
  if (draft.name.trim().length < 3) problems.push('Add a place name of at least 3 characters.');
  if (!draft.locality.trim()) problems.push('Add the nearest village, town or area.');
  if (draft.description.trim().length < 30)
    problems.push('Describe the place in at least 30 characters.');
  if (
    !draft.categories.length ||
    !draft.categories.every((id) => categories.some((item) => item.id === id))
  )
    problems.push('Choose at least one interest.');
  if (!draft.location || !validCoordinates(draft.location.latitude, draft.location.longitude))
    problems.push('Capture or enter the place location.');
  if (!draft.locationConfirmed) problems.push('Confirm that the coordinates mark the place.');
  if (!draft.photos.length || draft.photos.length > 5)
    problems.push('Attach between 1 and 5 photos.');
  if (!draft.photoRightsConfirmed) problems.push('Confirm permission to share the photos.');
  if (!draft.sharingConsent)
    problems.push('Allow the location and photos to be sent for private review.');
  return problems;
}

export function nearbyDuplicates(draft: PlaceDraft, places: Place[]): Place[] {
  if (!draft.location) return [];
  return places.filter((place) => distanceKm(draft.location!, place.coordinates) < 0.25);
}
