/**
 * DiaryCard 样式
 *
 * 注意：颜色/间距/圆角必须通过 `@theme` 访问，禁止硬编码。
 */
import { StyleSheet } from 'react-native'
import { radius, spacing, typography, colors } from '@theme'

export const styles = StyleSheet.create({
  container: {
    padding: spacing.base,
    marginBottom: spacing.sm,
    backgroundColor: colors.semantic.bg.card,
    borderRadius: radius.lg,
  },
  homeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  homeDateBlock: {
    flexBasis: '25%',
    paddingRight: spacing.sm,
    alignItems: 'flex-start',
  },
  homeDay: {
    fontFamily: typography.titleL.fontFamily,
    fontSize: typography.titleL.fontSize,
    fontWeight: typography.titleL.fontWeight,
    color: colors.semantic.text.primary,
    lineHeight: typography.titleL.lineHeight,
  },
  homeMonthYear: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    color: colors.semantic.text.tertiary,
    marginTop: spacing.xxs,
    marginLeft: -spacing.xs,
  },
  homeContent: {
    flex: 1,
    paddingLeft: spacing.xs,
    alignItems: 'flex-start',
  },
  homeCoverFrame: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.semantic.bg.subtle,
  },
  homeCoverImage: {
    width: '100%',
    height: 168,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.base,
  },
  dateBlock: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  day: {
    fontFamily: typography.titleM.fontFamily,
    fontSize: typography.titleM.fontSize,
    fontWeight: typography.titleM.fontWeight,
    color: colors.semantic.text.primary,
  },
  monthYear: {
    fontSize: typography.bodyS.fontSize,
    lineHeight: typography.bodyS.lineHeight,
    color: colors.semantic.text.tertiary,
  },
  tags: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinned: {
    fontSize: typography.caption.fontSize,
    color: colors.semantic.text.primary,
  },
  locked: {
    fontSize: typography.caption.fontSize,
    color: colors.func.danger,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: typography.bodyL.fontFamily,
    fontSize: typography.bodyL.fontSize,
    fontWeight: typography.bodyL.fontWeight,
    color: colors.semantic.text.primary,
    marginBottom: spacing.xs,
  },
  summary: {
    fontFamily: typography.bodyM.fontFamily,
    fontSize: typography.bodyM.fontSize,
    color: colors.semantic.text.secondary,
    lineHeight: typography.bodyM.lineHeight,
  },
  timestamp: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    color: colors.semantic.text.tertiary,
    marginTop: spacing.xs,
  },
})

export default styles
