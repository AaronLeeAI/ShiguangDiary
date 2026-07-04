/**
 * ActionSheet 类型定义
 *
 * 底部弹起的操作列表（iOS 风格 Action Sheet）。
 */

import type { ReactNode } from 'react'
import type { ViewStyle } from 'react-native'
import type { IconName } from '@/components/Icon'

/** 单个操作项 */
export interface ActionSheetItem {
  /** 唯一标识 */
  key: string
  /** 显示文案 */
  label: string
  /** 左侧图标（可选） */
  icon?: IconName
  /** 是否为危险操作（红色） */
  destructive?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 点击回调 */
  onPress?: () => void
}

export interface ActionSheetProps {
  /** 是否可见 */
  visible: boolean
  /** 关闭回调（点击遮罩或取消按钮时触发） */
  onClose: () => void
  /** 标题（可选，渲染在操作列表上方） */
  title?: string
  /** 描述（可选，标题下方） */
  description?: string
  /** 操作列表 */
  items: ActionSheetItem[]
  /** 取消按钮文案 */
  cancelLabel?: string
  /** 点击遮罩是否关闭（默认 true） */
  backdropDismiss?: boolean
  /** 自定义容器样式 */
  style?: ViewStyle
  /** 测试 ID */
  testID?: string
}
