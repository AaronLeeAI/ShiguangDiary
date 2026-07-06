/**
 * RadioGroup 样式
 *
 * 当前样式已在组件实现中通过 StyleSheet 内聚维护，本文件保留用于后续拆分。
 *
 * 注意：颜色/间距/圆角必须通过 `@theme` 访问，禁止硬编码。
 */
import { StyleSheet } from 'react-native'
import { radius, spacing, colors } from '@theme'

export const styles = StyleSheet.create({
  container: {
    padding: spacing.base,
    backgroundColor: colors.semantic.bg.card,
    borderRadius: radius.md,
  },
})

export default styles
