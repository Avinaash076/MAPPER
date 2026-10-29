import type { StoragePort } from '../state/persistence';
import type { PlaceDraft } from './types';
import { validCoordinates } from './model';
import { categories } from '../places/types';
export const DRAFTS_KEY = 'northern-trails:place-drafts:v1';

export function decodeDrafts(raw: string | null): PlaceDraft[] {
  if (raw === null) return [];
  const data = JSON.parse(raw);
  if (!data || data.version !== 1 || !Array.isArray(data.drafts))
    throw new Error('Saved place drafts could not be read. Existing data has been preserved.');
  for (const draft of data.drafts) {
    if (
      !draft ||
      typeof draft.id !== 'string' ||
      typeof draft.name !== 'string' ||
      typeof draft.description !== 'string' ||
      typeof draft.locality !== 'string' ||
      typeof draft.accessNotes !== 'string' ||
      typeof draft.createdAt !== 'string' ||
      typeof draft.updatedAt !== 'string' ||
      !['public', 'permission', 'unknown'].includes(draft.access) ||
      !['sensitiveLocation', 'locationConfirmed', 'photoRightsConfirmed', 'sharingConsent'].every(
        (key) => typeof draft[key] === 'boolean',
      ) ||
      !Array.isArray(draft.categories) ||
      !draft.categories.every((id: unknown) => categories.some((category) => category.id === id)) ||
      !Array.isArray(draft.photos) ||
      draft.photos.length > 5 ||
      !['draft', 'pending', 'approved', 'rejected'].includes(draft.status) ||
      (draft.location !== null &&
        (!draft.location ||
          !validCoordinates(draft.location.latitude, draft.location.longitude) ||
          typeof draft.location.capturedAt !== 'string' ||
          !Number.isFinite(Date.parse(draft.location.capturedAt)) ||
          !['gps', 'manual'].includes(draft.location.source) ||
          (draft.location.accuracyMeters !== null &&
            (!Number.isFinite(draft.location.accuracyMeters) ||
              draft.location.accuracyMeters < 0)))) ||
      !draft.photos.every(
        (
          photo: {
            id?: unknown;
            localUri?: unknown;
            caption?: unknown;
            width?: unknown;
            height?: unknown;
          } | null,
        ) =>
          photo !== null &&
          typeof photo.id === 'string' &&
          typeof photo.localUri === 'string' &&
          typeof photo.caption === 'string' &&
          typeof photo.width === 'number' &&
          photo.width > 0 &&
          typeof photo.height === 'number' &&
          photo.height > 0,
      )
    )
      throw new Error('A saved place draft is invalid. Existing data has been preserved.');
  }
  return data.drafts;
}

export function createDraftRepository(storage: StoragePort) {
  let pending: Promise<unknown> = Promise.resolve();
  async function read() {
    return decodeDrafts(await storage.getItem(DRAFTS_KEY));
  }
  function enqueue<Result>(work: () => Promise<Result>): Promise<Result> {
    const result = pending.catch(() => {}).then(work);
    pending = result;
    return result;
  }
  return {
    list: () => enqueue(read),
    save: (draft: PlaceDraft) =>
      enqueue(async () => {
        const drafts = await read();
        const next = [...drafts.filter((item) => item.id !== draft.id), draft];
        const serialized = JSON.stringify({ version: 1, drafts: next });
        decodeDrafts(serialized);
        await storage.setItem(DRAFTS_KEY, serialized);
        return draft;
      }),
    remove: (id: string) =>
      enqueue(async () => {
        const drafts = (await read()).filter((draft) => draft.id !== id);
        await storage.setItem(DRAFTS_KEY, JSON.stringify({ version: 1, drafts }));
      }),
  };
}
