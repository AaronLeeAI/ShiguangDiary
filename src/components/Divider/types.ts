/**
 * Divider - 类型定义
 */

import type {ViewStyle} from 'react-native';

export interface DividerProps {
  /** 垂直分割线（默认水平） */
  vertical?: boolean;
  /** 自定义颜色（默认 theme.colors.semantic.divider.default） */
  color?: string;
  /** 分割线粗细（默认 1） */
  thickness?: number;
  /** 容器自定义样式 */
  style?: ViewStyle;
  /** 测试 ID */
  testID?: string;
}