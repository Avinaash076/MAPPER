import type { MapAppearance, ThemeMode } from '../designs';

export const screenNames = [
  'Welcome',
  'Map appearance',
  'Preferences',
  'Discover',
  'Map',
  'Search & filters',
  'Place details',
  'Hidden places',
  'Contribute',
  'Drafts & review',
  'AI assistant',
] as const;
export type StudyScreenName = (typeof screenNames)[number];
export type LayoutVariant = 0 | 1 | 2;
export interface StudyProps {
  mode: ThemeMode;
  appearance: MapAppearance;
  onAppearanceChange: (value: MapAppearance) => void;
  onThemeChange: (value: ThemeMode) => void;
}
export interface ScreenProps extends StudyProps {
  variant: LayoutVariant;
}
export function readVariant(value: string | null): LayoutVariant {
  return value === '1' ? 1 : value === '2' ? 2 : 0;
}
export function openStudy(
  screen: StudyScreenName,
  variant: LayoutVariant,
  mode: ThemeMode,
  placeId?: string,
) {
  const params = new URLSearchParams({
    page: 'stage4',
    screen,
    variant: String(variant),
    mode,
    compare: '0',
  });
  if (placeId) params.set('place', placeId);
  location.assign(`/?${params}`);
}
export const concepts = [
  {
    name: 'The field atlas',
    detail: 'An illustrated field guide with a numbered map index and concise local observations.',
    strength: 'Fast spatial scanning; the strongest A + B hybrid.',
    tradeoff: 'Less room for long stories.',
    reference: 'UI Coach: ShopX colour family; Lora + Source Sans Pro pairing.',
  },
  {
    name: 'The discovery lens',
    detail: 'A generous geographic view with one focused selection and compact controls.',
    strength: 'The clearest geographic hierarchy.',
    tradeoff: 'Comparing places requires more selection changes.',
    reference: 'UI Coach: Land of Ride slate and amber; Manrope controls.',
  },
  {
    name: 'The local notebook',
    detail: 'Photographic observations and personal notes alongside a geographic reference.',
    strength: 'Invites exploration and local contributions.',
    tradeoff: 'More scrolling on a small screen.',
    reference: 'UI Coach: Philosophical Foxes sandstone and terracotta; editorial serif headings.',
  },
] as const;

export const layoutNotes: Record<StudyScreenName, readonly [string, string, string]> = {
  'AI assistant': [
    'Optional place-aware help with example answers.',
    'Focused conversation, sources and a reachable question composer.',
    'A quiet reading layout for questions about places.',
  ],
  Welcome: [
    'Illustration above an introductory letter; split cover on PC.',
    'Compact invitation first, then a landscape strip.',
    'Inset cover, editorial caption and local place index.',
  ],
  'Map appearance': [
    'Large context map above paired style choices.',
    'Style choices first, with context map below.',
    'Stacked choices at narrow widths; side-by-side in map layers.',
  ],
  Preferences: [
    'One compact form with optional interests and transport.',
    'Three focused steps: town, interests, transport.',
    'Map and introductory letter beside the preference form.',
  ],
  Discover: [
    'Numbered place index beside the map on PC.',
    'Search and filters above the map; contribution immediately below; optional tools collapsed.',
    'Photographic discovery stories before the geographic reference.',
  ],
  Map: [
    'Map with an expandable place index.',
    'A large map and one concise selection sheet.',
    'Map with a horizontally browsable photographic place strip.',
  ],
  'Search & filters': [
    'Direct search, interests and radius in one panel.',
    'Search results with a persistent map reference.',
    'Natural-language concept above structured refinements.',
  ],
  'Place details': [
    'Photo first, then field notes and practical facts.',
    'Title and location first, followed by photography.',
    'Large editorial photograph paired with a reading column.',
  ],
  'Hidden places': [
    'A seasonal field guide with distinct collections.',
    'A compact photographic index for fast scanning.',
    'An asymmetric sequence of stories with community context.',
  ],
  Contribute: [
    'Single form, with privacy explained before capture.',
    'Location, photos and story in three reversible steps.',
    'Writing and photographs first; location review follows.',
  ],
  'Drafts & review': [
    'A clear status ledger with a next action for each entry.',
    'A timeline distinguishing private, pending and public.',
    'Photographic contribution receipts with review notes.',
  ],
};
