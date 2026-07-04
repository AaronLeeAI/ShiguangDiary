/**
 * BottomSheet 样式
 *
 * 当前 Task1 阶段留空。后续 Task 补充具体样式。
 *
 * 注意：颜色/间距/圆角必须通过 `@theme` 访问，禁止硬编码。
 */
import { StyleSheet } from 'react-native'
import { radius, spacing, typography, colors } from '@theme'

export const styles = StyleSheet.create({
  container: {
    padding: spacing.base,
    backgroundColor: colors.semantic.bg.card,
    borderRadius: radius.md,
  },
})

export default styles
