/**
 * DiaryEdit Screen 样式
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

  // 元信息卡片
  metaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.semantic.bg.card,
    borderRadius: radius.md,
    marginBottom: spacing.base,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.semantic.bg.subtle,
    borderRadius: radius.full,
  },
  metaChipText: {
    ...typography.bodyS,
    color: colors.semantic.text.secondary,
  },
  metaChipPlaceholder: {
    color: colors.semantic.text.tertiary,
  },

  // 标题
  titleInput: {
    ...typography.titleXL,
    color: colors.semantic.text.primary,
    fontWeight: '600',
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  titleSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.semantic.divider.subtle,
    marginBottom: spacing.base,
  },
})

export default styles
