/**
 * SearchBar 类型定义
 *
 * 基于 TextField 的搜索专用包装。
 */

import type {ViewStyle} from 'react-native';
import type {ReactNode} from 'react';

export interface SearchBarProps {
  /** 当前值 */
  value: string;
  /** 值变化回调 */
  onChangeText: (text: string) => void;
  /** 提交搜索（按回车） */
  onSubmit?: () => void;
  /** placeholder */
  placeholder?: string;
  /** 是否自动聚焦 */
  autoFocus?: boolean;
  /** 容器样式 */
  style?: ViewStyle;
  /** 测试 ID */
  testID?: string;
  /** 右侧操作（如"取消"按钮） */
  rightAction?: ReactNode;
  /** 是否显示取消按钮（受控） */
  showCancel?: boolean;
  /** 取消按钮点击回调 */
  onCancel?: () => void;
}