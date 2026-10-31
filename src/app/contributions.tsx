import { useCallback, useState } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import { Button, EmptyState, Label, layout, Notice, Panel, Screen } from '../components/ui';
import { draftRepository } from '../features/contributions/localDrafts';
import { createEmptyDraft, submissionProblems } from '../features/contributions/model';
import { getMySubmissionStatuses } from '../features/contributions/submissionService';
import { SignInPanel } from '../features/contributions/SignInPanel';
import type { PlaceDraft } from '../features/contributions/types';
import { Disclosure } from '../components/ui/Disclosure';

export default function ContributionsScreen() {
  const [drafts, setDrafts] = useState<PlaceDraft[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      setDrafts(
        (await draftRepository.list()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      );
      setError('');
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Drafts could not be loaded.');
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  async function createDraft() {
    setBusy(true);
    try {
      const draft = createEmptyDraft(randomUUID());
      await draftRepository.save(draft);
      router.push({ pathname: '/contribute', params: { id: draft.id } });
    } catch {
      setError('A new draft could not be saved. Please retry.');
    } finally {
      setBusy(false);
    }
  }
  async function refreshReviews() {
    setBusy(true);
    setError('');
    try {
      const statuses = await getMySubmissionStatuses();
      const local = await draftRepository.list();
      for (const row of statuses) {
        const draft = local.find((item) => item.id === row.id);
        if (draft)
          await draftRepository.save({
            ...draft,
            status: row.status,
            reviewNote: row.review_note ?? undefined,
          });
      }
      await load();
    } catch {
      setError('Review status could not be refreshed. Your private drafts are still here.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen>
      <Label size="title" accessibilityRole="header">
        Your hidden places
      </Label>
      <Label tone="textMuted">
        Capture a location in the field. Add photos and a story now or later.
      </Label>
      {error ? <Notice warning>{error}</Notice> : null}
      {error && (
        <Button
          label="Retry loading drafts"
          secondary
          onPress={() => {
            void load();
          }}
        />
      )}
      {drafts.length > 0 && (
        <Button
          label={busy ? 'Please wait…' : 'Add a hidden place'}
          disabled={busy}
          onPress={() => {
            void createDraft();
          }}
        />
      )}
      {!drafts.length && !error && (
        <EmptyState
          title="Know somewhere special?"
          message="Start a private draft. Incomplete drafts can be saved without a connection."
          action="Create your first draft"
          onAction={() => {
            void createDraft();
          }}
        />
      )}
      {drafts.map((draft) => (
        <Panel key={draft.id} style={layout.section}>
          <Label size="heading">{draft.name || 'Untitled hidden place'}</Label>
          <Label size="small" tone="textMuted">
            {draft.status === 'draft'
              ? 'Private draft'
              : draft.status === 'pending'
                ? 'Awaiting review'
                : draft.status === 'approved'
                  ? 'Approved'
                  : 'Needs changes'}{' '}
            · {draft.photos.length} photos · {draft.location ? 'location saved' : 'no location yet'}
          </Label>
          {draft.reviewNote && <Label>{draft.reviewNote}</Label>}
          {(draft.status === 'draft' || draft.status === 'rejected') && (
            <Label size="small" tone="textMuted">
              {submissionProblems(draft)[0] ?? 'Ready for your final review.'}
            </Label>
          )}
          {draft.status === 'pending' && (
            <Label size="small">Sent privately. Waiting for an administrator’s review.</Label>
          )}
          {draft.status === 'approved' && (
            <Label size="small">
              Reviewed for publication. Current access still needs checking.
            </Label>
          )}
          <Button
            label={
              draft.status === 'draft' || draft.status === 'rejected'
                ? 'Continue draft'
                : 'View contribution'
            }
            secondary
            onPress={() => router.push({ pathname: '/contribute', params: { id: draft.id } })}
          />
        </Panel>
      ))}
      <Disclosure title="Account & review updates">
        <SignInPanel />
        <Button
          label="Refresh review status"
          secondary
          disabled={busy}
          onPress={() => {
            void refreshReviews();
          }}
        />
      </Disclosure>
    </Screen>
  );
}
