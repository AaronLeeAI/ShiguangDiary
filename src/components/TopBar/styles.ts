/**
 * TopBar 样式
 *
 * 当前 Task1 阶段留空。后续 Task 补充具体样式。
 *
 * 注意：颜色/间距/圆角必须通过 `@theme` 访问，禁止硬编码。
 */
import { StyleSheet } from 'react-native'
import { radius, spacing, colors } from '@theme'

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    minHeight: 44,
    backgroundColor: colors.semantic.bg.canvas,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.semantic.text.primary,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default styles
