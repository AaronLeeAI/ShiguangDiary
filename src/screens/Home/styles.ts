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
  header: {
    minHeight: 52,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterPill: {
    flex: 1,
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.full,
    backgroundColor: colors.neutral.gray10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: 0,
  },
  filterPillText: {
    flex: 1,
    fontSize: fontSize.bodyS,
    color: colors.semantic.text.secondary,
    marginRight: spacing.xxs,
  },
  topActionsCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  compactIconButton: {
    width: 30,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staticCalendarIcon: {
    width: 26,
    height: 26,
    borderWidth: 1.6,
    borderColor: colors.semantic.icon.primary,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxs,
  },
  staticCalendarTopLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 7,
    height: 1.4,
    backgroundColor: colors.semantic.icon.primary,
  },
  staticCalendarText: {
    fontSize: fontSize.micro,
    lineHeight: 12,
    fontWeight: '700',
    color: colors.semantic.icon.primary,
    includeFontPadding: false,
    marginTop: 5,
  },
  imageCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.semantic.bg.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.semantic.border.default,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  imageCardImage: {
    width: '100%',
    height: 170,
  },

  listContent: {
    padding: spacing.base,
    paddingBottom: spacing.huge, // 给 FAB 留空间
  },
  separator: {
    height: spacing.md,
  },
  topActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: spacing.sm,
  },
  diaryCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.semantic.border.default,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  fab: {
    backgroundColor: colors.brand.primary,
    opacity: 1,
    zIndex: 10,
    elevation: 10,
  },
  calendarPage: {
    flex: 1,
    backgroundColor: colors.semantic.bg.canvas,
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
