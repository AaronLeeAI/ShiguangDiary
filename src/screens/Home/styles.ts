/**
 * Home Screen 样式
 */
import { StyleSheet } from 'react-native'
import { colors, spacing, radius, fontSize } from '@theme'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.semantic.bg.canvas,
  },
  body: {
    flex: 1,
  },
  listContent: {
    padding: spacing.base,
    paddingBottom: spacing.huge, // 给 FAB 留空间
  },
  separator: {
    height: spacing.md,
  },
  calendarBtn: {
    padding: spacing.sm,
    position: 'relative',
  },
  calendarBadge: {
    position: 'absolute',
    top: spacing.xxs,
    right: spacing.xxs,
    minWidth: 18,
    height: 18,
    paddingHorizontal: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarBadgeText: {
    fontSize: fontSize.micro,
    color: colors.semantic.text.inverse,
    fontWeight: '600',
    includeFontPadding: false,
  },
  fallbackBanner: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.semantic.bg.subtle,
  },
  fallbackText: {
    fontSize: fontSize.caption,
    color: colors.semantic.text.tertiary,
    textAlign: 'center',
  },
  errorBanner: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.semantic.bg.subtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: fontSize.caption,
    color: colors.func.danger,
  },
  errorAction: {
    fontSize: fontSize.caption,
    color: colors.brand.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
})

export default styles
