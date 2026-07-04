/**
 * Spacing Tokens
 *
 * 单位：dp（React Native 中所有数值直接对应 `number`）
 *
 * 单一可信来源：docs/project-设计-docs/docs/04_Design_System.md § 4.4
 */

export const space = {
  '0': 0,
  '1': 2,
  '2': 4,
  '3': 8,
  '4': 12,
  '5': 16,
  '6': 20,
  '7': 24,
  '8': 32,
  '9': 40,
  '10': 48,
  '11': 64,
} as const;

/**
 * 常用间距别名（语义化）
 */
export const spacing = {
  none: space['0'],
  xxs: space['1'],
  xs: space['2'],
  sm: space['3'],
  md: space['4'],
  base: space['5'],
  lg: space['6'],
  xl: space['7'],
  xxl: space['8'],
  xxxl: space['9'],
  huge: space['10'],
  giant: space['11'],

  // 常用组合
  pagePaddingH: space['5'], // 16 - 页面水平安全边距
  pagePaddingV: space['5'], // 16 - 页面垂直边距
  cardPadding: space['5'], // 16 - 卡片内边距
  cardGap: space['3'], // 8 - 卡片间距
  sectionGap: space['7'], // 24 - 区块间距
  modalPaddingH: space['7'], // 24 - 弹窗水平
  modalPaddingV: space['5'], // 16 - 弹窗垂直
  buttonPaddingV: space['4'], // 12 - 按钮垂直
  buttonPaddingH: space['7'], // 24 - 按钮水平
} as const;

export type SpaceToken = keyof typeof space;
export type SpacingAlias = keyof typeof spacing;