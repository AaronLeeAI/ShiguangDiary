/**
 * PrimaryButton 类型定义
 *
 * 基于设计规范 docs/project-设计-docs/components/PrimaryButton.md
 */
import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

export type PrimaryButtonVariant = 'primary' | 'danger' | 'ghost' | 'outline' | 'disabled';
export type PrimaryButtonSize = 'large' | 'medium' | 'small';
export type PrimaryButtonIconPosition = 'left' | 'right';

export const PRIMARY_BUTTON_HEIGHT: Record<PrimaryButtonSize, number> = {
  large: 56,
  medium: 48,
  small: 36,
};

export const PRIMARY_BUTTON_FONT: Record<PrimaryButtonSize, number> = {
  large: 18,
  medium: 16,
  small: 14,
};

export interface PrimaryButtonProps {
  /** 按钮文案 */
  title: string;
  /** 点击回调 */
  onPress: () => void;
  /** 视觉变体 */
  variant?: PrimaryButtonVariant;
  /** 按钮尺寸 */
  size?: PrimaryButtonSize;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 宽度是否填满父容器 */
  fullWidth?: boolean;
  /** 左侧/右侧图标（IconName） */
  icon?: ReactNode;
  /** 图标位置 */
  iconPosition?: PrimaryButtonIconPosition;
  /** 自定义样式 */
  style?: StyleProp<ViewStyle>;
  /** 测试 ID */
  testID?: string;
}
