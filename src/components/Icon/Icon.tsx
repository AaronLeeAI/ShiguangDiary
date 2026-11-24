/**
 * Icon Component
 *
 * 统一的图标组件。封装 SVG 路径数据 + react-native-svg 渲染。
 * 设计规范：docs/project-设计-docs/components/Icon.md
 *
 * 设计原则：
 * - 24x24 viewBox 网格
 * - 2dp 笔触
 * - 圆角端点
 * - 线性 outline（默认），filled/round 形态可选
 */

import React from 'react'
import { Svg, Path } from 'react-native-svg'
import { useTheme } from '@theme'

import { ICON_PATHS, type IconName } from './paths'
import { ICON_SIZES, type IconProps } from './types'

/**
 * Icon - 图标组件
 *
 * 使用示例：
 *   <Icon name="add" />
 *   <Icon name="check" size="lg" color={colors.brand.primary} />
 *   <Icon name="hourglass" variant="filled" />
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color,
  variant = 'outline',
  hitSlop,
  testID,
}) => {
  const theme = useTheme()
  const px = typeof size === 'number' ? size : ICON_SIZES[size]
  const strokeColor = color ?? theme.colors.semantic.icon.primary
  const fillColor = variant === 'filled' ? (color ?? theme.colors.semantic.icon.primary) : 'none'
  const strokeWidth = variant === 'filled' ? 0 : 2
  const path = ICON_PATHS[name]

  if (!path) {
    return null
  }

  return (
    <Svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill={fillColor}
      testID={testID}
      hitSlop={hitSlop}
    >
      <Path
        d={path}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export type { IconName }
export { ICON_PATHS }
export default Icon
