/**
 * TextField 类型定义
 *
 * 单行输入框（多行请使用 TextArea）
 */

import type { ReactNode } from 'react'
import type { TextInputProps, ViewStyle } from 'react-native'

/** TextField 尺寸 */
export type TextFieldSize = 'large' | 'medium' | 'small'

export interface TextFieldProps extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  /** 输入值 */
  value: string
  /** 值变化回调 */
  onChangeText: (text: string) => void
  /** 输入框 placeholder */
  placeholder?: string
  /** 标签（在输入框上方） */
  label?: string
  /** 左侧图标 */
  leftIcon?: ReactNode
  /** 右侧图标（无 clearable 时生效） */
  rightIcon?: ReactNode
  /** 是否显示清空按钮（仅在 value 非空且非 disabled/readonly 时显示） */
  clearable?: boolean
  /** 清空回调（默认清空 value） */
  onClear?: () => void
  /** 错误信息（设置后输入框变为 error 态） */
  error?: string
  /** 尺寸 */
  size?: TextFieldSize
  /** 容器样式 */
  style?: ViewStyle
  /** 输入框样式 */
  inputStyle?: ViewStyle
  /** 测试 ID */
  testID?: string
}
