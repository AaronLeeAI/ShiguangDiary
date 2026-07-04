/**
 * Animation / Motion Tokens
 *
 * 单一可信来源：docs/project-设计-docs/docs/08_Animation.md
 */

import {Easing} from 'react-native-reanimated';

/**
 * 时长（毫秒）
 */
export const duration = {
  fast: 150,
  base: 250,
  slow: 350,
  fab: 200,
  cardPress: 100,
  cardEnter: 250,
  cardExit: 200,
  themeSwitch: 200,
  switch: 200,
  calendarExpand: 250,
  listStagger: 50, // 列表项每项延迟
  listMaxTotal: 500, // 列表项动画总时长上限
  breathLoop: 2000, // 沙漏呼吸动画周期
  arcRotate: 1000, // 加载弧形旋转
} as const;

/**
 * 缓动函数（Easing）
 */
export const easing = {
  easeOut: Easing.out(Easing.cubic),
  easeIn: Easing.in(Easing.cubic),
  easeInOut: Easing.inOut(Easing.cubic),
  linear: Easing.linear,
} as const;

/**
 * 弹簧参数
 */
export const spring = {
  default: {damping: 15, mass: 1, stiffness: 150},
  gentle: {damping: 20, mass: 1, stiffness: 100},
  bouncy: {damping: 10, mass: 1, stiffness: 200},
  stiff: {damping: 25, mass: 1, stiffness: 300},
} as const;

export const motion = {
  duration,
  easing,
  spring,
} as const;

export type DurationToken = keyof typeof duration;
export type EasingToken = keyof typeof easing;
export type SpringToken = keyof typeof spring;