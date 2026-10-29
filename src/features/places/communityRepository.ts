import { communityClient } from '../../services/communityClient';
import type { Category, Place } from './types';
import { categories } from './types';
import { validCoordinates } from '../contributions/model';

export async function loadCommunityPlaces(): Promise<Place[]> {
  if (!communityClient) return [];
  const result = await communityClient
    .from('community_places')
    .select(
      'id,name,locality,description,categories,latitude,longitude,access_notes,photos,credit,reviewed_at',
    );
  if (result.error) throw new Error(result.error.message);
  const photoPaths = result.data.flatMap((row) =>
    Array.isArray(row.photos) && typeof row.photos[0]?.path === 'string'
      ? [row.photos[0].path]
      : [],
  );
  const signed = photoPaths.length
    ? await communityClient.storage.from('place-photos').createSignedUrls(photoPaths, 3600)
    : null;
  const photoUrls = new Map(
    (signed?.data ?? []).flatMap((photo) =>
      photo.path && photo.signedUrl ? [[photo.path, photo.signedUrl] as const] : [],
    ),
  );
  const places: Place[] = [];
  for (const row of result.data) {
    if (
      typeof row.id !== 'string' ||
      typeof row.name !== 'string' ||
      !validCoordinates(row.latitude, row.longitude) ||
      !Array.isArray(row.categories)
    )
      continue;
    const interests = row.categories.filter((id: unknown): id is Category =>
      categories.some((category) => category.id === id),
    );
    if (!interests.length) continue;
    const photo = Array.isArray(row.photos) ? row.photos[0] : null;
    const photoUrl = photo?.path ? photoUrls.get(photo.path) : undefined;
    places.push({
      id: 'community:' + row.id,
      name: row.name,
      locality: row.locality,
      description: row.description,
      categories: interests,
      coordinates: { latitude: row.latitude, longitude: row.longitude },
      visitMinutes: 60,
      access: row.access_notes || 'Confirm current access locally before visiting.',
      seasonalNotes:
        'Community contribution reviewed on ' +
        new Date(row.reviewed_at).toLocaleDateString() +
        '. Current conditions can change.',
      openingHours: null,
      sources: [],
      ...(photoUrl
        ? {
            photo: {
              uri: photoUrl,
              sourceUrl: photoUrl,
              author: row.credit,
              license: 'Shared by contributor with permission',
            },
          }
        : {}),
    });
  }
  return places;
}
