/**
 * SettingsGroup 类型定义
 *
 * 设置项容器：包裹一组 SettingsRow，自动添加分隔线。
 */

import type { ReactNode } from 'react'
import type { ViewStyle } from 'react-native'

export interface SettingsGroupProps {
  /** 子节点（一般是多个 SettingsRow） */
  children: ReactNode
  /** 组标题（可选，显示在卡片上方） */
  title?: string
  /** 容器样式 */
  style?: ViewStyle
  /** 测试 ID */
  testID?: string
}
