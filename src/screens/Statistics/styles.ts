/**
 * Statistics Screen 样式
 */
import { StyleSheet } from 'react-native'
import { colors, spacing, typography } from '@theme'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.semantic.bg.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  title: {
    ...typography.titleM,
    fontWeight: '600',
    color: colors.semantic.text.primary,
  },
  body: {
    flex: 1,
    padding: spacing.base,
  },
  section: {
    marginBottom: spacing.base,
  },
  sectionTitle: {
    ...typography.bodyL,
    color: colors.semantic.text.primary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xxs,
  },
  fallbackHint: {
    ...typography.bodyS,
    color: colors.semantic.text.tertiary,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  errorBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    ...typography.bodyM,
    color: colors.semantic.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.brand.primaryGhost,
  },
  retryText: {
    ...typography.bodyM,
    color: colors.brand.primary,
    fontWeight: '600',
  },
})

export default styles
