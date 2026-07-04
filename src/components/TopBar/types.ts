/**
 * TopBar 类型定义
 *
 * 所有 Props 来自业务侧，类型从设计文档提取。
 */
import { type ReactNode } from 'react'

export interface TopBarProps {
  /** 左侧内容 */
  left?: ReactNode
  /** 标题 */
  title?: string
  /** 标题组件 */
  titleComponent?: ReactNode
  /** 右侧内容 */
  right?: ReactNode
  /** 返回按钮点击回调 */
  onBackPress?: () => void
  /** 是否显示返回按钮 */
  showBack?: boolean
  /** 背景色（默认跟随主题） */
  backgroundColor?: string
  /** 外部样式 */
  style?: object
}

export interface TopBarState {
  // 留空，后续按需添加
}

export type TopBarRef = {
  /** 获取实例 */
  focus: () => void
}
