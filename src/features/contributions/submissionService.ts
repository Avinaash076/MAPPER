import { communityClient } from '../../services/communityClient';
import { readPhotoBytes } from './photoStorage';
import { submissionProblems } from './model';
import { buildSubmissionFields } from './submissionFields';
import type { PlaceDraft, SubmissionStatus } from './types';

export async function submitDraft(draft: PlaceDraft): Promise<SubmissionStatus> {
  const problems = submissionProblems(draft);
  if (problems.length) throw new Error(problems.join('\n'));
  if (!communityClient)
    throw new Error(
      'Community sharing is not connected yet. Your draft is saved privately on this device.',
    );
  const { data: userData, error: userError } = await communityClient.auth.getUser();
  if (userError || !userData.user) throw new Error('Sign in before sending your place for review.');
  const user = userData.user;
  const existing = await communityClient
    .from('place_submissions')
    .select('status')
    .eq('id', draft.id)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  // Retrying after a lost response must not create a duplicate or edit a pending entry.
  if (existing.data && ['pending', 'approved'].includes(existing.data.status))
    return existing.data.status as SubmissionStatus;
  const fields = buildSubmissionFields(draft, user.id);
  const photos = fields.photos;
  // An UPDATE excludes immutable ownership columns; UPSERT would require broader privileges.
  const result = existing.data
    ? await communityClient
        .from('place_submissions')
        .update(fields)
        .eq('id', draft.id)
        .select('id')
        .single()
    : await communityClient
        .from('place_submissions')
        .insert({ id: draft.id, owner_id: user.id, ...fields })
        .select('id')
        .single();
  if (result.error) throw new Error(result.error.message);
  for (let index = 0; index < draft.photos.length; index++) {
    const bytes = await readPhotoBytes(draft.photos[index].localUri);
    if (bytes.byteLength > 5 * 1024 * 1024)
      throw new Error('A photo is larger than 5 MB. Remove it and attach a smaller copy.');
    const upload = await communityClient.storage
      .from('place-photos')
      .upload(photos[index].path, bytes, { contentType: 'image/jpeg', upsert: true });
    if (upload.error)
      throw new Error('Photo upload failed. Your local draft is safe; retry when connected.');
  }
  const submitted = await communityClient
    .from('place_submissions')
    .update({ status: 'pending' })
    .eq('id', draft.id)
    .eq('status', 'draft')
    .select('status')
    .single();
  if (submitted.error) throw new Error(submitted.error.message);
  return submitted.data.status as SubmissionStatus;
}

export async function getMySubmissionStatuses() {
  if (!communityClient) return [];
  const { data: session } = await communityClient.auth.getSession();
  if (!session.session) return [];
  const result = await communityClient.from('place_submissions').select('id,status,review_note');
  if (result.error) throw new Error(result.error.message);
  return result.data;
}
