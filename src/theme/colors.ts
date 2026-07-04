/**
 * Color Tokens
 *
 * 单一可信来源（Single Source of Truth）：docs/project-设计-docs/docs/04_Design_System.md
 *
 * 所有色值必须与设计规范保持一致。禁止在此文件中擅自新增颜色。
 * 如需新增，请先在 Design System 文档中补充定义。
 */

/**
 * 品牌色（Brand）— 拾光日记绿
 */
export const brand = {
  primary: '#1AAD66',
  primaryPressed: '#179A58',
  primaryLight: '#E8F8EF',
  primaryGhost: 'rgba(26,173,102,0.08)',
} as const

/**
 * 中性色（Neutral）
 */
export const neutral = {
  black: '#000000',
  gray90: '#1A1A1A',
  gray80: '#333333',
  gray70: '#4D4D4D',
  gray60: '#666666',
  gray50: '#999999',
  gray40: '#BFBFBF',
  gray30: '#D9D9D9',
  gray20: '#E5E5E5',
  gray10: '#F2F2F2',
  gray05: '#F8F8F8',
  white: '#FFFFFF',
} as const

/**
 * 功能色（Functional）
 */
export const func = {
  danger: '#FA5151',
  warning: '#FF8800',
  success: '#1AAD66',
  info: '#1488EE',
} as const

/**
 * 日历色（Calendar）
 */
export const cal = {
  solar: '#000000',
  solarDim: '#999999',
  lunar: '#666666',
  solarTerm: '#1AAD66',
  holiday: '#1AAD66',
  marker: '#000000',
  markerText: '#FFFFFF',
  solarYear: '#1AAD66',
  solarYearHasNote: '#FFB400',
} as const

/**
 * 语义化颜色（Semantic）
 *
 * 业务代码统一通过语义 Token 访问颜色，避免直接使用品牌色/中性色。
 */
export const semantic = {
  bg: {
    canvas: neutral.white,
    card: neutral.white,
    subtle: neutral.gray05,
    bottomTab: neutral.white,
    input: neutral.gray10,
    inverse: neutral.gray90,
    overlay: 'rgba(0,0,0,0.5)',
    scrim: 'rgba(0,0,0,0.5)',
  },
  text: {
    primary: neutral.gray90,
    secondary: neutral.gray60,
    tertiary: neutral.gray50,
    disabled: neutral.gray50,
    inverse: neutral.white,
    link: brand.primary,
    danger: func.danger,
  },
  border: {
    subtle: neutral.gray10,
    default: neutral.gray20,
    strong: neutral.gray40,
    focused: brand.primary,
    pressed: neutral.gray30,
    transparent: 'transparent',
  },
  icon: {
    primary: neutral.black,
    secondary: neutral.gray60,
    tertiary: neutral.gray50,
    disabled: neutral.gray50,
    inverse: neutral.white,
    accent: brand.primary,
  },
  divider: {
    subtle: neutral.gray10,
    default: neutral.gray20,
    strong: neutral.gray40,
  },
} as const

/**
 * 暗色模式覆盖（Dark Mode Overrides）
 */
export const darkSemantic = {
  bg: {
    canvas: '#121212',
    card: '#1E1E1E',
    subtle: '#1A1A1A',
    bottomTab: '#1E1E1E',
    input: '#2A2A2A',
    inverse: neutral.gray10,
    overlay: 'rgba(0,0,0,0.7)',
    scrim: 'rgba(0,0,0,0.7)',
  },
  text: {
    primary: neutral.gray10,
    secondary: '#B3B3B3',
    tertiary: '#808080',
    disabled: '#808080',
    inverse: neutral.gray90,
    link: '#1FBA70',
    danger: func.danger,
  },
  border: {
    subtle: '#2A2A2A',
    default: '#3A3A3A',
    strong: '#4A4A4A',
    focused: '#1FBA70',
    pressed: '#3A3A3A',
    transparent: 'transparent',
  },
  icon: {
    primary: neutral.white,
    secondary: '#B3B3B3',
    tertiary: '#808080',
    disabled: '#808080',
    inverse: neutral.gray90,
    accent: '#1FBA70',
  },
  divider: {
    subtle: '#2A2A2A',
    default: '#3A3A3A',
    strong: '#4A4A4A',
  },
} as const

export const darkBrand = {
  primary: '#1FBA70',
  primaryPressed: '#17A05E',
  primaryLight: '#1A2F26',
  primaryGhost: 'rgba(31,186,112,0.10)',
} as const

export const colors = {
  brand,
  neutral,
  func,
  cal,
  semantic,
  // 暗色模式
  darkBrand,
  darkSemantic,
} as const

export type Colors = typeof colors
