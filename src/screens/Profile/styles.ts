/**
 * Profile Screen 样式
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
    paddingBottom: spacing.huge,
  },

  // 用户卡片
  userCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.semantic.bg.card,
    marginBottom: spacing.md,
  },
  userName: {
    ...typography.titleL,
    color: colors.semantic.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xxs,
  },
  userBio: {
    ...typography.bodyS,
    color: colors.semantic.text.secondary,
    textAlign: 'center',
  },
  editButton: {
    marginTop: spacing.base,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.semantic.border.default,
  },
  editButtonText: {
    ...typography.bodyS,
    color: colors.semantic.text.primary,
  },

  // 统计栏
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.semantic.bg.card,
    paddingVertical: spacing.base,
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.titleM,
    color: colors.semantic.text.primary,
    marginBottom: spacing.xxs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.semantic.text.tertiary,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.semantic.divider.subtle,
  },

  // 设置组
  menuGroup: {
    backgroundColor: colors.semantic.bg.card,
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.semantic.divider.subtle,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    marginRight: spacing.md,
  },
  menuLabel: {
    ...typography.bodyL,
    color: colors.semantic.text.primary,
    flex: 1,
  },
  menuLabelDestructive: {
    color: colors.func.danger,
  },
  menuHint: {
    ...typography.bodyS,
    color: colors.semantic.text.tertiary,
    marginRight: spacing.sm,
  },
  menuArrow: {
    marginLeft: spacing.xs,
  },
})

export default styles
