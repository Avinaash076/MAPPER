import type { Category, Coordinates } from '../places/types';
export type SubmissionStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export interface CapturedLocation extends Coordinates {
  accuracyMeters: number | null;
  capturedAt: string;
  source: 'gps' | 'manual';
}
export interface DraftPhoto {
  id: string;
  localUri: string;
  width: number;
  height: number;
  caption: string;
}
export interface PlaceDraft {
  id: string;
  name: string;
  locality: string;
  description: string;
  categories: Category[];
  location: CapturedLocation | null;
  photos: DraftPhoto[];
  access: 'public' | 'permission' | 'unknown';
  accessNotes: string;
  sensitiveLocation: boolean;
  locationConfirmed: boolean;
  photoRightsConfirmed: boolean;
  sharingConsent: boolean;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
  reviewNote?: string;
}
