/**
 * Avatar 类型定义
 *
 * 基于设计规范 docs/project-设计-docs/components/Avatar.md
 *
 * 三种尺寸：
 * - 大（80dp）— 我的页
 * - 中（48dp）— 账号设置
 * - 小（32dp）— 列表项
 */
import type {StyleProp, ViewStyle} from 'react-native';

export type AvatarSize = 'large' | 'medium' | 'small';

export const AVATAR_SIZE: Record<AvatarSize, number> = {
  large: 80,
  medium: 48,
  small: 32,
};

export type AvatarSource = {uri: string} | number;

export interface AvatarProps {
  /** 图片源（uri 或 require 返回值） */
  source?: AvatarSource;
  /** 文字头像首字（无 source 时显示） */
  name?: string;
  /** 组件尺寸（large/medium/small）或自定义数值 */
  size?: AvatarSize | number;
  /** 形状：circle（默认）/square */
  shape?: 'circle' | 'square';
  /** 点击回调（提供则变为可点击） */
  onPress?: () => void;
  /** 是否可编辑（叠加相机图标） */
  editable?: boolean;
  /** 外部样式 */
  style?: StyleProp<ViewStyle>;
  /** 测试 ID */
  testID?: string;
}
