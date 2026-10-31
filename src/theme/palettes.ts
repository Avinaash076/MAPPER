export const lightColors = {
  background: '#F3F5F7',
  surface: '#FFFFFF',
  text: '#1B2B38',
  textMuted: '#506171',
  primary: '#294E69',
  onPrimary: '#FFFFFF',
  primarySoft: '#DCE8F0',
  border: '#758795',
  accent: '#805B00',
  accentSoft: '#F7EDCB',
  danger: '#A33D35',
  dangerSoft: '#F9EAE5',
};

export type ThemeColors = { [Key in keyof typeof lightColors]: string };

export const darkColors: ThemeColors = {
  background: '#111B24',
  surface: '#192733',
  text: '#EFF4F8',
  textMuted: '#AFBECA',
  primary: '#9BC6E3',
  onPrimary: '#122A3C',
  primarySoft: '#2B4154',
  border: '#718A9D',
  accent: '#F0C85C',
  accentSoft: '#343025',
  danger: '#FFB6A9',
  dangerSoft: '#442C2B',
};
