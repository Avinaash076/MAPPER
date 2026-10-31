export type DesignDirection = 'A' | 'B' | 'C' | 'D';
export type ThemePreference = 'system' | 'light' | 'dark';
export type ThemeMode = 'light' | 'dark';
export type MapAppearance = 'liberty' | 'dark';

export interface Colors {
  background: string;
  surface: string;
  raised: string;
  text: string;
  muted: string;
  primary: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;
  accent: string;
  border: string;
  divider: string;
}
export interface Design {
  id: DesignDirection;
  name: string;
  shortName: string;
  description: string;
  headline: string;
  headingFont: string;
  radius: number;
  sheetRadius: number;
  colors: Record<ThemeMode, Colors>;
}

export const designs: Record<DesignDirection, Design> = {
  A: {
    id: 'A',
    name: 'Woven Field Guide',
    shortName: 'Field guide',
    description:
      'A quieter way to discover. Fine landscape texture, generous space and a warm, personal voice.',
    headline: 'A little nearby.\nA lot to discover.',
    headingFont: 'Lora',
    radius: 16,
    sheetRadius: 24,
    colors: {
      light: {
        background: '#F7F4EB',
        surface: '#FFFFFF',
        raised: '#EFE9DB',
        text: '#172820',
        muted: '#4D6257',
        primary: '#24543D',
        onPrimary: '#FFFFFF',
        secondary: '#E4ECE2',
        onSecondary: '#24543D',
        accent: '#815B19',
        border: '#778477',
        divider: '#D9DDD4',
      },
      dark: {
        background: '#141D18',
        surface: '#1C2921',
        raised: '#26372C',
        text: '#F5F2E8',
        muted: '#B6C4B8',
        primary: '#ABD3B3',
        onPrimary: '#12251A',
        secondary: '#304536',
        onSecondary: '#D8EBD9',
        accent: '#E8C682',
        border: '#718777',
        divider: '#3A4D40',
      },
    },
  },
  B: {
    id: 'B',
    name: 'Modern Cartographic Explorer',
    shortName: 'Map explorer',
    description:
      'Find your starting point. A precise, search-led layout that gives the map room to breathe.',
    headline: 'Your next discovery\nstarts here.',
    headingFont: 'Manrope',
    radius: 10,
    sheetRadius: 16,
    colors: {
      light: {
        background: '#F3F5F7',
        surface: '#FFFFFF',
        raised: '#E7EDF2',
        text: '#1B2B38',
        muted: '#506171',
        primary: '#294E69',
        onPrimary: '#FFFFFF',
        secondary: '#DCE8F0',
        onSecondary: '#294E69',
        accent: '#805B00',
        border: '#758795',
        divider: '#D6DFE6',
      },
      dark: {
        background: '#111B24',
        surface: '#192733',
        raised: '#233746',
        text: '#EFF4F8',
        muted: '#AFBECA',
        primary: '#9BC6E3',
        onPrimary: '#122A3C',
        secondary: '#2B4154',
        onSecondary: '#D5E9F7',
        accent: '#F0C85C',
        border: '#718A9D',
        divider: '#334957',
      },
    },
  },
  C: {
    id: 'C',
    name: 'Contemporary Dark Explorer',
    shortName: 'Quiet explorer',
    description:
      'Less noise. More discovery. Restrained mint, deep surfaces and photographs that tell the story.',
    headline: 'Make room\nfor the unexpected.',
    headingFont: 'Manrope',
    radius: 14,
    sheetRadius: 20,
    colors: {
      light: {
        background: '#F1F3F0',
        surface: '#FAFCF9',
        raised: '#E5EBE4',
        text: '#1C2822',
        muted: '#536459',
        primary: '#315E49',
        onPrimary: '#FFFFFF',
        secondary: '#E0EBE2',
        onSecondary: '#315E49',
        accent: '#496C59',
        border: '#758679',
        divider: '#D4DDD4',
      },
      dark: {
        background: '#141716',
        surface: '#1D2320',
        raised: '#29332D',
        text: '#F3F6F0',
        muted: '#B8C5BB',
        primary: '#B4DCC8',
        onPrimary: '#172D22',
        secondary: '#30473B',
        onSecondary: '#D8EBDD',
        accent: '#D0BE9C',
        border: '#788C7E',
        divider: '#3B4A40',
      },
    },
  },
  D: {
    id: 'D',
    name: 'Editorial Travel Journal',
    shortName: 'Travel journal',
    description:
      'Places with a story. Expansive photographs, editorial typography and thoughtful local discoveries.',
    headline: 'There is a story\naround every corner.',
    headingFont: 'Playfair Display',
    radius: 8,
    sheetRadius: 16,
    colors: {
      light: {
        background: '#FAF7F2',
        surface: '#FFFFFF',
        raised: '#F1E9DE',
        text: '#252A36',
        muted: '#625D58',
        primary: '#A54913',
        onPrimary: '#FFFFFF',
        secondary: '#F1E1D2',
        onSecondary: '#7C3715',
        accent: '#805B31',
        border: '#918174',
        divider: '#E1D6CB',
      },
      dark: {
        background: '#1B1918',
        surface: '#272321',
        raised: '#352F2A',
        text: '#F8F0E7',
        muted: '#CBBCAF',
        primary: '#F1B184',
        onPrimary: '#3B210F',
        secondary: '#493628',
        onSecondary: '#F6D9C2',
        accent: '#DFC291',
        border: '#9B8676',
        divider: '#504137',
      },
    },
  },
};

export const semanticColors = {
  light: { success: '#25633B', warning: '#795600', error: '#A82F36', information: '#294E69' },
  dark: { success: '#8FD7A3', warning: '#EAC568', error: '#FFB4AB', information: '#9BC6E3' },
};
export const spacing = [4, 8, 12, 16, 24, 32, 48] as const;
export const mapStyles: Record<MapAppearance, string> = {
  liberty: 'https://tiles.openfreemap.org/styles/liberty',
  dark: 'https://tiles.openfreemap.org/styles/dark',
};

export function resolveTheme(preference: ThemePreference, system: ThemeMode): ThemeMode {
  return preference === 'system' ? system : preference;
}
export function readMapAppearance(value: string | null): MapAppearance {
  return value === 'dark' ? 'dark' : 'liberty';
}
export function readThemePreference(value: string | null): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system';
}
