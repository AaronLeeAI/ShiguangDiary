/**
 * Shadow / Elevation Tokens
 *
 * 单一可信来源：docs/project-设计-docs/docs/04_Design_System.md § 4.7
 *
 * Android 使用 elevation；iOS 使用 shadowColor/shadowOffset/shadowOpacity/shadowRadius。
 */

import {Platform, ViewStyle} from 'react-native';

const SHADOW_COLOR = 'rgba(0,0,0,0.06)'; // 根据 Design System 文档统一阴影色

/**
 * Android Elevation（dp）
 *
 * 单一可信来源：docs/project-设计-docs/docs/04_Design_System.md § 4.7
 */
export const elevation = {
  none: 0,
  sm: 1,
  md: 2,
  lg: 4,
  xl: 8,
  fab: 6,
} as const;

/**
 * 阴影样式（Cross-platform）
 *
 * React Native 在 Android 用 elevation，iOS 用 shadow* 系列属性。
 * 使用 `getShadow(level)` 获取适用于当前平台的完整样式。
 */
export const getShadow = (level: keyof typeof elevation): ViewStyle => {
  if (level === 'none') {
    return {
      elevation: 0,
      shadowColor: SHADOW_COLOR,
      shadowOffset: {width: 0, height: 0},
      shadowOpacity: 0,
      shadowRadius: 0,
    };
  }

  const map: Record<
    Exclude<keyof typeof elevation, 'none'>,
    {
      offset: {width: number; height: number};
      opacity: number;
      radius: number;
    }
  > = {
    sm: {offset: {width: 0, height: 1}, opacity: 0.05, radius: 2},
    md: {offset: {width: 0, height: 2}, opacity: 0.08, radius: 6},
    lg: {offset: {width: 0, height: 4}, opacity: 0.12, radius: 12},
    xl: {offset: {width: 0, height: 8}, opacity: 0.16, radius: 24},
    fab: {offset: {width: 0, height: 6}, opacity: 0.2, radius: 16},
  };

  const cfg = map[level];

  return Platform.select<ViewStyle>({
    android: {
      elevation: elevation[level],
    },
    ios: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: cfg.offset,
      shadowOpacity: cfg.opacity,
      shadowRadius: cfg.radius,
    },
    default: {
      elevation: elevation[level],
    },
  }) as ViewStyle;
};

export const shadow = getShadow;
export type ShadowLevel = keyof typeof elevation;