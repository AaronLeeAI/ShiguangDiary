/**
 * LoadingOverlay - 类型定义
 */

import type { ViewStyle } from 'react-native'

export interface LoadingOverlayProps {
  /** 显示/隐藏 */
  visible: boolean
  /** 加载提示文字 */
  message?: string
  /** 背景是否透明（false = 纯色背景） */
  transparent?: boolean
  /** 指示器大小 */
  indicatorSize?: 'small' | 'large'
  /** 指示器颜色（默认 brand.primary） */
  indicatorColor?: string
  /** 容器样式 */
  style?: ViewStyle
  /** 测试 ID */
  testID?: string
}
