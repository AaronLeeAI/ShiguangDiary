/**
 * DiaryView Screen 样式
 */
import { StyleSheet } from 'react-native'
import { colors, radius, spacing, typography } from '@theme'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.semantic.bg.canvas,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.huge,
  },

  // 头部：日期 + 标签 + 加密/置顶
  header: {
    marginBottom: spacing.lg,
  },
  date: {
    ...typography.bodyS,
    color: colors.semantic.text.tertiary,
    marginBottom: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    backgroundColor: colors.semantic.bg.subtle,
    borderRadius: radius.full,
  },
  badgeText: {
    ...typography.caption,
    color: colors.semantic.text.secondary,
  },

  // 标题 + 正文
  title: {
    ...typography.titleXL,
    color: colors.semantic.text.primary,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  content: {
    ...typography.bodyL,
    color: colors.semantic.text.primary,
    lineHeight: typography.bodyL.lineHeight + 8,
  },

  // 加密遮罩
  encryptedMask: {
    padding: spacing.xl,
    backgroundColor: colors.semantic.bg.subtle,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  encryptedIcon: {
    marginBottom: spacing.md,
  },
  encryptedTitle: {
    ...typography.titleS,
    color: colors.semantic.text.primary,
    marginBottom: spacing.xs,
  },
  encryptedHint: {
    ...typography.bodyS,
    color: colors.semantic.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.base,
  },

  // 元信息
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.base,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.semantic.divider.subtle,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.bodyS,
    color: colors.semantic.text.secondary,
  },
})

export default styles
