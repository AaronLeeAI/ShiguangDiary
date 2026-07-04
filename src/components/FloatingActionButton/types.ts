/**
 * FloatingActionButton 类型定义
 *
 * 悬浮按钮（FAB）— 主页右下角的"新建"入口。
 */

import type {ReactNode} from 'react';
import type {ViewStyle} from 'react-native';
import type {IconName} from '@/components/Icon';

export type FabVariant = 'primary' | 'danger';

export interface FloatingActionButtonProps {
  /** 点击回调 */
  onPress: () => void;
  /** 图标（默认 add） */
  icon?: IconName;
  /** 自定义内容（覆盖默认图标） */
  children?: ReactNode;
  /** 变体（主色/危险） */
  variant?: FabVariant;
  /** 尺寸（默认 large = 56dp） */
  size?: 'small' | 'medium' | 'large';
  /** 无障碍标签 */
  accessibilityLabel?: string;
  /** 测试 ID */
  testID?: string;
  /** 容器样式覆盖 */
  style?: ViewStyle;
  /** 是否禁用 */
  disabled?: boolean;
}