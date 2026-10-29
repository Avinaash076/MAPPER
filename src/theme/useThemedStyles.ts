import { useMemo } from 'react';
import type { ThemeColors } from './palettes';
import { useTheme } from './ThemeProvider';

export function useThemedStyles<Styles>(createStyles: (colors: ThemeColors) => Styles): Styles {
  const { colors } = useTheme();
  return useMemo(() => createStyles(colors), [colors, createStyles]);
}
