/**
 * TextButton Component
 *
 * 文字按钮。无边框、无背景，仅文字 + 可选图标。
 *
 * 用于次要操作、导航文字、弹窗确认等轻量交互场景。
 * Theme 集成：颜色、字号来自 useTheme()。
 */

import React, { useCallback } from 'react'
import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native'

import { haptic } from '@animations/haptics'
import { useTheme } from '@theme'
import type { TextButtonProps } from './types'

export const TextButton: React.FC<TextButtonProps> = ({
  title,
  onPress,
  color: customColor,
  size = 'medium',
  disabled = false,
  underline = false,
  icon,
  iconPosition = 'left',
  style,
  testID,
}) => {
  const { colors, typography } = useTheme()

  const fontSizeMap = {
    small: typography.bodyS.fontSize,
    medium: typography.bodyL.fontSize,
    large: typography.titleS.fontSize,
  }

  const containerStyle: StyleProp<ViewStyle> = [
    { flexDirection: 'row', alignItems: 'center' },
    disabled && { opacity: 0.5 },
    style,
  ]

  const handlePress = useCallback(() => {
    haptic('tap')
    onPress?.()
  }, [onPress])

  const textStyle = {
    fontSize: fontSizeMap[size],
    color: customColor ?? colors.brand.primary,
    textDecorationLine: underline ? ('underline' as const) : ('none' as const),
  }

  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={handlePress}
      hitSlop={8}
      style={({ pressed }) => [containerStyle, pressed && { opacity: 0.7 }]}
    >
      {icon && iconPosition === 'left' && icon}
      <Text style={textStyle}>{title}</Text>
      {icon && iconPosition === 'right' && icon}
    </Pressable>
  )
}

export default TextButton
