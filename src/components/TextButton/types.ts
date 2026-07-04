/**
 * TextButton - 类型定义
 */

import type { ReactNode } from 'react'
import type { ViewStyle } from 'react-native'

export type TextButtonSize = 'small' | 'medium' | 'large'

export interface TextButtonProps {
  /** 按钮文字 */
  title: string
  /** 点击回调 */
  onPress: () => void
  /** 文字颜色（默认 brand.primary） */
  color?: string
  /** 按钮尺寸 */
  size?: TextButtonSize
  /** 禁用状态 */
  disabled?: boolean
  /** 下划线 */
  underline?: boolean
  /** 前置/后置图标 */
  icon?: ReactNode
  /** 图标位置 */
  iconPosition?: 'left' | 'right'
  /** 容器样式 */
  style?: ViewStyle
  /** 测试 ID */
  testID?: string
}
