/**
 * Typography Tokens
 *
 * 单一可信来源：docs/project-设计-docs/docs/04_Design_System.md § 4.3
 *
 * 设计稿基准：360×800dp。所有 size 在 React Native 中直接对应 dp。
 */

import {Platform} from 'react-native';

/**
 * 字体族（Font Family）
 *
 * Android: Noto Sans CJK SC（中文）/ Roboto（西文）
 * iOS: PingFang SC（中文）/ SF Pro（西文）
 */
export const fontFamily = {
  // 中文
  primary: Platform.select({
    android: 'Noto Sans CJK SC',
    ios: 'PingFang SC',
    default: 'System',
  }),
  primaryMedium: Platform.select({
    android: 'Noto Sans CJK SC Medium',
    ios: 'PingFang SC Medium',
    default: 'System',
  }),
  primarySemibold: Platform.select({
    android: 'Noto Sans CJK SC Bold',
    ios: 'PingFang SC Semibold',
    default: 'System',
  }),
  primaryBold: Platform.select({
    android: 'Noto Sans CJK SC Bold',
    ios: 'PingFang SC Bold',
    default: 'System',
  }),
  // 西文
  western: Platform.select({
    android: 'Roboto',
    ios: 'SF Pro',
    default: 'System',
  }),
  westernMedium: Platform.select({
    android: 'Roboto Medium',
    ios: 'SF Pro Medium',
    default: 'System',
  }),
  // 统计数字专用
  display: Platform.select({
    android: 'DIN Alternate',
    ios: 'DIN Alternate',
    default: 'System',
  }),
  // 等宽
  mono: Platform.select({
    android: 'Roboto Mono',
    ios: 'Roboto Mono',
    default: 'monospace',
  }),
} as const;

/**
 * 字号阶梯（Type Scale）
 */
export const fontSize = {
  display: 56,
  titleXL: 32,
  titleL: 24,
  titleM: 20,
  titleS: 18,
  bodyL: 17,
  bodyM: 15,
  bodyS: 13,
  caption: 12,
  micro: 10,
} as const;

/**
 * 行高（Line Height）
 */
export const lineHeight = {
  display: 64,
  titleXL: 40,
  titleL: 32,
  titleM: 28,
  titleS: 26,
  bodyL: 26,
  bodyM: 22,
  bodyS: 20,
  caption: 18,
  micro: 14,
} as const;

/**
 * 字重（Font Weight）
 */
export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/**
 * 排版预设（Text Styles）
 *
 * 业务代码统一通过以下预设访问，避免在多处直接拼装 fontSize / lineHeight / fontWeight。
 */
export const typography = {
  display: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.display,
    lineHeight: lineHeight.display,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0,
  },
  titleXL: {
    fontFamily: fontFamily.primaryMedium,
    fontSize: fontSize.titleXL,
    lineHeight: lineHeight.titleXL,
    fontWeight: fontWeight.medium,
    letterSpacing: 0,
  },
  titleL: {
    fontFamily: fontFamily.primaryMedium,
    fontSize: fontSize.titleL,
    lineHeight: lineHeight.titleL,
    fontWeight: fontWeight.medium,
    letterSpacing: 0,
  },
  titleM: {
    fontFamily: fontFamily.primaryMedium,
    fontSize: fontSize.titleM,
    lineHeight: lineHeight.titleM,
    fontWeight: fontWeight.medium,
    letterSpacing: 0,
  },
  titleS: {
    fontFamily: fontFamily.primaryMedium,
    fontSize: fontSize.titleS,
    lineHeight: lineHeight.titleS,
    fontWeight: fontWeight.medium,
    letterSpacing: 0,
  },
  bodyL: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.bodyL,
    lineHeight: lineHeight.bodyL,
    fontWeight: fontWeight.regular,
    letterSpacing: 0,
  },
  bodyM: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.bodyM,
    lineHeight: lineHeight.bodyM,
    fontWeight: fontWeight.regular,
    letterSpacing: 0,
  },
  bodyS: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.bodyS,
    lineHeight: lineHeight.bodyS,
    fontWeight: fontWeight.regular,
    letterSpacing: 0,
  },
  caption: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.caption,
    lineHeight: lineHeight.caption,
    fontWeight: fontWeight.regular,
    letterSpacing: 0,
  },
  micro: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.micro,
    lineHeight: lineHeight.micro,
    fontWeight: fontWeight.regular,
    letterSpacing: 0,
  },
  // 按钮专用
  button: {
    fontFamily: fontFamily.primaryMedium,
    fontSize: fontSize.titleS,
    lineHeight: lineHeight.titleS,
    fontWeight: fontWeight.medium,
    letterSpacing: 0,
  },
  // Tab 标签
  tabLabel: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.caption,
    lineHeight: lineHeight.caption,
    fontWeight: fontWeight.regular,
    letterSpacing: 0,
  },
} as const;

export type TypographyToken = keyof typeof typography;