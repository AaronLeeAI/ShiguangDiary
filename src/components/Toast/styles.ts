/**
 * Toast 样式
 */
import { StyleSheet } from 'react-native'
import { colors, radius, spacing, typography } from '@theme'

export const styles = StyleSheet.create({
  // 容器位置（provider 渲染时根据 position 选择）
  containerTop: {
    position: 'absolute',
    top: spacing.huge, // 顶部安全距离
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    zIndex: 9999,
  },
  containerCenter: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    zIndex: 9999,
  },
  containerBottom: {
    position: 'absolute',
    bottom: spacing.huge,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    zIndex: 9999,
  },

  // 单条 Toast
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    marginVertical: spacing.xxs,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  // variant 背景色
  toastSuccess: {
    backgroundColor: colors.func.success,
  },
  toastError: {
    backgroundColor: colors.func.danger,
  },
  toastInfo: {
    backgroundColor: colors.semantic.bg.inverse,
  },
  toastWarning: {
    backgroundColor: colors.func.warning,
  },

  icon: {
    marginRight: spacing.sm,
  },
  message: {
    ...typography.bodyM,
    color: colors.neutral.white,
    flexShrink: 1,
  },
  actionButton: {
    marginLeft: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  actionLabel: {
    ...typography.bodyM,
    color: colors.neutral.white,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
})

export default styles
