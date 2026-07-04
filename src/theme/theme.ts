/**
 * Theme Index
 *
 * 主题系统统一入口。所有业务代码通过 `useTheme()` 获取当前主题。
 */

import { colors, darkSemantic, darkBrand } from './colors'
import { spacing, space } from './spacing'
import { radius } from './radius'
import { typography, fontFamily, fontSize, lineHeight, fontWeight } from './typography'
import { shadow, elevation, getShadow } from './shadow'
import { motion, duration, easing, spring } from './animation'

export * from './colors'
export * from './spacing'
export * from './radius'
export * from './typography'
export * from './shadow'
export * from './animation'

/**
 * 浅色主题
 */
export const lightTheme = {
  mode: 'light' as const,
  colors: {
    ...colors,
    semantic: colors.semantic,
    brand: colors.brand,
  },
  space,
  spacing,
  radius,
  typography,
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  shadow,
  elevation,
  getShadow,
  motion,
  duration,
  easing,
  spring,
} as const

/**
 * 暗色主题
 */
export const darkTheme = {
  mode: 'dark' as const,
  colors: {
    ...colors,
    semantic: darkSemantic,
    brand: darkBrand,
  },
  space,
  spacing,
  radius,
  typography,
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  shadow,
  elevation,
  getShadow,
  motion,
  duration,
  easing,
  spring,
} as const

export type LightTheme = typeof lightTheme
export type DarkTheme = typeof darkTheme
export type Theme = LightTheme | DarkTheme
export type ThemeMode = 'light' | 'dark'

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const
