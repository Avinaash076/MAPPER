export const lightColors = {
  background: '#F8F6F0',
  surface: '#FFFEFA',
  text: '#202F28',
  textMuted: '#59665D',
  primary: '#245740',
  onPrimary: '#FFFFFF',
  primarySoft: '#E4EDE2',
  border: '#C9CFC4',
  accent: '#855426',
  accentSoft: '#F3EADB',
  danger: '#A33D35',
  dangerSoft: '#F9EAE5',
};

export type ThemeColors = { [Key in keyof typeof lightColors]: string };

export const darkColors: ThemeColors = {
  background: '#181818',
  surface: '#232723',
  text: '#F8F6F0',
  textMuted: '#BAC5BC',
  primary: '#ABD3B8',
  onPrimary: '#163322',
  primarySoft: '#2C4033',
  border: '#526356',
  accent: '#E8BE85',
  accentSoft: '#3B3024',
  danger: '#FFB6A9',
  dangerSoft: '#442C2B',
};
