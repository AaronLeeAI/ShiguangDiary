/**
 * Search Screen 样式
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

  // 结果列表
  listContent: {
    padding: spacing.base,
    paddingBottom: spacing.huge,
  },
  separator: {
    height: spacing.md,
  },

  // 结果头:计数 + 排序
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xxs,
  },
  resultCount: {
    ...typography.bodyS,
    color: colors.semantic.text.tertiary,
    flex: 1,
    flexWrap: 'wrap',
  },
  sortRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  sortButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.semantic.bg.subtle,
  },
  sortButtonActive: {
    backgroundColor: colors.brand.primaryGhost,
  },
  sortText: {
    ...typography.bodyS,
    color: colors.semantic.text.tertiary,
  },
  sortTextActive: {
    color: colors.brand.primary,
    fontWeight: '600',
  },
})

export default styles
