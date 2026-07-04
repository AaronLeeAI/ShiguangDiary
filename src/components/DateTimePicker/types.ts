/**
 * DateTimePicker 类型定义
 *
 * 基于 @react-native-community/datetimepicker 的封装。
 * 提供两种使用方式：
 * - <DateTimePicker />：直接受控（受 value / onChange 控制）
 * - <DateTimePickerField />：点击触发 + 展示当前值
 */

import type {ViewStyle} from 'react-native';

export type DateTimePickerMode = 'date' | 'time' | 'datetime';

export interface DateTimePickerProps {
  /** 当前值（毫秒） */
  value: number;
  /** 值变化回调 */
  onChange: (timestamp: number) => void;
  /** 选择模式 */
  mode?: DateTimePickerMode;
  /** 最小日期（毫秒） */
  minimumDate?: number;
  /** 最大日期（毫秒） */
  maximumDate?: number;
  /** 容器样式 */
  style?: ViewStyle;
  /** 测试 ID */
  testID?: string;
}

export interface DateTimePickerFieldProps extends Omit<DateTimePickerProps, 'style'> {
  /** 字段 label */
  label?: string;
  /** 占位符（无值时显示） */
  placeholder?: string;
  /** 自定义格式化函数 */
  formatValue?: (timestamp: number) => string;
  /** 字段容器样式 */
  style?: ViewStyle;
  /** 右侧图标（默认 calendar） */
  rightIconName?: import('@/components/Icon').IconName;
}