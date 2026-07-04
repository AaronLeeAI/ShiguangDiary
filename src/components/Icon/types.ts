/**
 * Icon 类型定义
 *
 * 基于设计规范 docs/project-设计-docs/components/Icon.md
 */
import type { StyleProp, ViewStyle } from 'react-native'
import type { IconName } from './paths'

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

export const ICON_SIZES: Record<IconSize, number> = {
  xs: 16,
  sm: 20,
  md: 24, // 默认
  lg: 28,
  xl: 32,
  xxl: 48,
}

export type IconVariant = 'outline' | 'filled' | 'round'

export interface IconProps {
  /** 图标名称，必须在 ICON_PATHS 中存在 */
  name: IconName
  /** 尺寸预设或自定义数值 */
  size?: IconSize | number
  /** 图标颜色（默认跟随主题） */
  color?: string
  /** 形态变体（outline/filled/round） */
  variant?: IconVariant
  /** 外部样式 */
  style?: StyleProp<ViewStyle>
  /** 可点击热区（仅 hitSlop） */
  hitSlop?: number
  /** 测试 ID */
  testID?: string
}
