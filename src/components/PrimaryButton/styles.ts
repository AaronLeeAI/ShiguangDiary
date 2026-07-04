/**
 * PrimaryButton 样式
 *
 * 颜色/间距/圆角必须通过 @theme 访问，禁止硬编码。
 * 支持 5 种 variant × 3 种 size 的组合。
 */
import { StyleSheet } from 'react-native'
import { radius, spacing, colors } from '@theme'

import { PRIMARY_BUTTON_HEIGHT, PRIMARY_BUTTON_FONT } from './types'
import type { PrimaryButtonSize, PrimaryButtonVariant } from './types'

export const PRIMARY_BUTTON_STYLES = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
  },
  spinnerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
} as const

const sizeHeight: Record<PrimaryButtonSize, number> = PRIMARY_BUTTON_HEIGHT
const sizeFont: Record<PrimaryButtonSize, number> = PRIMARY_BUTTON_FONT

export const variantStyles: Record<
  PrimaryButtonVariant,
  { bg: string; text: string; border: string }
> = {
  primary: {
    bg: colors.brand.primary,
    text: colors.neutral.white,
    border: 'transparent',
  },
  danger: {
    bg: colors.func.danger,
    text: colors.neutral.white,
    border: 'transparent',
  },
  ghost: {
    bg: 'transparent',
    text: colors.brand.primary,
    border: 'transparent',
  },
  outline: {
    bg: 'transparent',
    text: colors.brand.primary,
    border: colors.brand.primary,
  },
  disabled: {
    bg: colors.neutral.gray20,
    text: colors.neutral.gray50,
    border: 'transparent',
  },
}

export const styles = StyleSheet.create({
  container: {
    ...PRIMARY_BUTTON_STYLES.container,
    height: sizeHeight.medium,
    borderRadius: radius.full,
  },
  pressed: PRIMARY_BUTTON_STYLES.pressed,
  contentRow: PRIMARY_BUTTON_STYLES.contentRow,
  text: {
    ...PRIMARY_BUTTON_STYLES.text,
    fontSize: sizeFont.medium,
  },
})

export default styles
