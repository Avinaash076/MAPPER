import { useEffect, useRef, useState } from 'react';
import { draftRepository } from './localDrafts';
import { captureCurrentLocation, pickDraftPhotos } from './capture';
import { submitDraft } from './submissionService';
import { removePhoto } from './photoStorage';
import type { PlaceDraft, DraftPhoto } from './types';

export function useDraftEditor(id: string | undefined) {
  const [draft, setDraft] = useState<PlaceDraft | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [saveState, setSaveState] = useState('Loading draft…');
  const latest = useRef<PlaceDraft | null>(null);
  const revision = useRef(0);
  const persistedPhotos = useRef<DraftPhoto[]>([]);
  useEffect(() => {
    let active = true;
    draftRepository
      .list()
      .then((drafts) => {
        if (!active) return;
        const found = drafts.find((item) => item.id === id);
        if (!found)
          throw new Error(
            'This draft could not be found. Return to Your hidden places and try again.',
          );
        latest.current = found;
        persistedPhotos.current = found.photos;
        setDraft(found);
        setSaveState('Saved privately on this device');
      })
      .catch((problem) => {
        if (active)
          setError(problem instanceof Error ? problem.message : 'Draft could not be loaded.');
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function change(patch: Partial<PlaceDraft>) {
    if (!latest.current) return;
    const next = { ...latest.current, ...patch, updatedAt: new Date().toISOString() };
    latest.current = next;
    setDraft(next);
    setSaveState('Saving privately…');
    const current = ++revision.current;
    try {
      await draftRepository.save(next);
      const previousPhotos = persistedPhotos.current;
      persistedPhotos.current = next.photos;
      for (const photo of previousPhotos.filter(
        (photo) => !next.photos.some((item) => item.id === photo.id),
      )) {
        await removePhoto(photo.localUri).catch(() => {});
      }
      if (current === revision.current) setSaveState('Saved privately on this device');
    } catch {
      if (current === revision.current) {
        setSaveState('Not saved yet');
        setError(
          'The draft could not be saved. Keep this screen open and tap Save draft to retry.',
        );
      }
    }
  }

  async function perform(label: string, work: () => Promise<void>) {
    setBusy(label);
    setError('');
    try {
      await work();
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : 'Something could not be completed. Please retry.',
      );
    } finally {
      setBusy('');
    }
  }
  const captureLocation = () =>
    perform('Finding your location…', async () => {
      const location = await captureCurrentLocation();
      await change({ location, locationConfirmed: false });
    });
  const addPhotos = (camera: boolean) =>
    perform('Preparing your photos…', async () => {
      const photos = await pickDraftPhotos(camera, 5 - (latest.current?.photos.length ?? 0));
      if (photos.length)
        await change({
          photos: [...(latest.current?.photos ?? []), ...photos],
          photoRightsConfirmed: false,
        });
    });
  const sendForReview = () =>
    perform('Sending privately for review…', async () => {
      if (!latest.current) return;
      await draftRepository.save(latest.current);
      const status = await submitDraft(latest.current);
      await change({ status });
    });
  return { draft, error, busy, saveState, change, captureLocation, addPhotos, sendForReview };
}
