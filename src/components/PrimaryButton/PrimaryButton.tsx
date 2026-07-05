/**
 * PrimaryButton Component
 *
 * 主操作按钮。基于设计规范 docs/project-设计-docs/components/PrimaryButton.md
 *
 * 支持 5 种变体（primary/danger/ghost/outline/disabled）和 3 种尺寸（large/medium/small）。
 * 支持 loading 状态、icon、按下反馈（按下时变深 + scale 0.98）。
 */

import React, { useCallback } from 'react'
import {
  Pressable,
  Text,
  ActivityIndicator,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

import { haptic } from '@animations/haptics'
import { useTheme } from '@theme'
import { PRIMARY_BUTTON_HEIGHT, PRIMARY_BUTTON_FONT, type PrimaryButtonProps } from './types'
import { styles, PRIMARY_BUTTON_STYLES, variantStyles } from './styles'

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = true,
  icon,
  iconPosition = 'left',
  style,
  testID,
}) => {
  const theme = useTheme()
  const vs = variantStyles[variant]
  const isDisabled = disabled || loading || variant === 'disabled'

  const handlePress = useCallback(() => {
    haptic(variant === 'danger' ? 'delete' : 'tap')
    onPress?.()
  }, [onPress, variant])

  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    {
      height: PRIMARY_BUTTON_HEIGHT[size],
      backgroundColor: vs.bg,
      borderColor: vs.border,
      borderWidth: variant === 'outline' ? 1 : 0,
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
    },
    isDisabled && { opacity: 0.6 },
    style,
  ]

  const textStyle = {
    ...styles.text,
    fontSize: PRIMARY_BUTTON_FONT[size],
    color: vs.text,
  }

  return (
    <Pressable
      testID={testID}
      disabled={isDisabled}
      onPress={handlePress}
      android_ripple={{ color: 'rgba(255,255,255,0.18)', borderless: false }}
      style={({ pressed }) => [containerStyle, pressed && styles.pressed]}
    >
      {loading ? (
        <View style={PRIMARY_BUTTON_STYLES.spinnerWrap}>
          <ActivityIndicator size="small" color={vs.text} />
        </View>
      ) : (
        <View style={PRIMARY_BUTTON_STYLES.contentRow}>
          {icon && iconPosition === 'left' && (
            <View style={{ marginRight: title ? theme.space[3] : 0 }}>{icon}</View>
          )}
          <Text style={textStyle}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <View style={{ marginLeft: title ? theme.space[3] : 0 }}>{icon}</View>
          )}
        </View>
      )}
    </Pressable>
  )
}

export default PrimaryButton
