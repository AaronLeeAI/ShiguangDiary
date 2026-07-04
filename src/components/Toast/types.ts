/**
 * Toast 类型定义
 *
 * 全局轻提示：通过 ToastProvider + useToast 在任意组件中调用。
 */

import type { ReactNode } from 'react'
import type { IconName } from '@/components/Icon'

/** Toast 视觉变体 */
export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

/** Toast 显示位置 */
export type ToastPosition = 'top' | 'center' | 'bottom'

/** 单条 Toast 配置（用于 useToast 调用） */
export interface ToastOptions {
  /** 提示文案 */
  message: string
  /** 视觉变体（默认 info） */
  variant?: ToastVariant
  /** 持续时间（ms），默认 2000，传 0 表示不自动关闭 */
  duration?: number
  /** 位置（默认 top） */
  position?: ToastPosition
  /** 自定义图标（覆盖 variant 默认图标） */
  icon?: IconName
  /** 自定义右侧操作（如"撤销"按钮） */
  action?: {
    label: string
    onPress: () => void
  }
}

/** Provider 内部维护的 Toast 队列条目 */
export interface ToastItem {
  /** 唯一标识 */
  id: string
  /** 提示文案 */
  message: string
  /** 视觉变体 */
  variant: ToastVariant
  /** 显示位置 */
  position: ToastPosition
  /** 持续时间 */
  duration: number
  /** 自定义图标 */
  icon?: IconName
  /** 自定义右侧操作 */
  action?: ToastOptions['action']
  /** 关闭回调 */
  onDismiss?: () => void
}

/** Toast 单条 UI Props */
export interface ToastViewProps {
  item: ToastItem
  onDismiss: (id: string) => void
}

/** Provider Props */
export interface ToastProviderProps {
  children: ReactNode
  /** 默认 duration */
  defaultDuration?: number
  /** 默认 position */
  defaultPosition?: ToastPosition
}
