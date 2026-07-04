/**
 * BottomTabBar 类型定义
 *
 * 底部 Tab 栏：Home / Notebook / Album / Profile
 *
 * 通过 currentTab + onTabPress 实现受控（业务侧维护 active 状态）。
 * 也可独立使用（内部维护 state）。
 */

import type { IconName } from '@/components/Icon'

/** Tab 标识：与 navigation/types.ts TabParamList 保持一致 */
export type BottomTabName = 'Home' | 'Notebook' | 'Album' | 'Profile'

/** 单个 Tab 的配置 */
export interface BottomTabConfig {
  /** Tab 名（对应 BottomTabName） */
  name: BottomTabName
  /** 未激活态图标 */
  icon: IconName
  /** 激活态图标（可选，默认使用 icon） */
  activeIcon?: IconName
  /** Tab 标签（可选，用于无障碍） */
  label: string
}

/** 固定的 4 个 Tab 配置 */
export const BOTTOM_TABS = [
  { name: 'Home', icon: 'list', activeIcon: 'listActive', label: '日记' },
  { name: 'Notebook', icon: 'book', activeIcon: 'bookActive', label: '日记本' },
  { name: 'Album', icon: 'album', activeIcon: 'albumActive', label: '相册' },
  { name: 'Profile', icon: 'profile', activeIcon: 'profileActive', label: '我的' },
] as const satisfies readonly BottomTabConfig[]

export interface BottomTabBarProps {
  /** 当前激活的 Tab（受控模式） */
  currentTab?: BottomTabName
  /** Tab 点击回调（受控模式必须提供） */
  onTabPress?: (tab: BottomTabName) => void
  /** 初始激活的 Tab（非受控模式） */
  defaultTab?: BottomTabName
  /** 自定义 Tab 配置（可选） */
  tabs?: readonly BottomTabConfig[]
  /** 测试 ID */
  testID?: string
  /** 样式覆盖 */
  style?: import('react-native').ViewStyle
}
