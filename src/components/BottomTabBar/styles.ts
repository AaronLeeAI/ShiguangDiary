/**
 * BottomTabBar 样式
 *
 * 颜色/间距/字号严格遵循 @theme，禁止硬编码。
 */
import { StyleSheet } from 'react-native'
import { colors, spacing, typography } from '@theme'

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.semantic.bg.bottomTab,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.semantic.border.subtle,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
    minHeight: 56,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  tabActive: {
    // 仅用于命中测试；视觉激活态通过 icon/label 颜色体现
  },
  label: {
    ...typography.tabLabel,
    color: colors.semantic.icon.tertiary,
    marginTop: spacing.xxs,
  },
  labelActive: {
    color: colors.brand.primary,
  },
})

export default styles
