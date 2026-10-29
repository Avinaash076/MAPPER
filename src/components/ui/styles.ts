import type { ThemeColors } from '../../theme/palettes';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { StyleSheet } from 'react-native';
import { fonts, radii, space } from '../../theme/tokens';
export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    focus: { outlineWidth: 2, outlineColor: colors.accent, outlineOffset: 3 },
    text: { fontFamily: fonts.regular, flexShrink: 1 },
    body: { fontSize: 16, lineHeight: 24 },
    small: { fontSize: 14, lineHeight: 20 },
    title: { fontSize: 30, lineHeight: 36, fontFamily: fonts.bold },
    heading: { fontSize: 20, lineHeight: 28, fontFamily: fonts.semibold },
    eyebrow: { fontSize: 12, lineHeight: 16, fontFamily: fonts.bold, letterSpacing: 2 },
    button: {
      minHeight: 48,
      borderRadius: radii.medium,
      paddingVertical: space.md,
      paddingHorizontal: space.lg,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space.sm,
    },
    secondary: { backgroundColor: colors.primarySoft },
    iconButton: {
      minWidth: 48,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radii.medium,
    },
    chip: {
      minHeight: 48,
      paddingHorizontal: space.lg,
      paddingVertical: space.md,
      borderRadius: radii.large,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      backgroundColor: colors.surface,
    },
    chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    field: {
      fontFamily: fonts.regular,
      color: colors.text,
      fontSize: 16,
      padding: space.lg,
      minHeight: 56,
      borderRadius: radii.medium,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    panel: {
      padding: space.lg,
      borderRadius: radii.large,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyIcon: {
      padding: space.lg,
      borderRadius: radii.large,
      backgroundColor: colors.primarySoft,
    },
    notice: {
      padding: space.lg,
      borderRadius: radii.medium,
      backgroundColor: colors.accentSoft,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: space.sm,
    },
    safe: { flex: 1, backgroundColor: colors.background },
    screen: {
      padding: space.xl,
      gap: space.xl,
      paddingBottom: space.xxl,
      maxWidth: 720,
      width: '100%',
      alignSelf: 'center',
    },
  });

export function useUIStyles() {
  return useThemedStyles(createStyles);
}
