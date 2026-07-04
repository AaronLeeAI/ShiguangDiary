/**
 * Screen - 类型定义
 */

import type {ReactNode} from 'react';
import type {StatusBarStyle, ViewStyle} from 'react-native';

export interface ScreenProps {
  /** 页面内容 */
  children?: ReactNode;
  /** 容器自定义样式 */
  style?: ViewStyle;
  /** 启用 ScrollView 包裹 */
  scroll?: boolean;
  /** 启用 KeyboardAvoidingView */
  keyboardAvoiding?: boolean;
  /** 添加默认水平内边距 */
  padded?: boolean;
  /** SafeArea 适配边（默认 top + bottom） */
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  /** StatusBar 样式 */
  statusBarStyle?: StatusBarStyle;
  /** 自定义背景色（覆盖 theme 默认） */
  backgroundColor?: string;
  /** 测试 ID */
  testID?: string;
}