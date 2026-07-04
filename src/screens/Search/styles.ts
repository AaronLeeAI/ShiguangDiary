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

  // 搜索历史
  historySection: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.titleS,
    color: colors.semantic.text.primary,
  },
  clearButton: {
    ...typography.bodyS,
    color: colors.semantic.text.tertiary,
  },
  historyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  historyTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.semantic.bg.subtle,
    borderRadius: radius.full,
  },
  historyTagText: {
    ...typography.bodyS,
    color: colors.semantic.text.secondary,
  },

  // 结果列表
  listContent: {
    padding: spacing.base,
    paddingBottom: spacing.huge,
  },
  separator: {
    height: spacing.md,
  },
  resultCount: {
    ...typography.bodyS,
    color: colors.semantic.text.tertiary,
    marginBottom: spacing.md,
  },
})

export default styles
