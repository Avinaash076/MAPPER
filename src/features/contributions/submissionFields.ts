import type { PlaceDraft } from './types';

export function buildSubmissionFields(draft: PlaceDraft, ownerId: string) {
  if (!draft.location) throw new Error('A place location is required.');
  return {
    name: draft.name.trim(),
    locality: draft.locality.trim(),
    description: draft.description.trim(),
    categories: draft.categories,
    latitude: draft.location.latitude,
    longitude: draft.location.longitude,
    accuracy_meters: draft.location.accuracyMeters,
    captured_at: draft.location.capturedAt,
    location_source: draft.location.source,
    access: draft.access,
    access_notes: draft.accessNotes,
    sensitive_location: draft.sensitiveLocation,
    location_confirmed: draft.locationConfirmed,
    photo_rights_confirmed: draft.photoRightsConfirmed,
    sharing_consent: draft.sharingConsent,
    photos: draft.photos.map((photo) => ({
      id: photo.id,
      path: `${ownerId}/${draft.id}/${photo.id}.jpg`,
      caption: photo.caption,
      width: photo.width,
      height: photo.height,
    })),
    status: 'draft' as const,
  };
}
