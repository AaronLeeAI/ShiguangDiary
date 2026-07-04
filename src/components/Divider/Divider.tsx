/**
 * Divider Component
 *
 * 分割线。水平或垂直，颜色和粗细来自 Theme。
 *
 * ## 设计规范
 *
 * - 默认水平分割线，颜色 theme.colors.semantic.divider.default
 * - 垂直分割线用于 Flex 行元素之间
 * - 支持自定义颜色和粗细
 *
 * ## 用法
 *
 * ```tsx
 * <Divider />
 * <Divider vertical />
 * <Divider color={theme.colors.brand.primary} />
 * ```
 */

import React from 'react'
import { View, type ViewStyle } from 'react-native'

import { useTheme } from '@theme'
import type { DividerProps } from './types'

export const Divider: React.FC<DividerProps> = ({
  vertical = false,
  color: customColor,
  thickness = 1,
  style,
  testID,
}) => {
  const { colors } = useTheme()
  const dividerColor = customColor ?? colors.semantic.divider.default

  const dividerStyle: ViewStyle = vertical
    ? {
        width: thickness,
        height: '100%',
        backgroundColor: dividerColor,
      }
    : {
        height: thickness,
        width: '100%',
        backgroundColor: dividerColor,
      }

  return <View testID={testID} style={[dividerStyle, style]} />
}

export default Divider
