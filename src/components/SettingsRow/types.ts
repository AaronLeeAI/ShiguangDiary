/**
 * SettingsRow 类型定义
 *
 * 单行设置项：icon + label + (hint | chevron | right)
 */

import type {ReactNode} from 'react';
import type {ViewStyle} from 'react-native';
import type {IconName} from '@/components/Icon';

export interface SettingsRowProps {
  /** 左侧图标 */
  icon?: IconName;
  /** 标签 */
  label: string;
  /** 右侧副文本 */
  hint?: string;
  /** 右侧自定义内容（如 Switch / Badge） */
  right?: ReactNode;
  /** 是否显示右侧 chevron（默认 true，与 right 互斥） */
  showArrow?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否为危险项（红色） */
  destructive?: boolean;
  /** 点击回调 */
  onPress?: () => void;
  /** 容器样式 */
  style?: ViewStyle;
  /** 测试 ID */
  testID?: string;
  /** 无障碍标签（默认使用 label） */
  accessibilityLabel?: string;
}