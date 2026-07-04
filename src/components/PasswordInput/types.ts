/**
 * PasswordInput - 类型定义
 */

import type { ViewStyle } from 'react-native'

export interface PasswordInputProps {
  /** 密码值 */
  value: string
  /** 值变更回调 */
  onChangeText: (text: string) => void
  /** 占位文字 */
  placeholder?: string
  /** 标签文字 */
  label?: string
  /** 错误提示 */
  error?: string
  /** 禁用状态 */
  disabled?: boolean
  /** 自动聚焦 */
  autoFocus?: boolean
  /** 容器样式 */
  style?: ViewStyle
  /** 测试 ID */
  testID?: string
}
