/**
 * TextArea 类型定义
 */

import type {TextInputProps, ViewStyle} from 'react-native';

export interface TextAreaProps
  extends Omit<TextInputProps, 'style' | 'multiline' | 'placeholderTextColor'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** 最小高度（dp） */
  minHeight?: number;
  /** 最大高度（dp），超过则内部滚动 */
  maxHeight?: number;
  /** 是否显示字符计数 */
  showCount?: boolean;
  /** 最大字符数（与 showCount 配合显示 X/Y） */
  maxLength?: number;
  /** 错误信息 */
  error?: string;
  /** 容器样式 */
  style?: ViewStyle;
  /** 输入框样式 */
  inputStyle?: ViewStyle;
  /** 测试 ID */
  testID?: string;
}