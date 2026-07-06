import React, { useCallback } from 'react'
import { Pressable, StyleSheet } from 'react-native'

import { Icon } from '@/components/Icon'
import { haptic } from '@animations/haptics'
import { brand, neutral, radius, semantic } from '@theme'
import type { IconButtonProps } from './types'

export const IconButton: React.FC<IconButtonProps> = ({
  name,
  onPress,
  size = 40,
  iconSize = 22,
  color,
  disabled = false,
  variant = 'ghost',
  style,
  testID,
  accessibilityLabel,
}) => {
  const handlePress = useCallback(() => {
    haptic('tap')
    onPress?.()
  }, [onPress])

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        { height: size, width: size },
        variant === 'filled' && styles.filled,
        variant === 'outline' && styles.outline,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      testID={testID}
    >
      <Icon name={name} size={iconSize} color={color ?? semantic.icon.primary} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.full,
    justifyContent: 'center',
  },
  filled: {
    backgroundColor: brand.primaryGhost,
  },
  outline: {
    borderColor: neutral.gray20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    backgroundColor: semantic.bg.subtle,
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.45,
  },
})

export default IconButton
