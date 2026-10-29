import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createEmptyDraft,
  submissionProblems,
  validCoordinates,
  nearbyDuplicates,
} from '../src/features/contributions/model';
import { createDraftRepository, decodeDrafts } from '../src/features/contributions/repository';
import { isOwnedPhotoUri } from '../src/features/contributions/photoPolicy';
import { places } from '../src/features/places/data';
const draftId = '11111111-1111-4111-8111-111111111111';
const complete = {
  ...createEmptyDraft(draftId),
  name: 'Quiet rocky viewpoint',
  locality: 'Near Dharwad',
  description: 'A quiet rocky viewpoint reached by a short walk from the village.',
  categories: ['nature' as const],
  location: {
    ...places[0].coordinates,
    accuracyMeters: 12,
    capturedAt: '2026-10-29T05:00:00.000Z',
    source: 'gps' as const,
  },
  photos: [
    {
      id: draftId,
      localUri: 'photo:' + draftId,
      width: 800,
      height: 600,
      caption: 'Approach to the viewpoint',
    },
  ],
  locationConfirmed: true,
  photoRightsConfirmed: true,
  sharingConsent: true,
};
test('incomplete field drafts can be saved before location, photos and story are finished', async () => {
  let raw: string | null = null;
  const repo = createDraftRepository({
    getItem: async () => raw,
    setItem: async (_key, value) => {
      raw = value;
    },
  });
  await repo.save(createEmptyDraft(draftId));
  assert.equal((await repo.list())[0].id, draftId);
  assert.ok(submissionProblems((await repo.list())[0]).length > 0);
});
test('review submission requires location, story, photos and explicit rights/consent', () => {
  assert.deepEqual(submissionProblems(complete), []);
  assert.ok(
    submissionProblems({ ...complete, photoRightsConfirmed: false }).some((message) =>
      message.includes('permission'),
    ),
  );
  assert.ok(
    submissionProblems({ ...complete, sharingConsent: false }).some((message) =>
      message.includes('private review'),
    ),
  );
  assert.ok(
    submissionProblems({ ...complete, locationConfirmed: false }).some((message) =>
      message.includes('coordinates'),
    ),
  );
  assert.ok(
    submissionProblems({ ...complete, photos: [] }).some((message) => message.includes('photos')),
  );
  assert.ok(
    submissionProblems({ ...complete, description: 'Too short' }).some((message) =>
      message.includes('30'),
    ),
  );
});
test('coordinate validation accepts zero and rejects non-finite or out-of-range positions', () => {
  assert.equal(validCoordinates(0, 0), true);
  assert.equal(validCoordinates(-90, 180), true);
  for (const position of [
    [91, 0],
    [0, -181],
    [NaN, 10],
    [0, Infinity],
  ])
    assert.equal(validCoordinates(position[0], position[1]), false);
});
test('duplicate suggestions use proximity without blocking a separate nearby discovery', () => {
  assert.equal(nearbyDuplicates(complete, [places[0]])[0].id, places[0].id);
  assert.deepEqual(nearbyDuplicates({ ...complete, location: null }, places), []);
  assert.deepEqual(
    nearbyDuplicates(
      { ...complete, location: { ...complete.location, latitude: 0, longitude: 0 } },
      places,
    ),
    [],
  );
});
test('concurrent draft writes preserve different drafts and the latest edit', async () => {
  let raw: string | null = null;
  const repo = createDraftRepository({
    getItem: async () => raw,
    setItem: async (_key, value) => {
      raw = value;
    },
  });
  await Promise.all([
    repo.save(createEmptyDraft('first')),
    repo.save(createEmptyDraft('second')),
    repo.save({ ...createEmptyDraft('first'), name: 'Latest edit' }),
  ]);
  const restored = await repo.list();
  assert.equal(restored.length, 2);
  assert.equal(restored.find((item) => item.id === 'first')!.name, 'Latest edit');
});
test('damaged draft storage is preserved instead of overwritten by new drafts', async () => {
  let writes = 0;
  const repo = createDraftRepository({
    getItem: async () => '{bad',
    setItem: async () => {
      writes++;
    },
  });
  await assert.rejects(repo.save(createEmptyDraft(draftId)));
  assert.equal(writes, 0);
  assert.throws(() => decodeDrafts('{"version":2,"drafts":[]}'));
  assert.throws(() => decodeDrafts('{"version":1,"drafts":[{}]}'));
});
test('draft writer recovers after disk failure and pending state survives restart', async () => {
  let raw: string | null = null;
  let fail = true;
  const repo = createDraftRepository({
    getItem: async () => raw,
    setItem: async (_key, value) => {
      if (fail) {
        fail = false;
        throw new Error('full');
      }
      raw = value;
    },
  });
  await assert.rejects(repo.save(complete));
  await repo.save({ ...complete, status: 'pending' });
  assert.equal(decodeDrafts(raw)[0].status, 'pending');
});
test('photo operations are confined to copied app-owned JPEG paths', () => {
  const folder = 'file:///app/documents/place-drafts/';
  assert.equal(isOwnedPhotoUri(folder + draftId + '.jpg', folder), true);
  for (const uri of [
    folder + '../secret',
    folder + '%2e%2e/secret',
    folder + 'nested/' + draftId + '.jpg',
    'file:///elsewhere/' + draftId + '.jpg',
  ])
    assert.equal(isOwnedPhotoUri(uri, folder), false);
});
