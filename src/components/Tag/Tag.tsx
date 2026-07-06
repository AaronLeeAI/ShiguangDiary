import React, { useCallback } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'

import { haptic } from '@animations/haptics'
import { brand, func, neutral, radius, spacing, typography } from '@theme'
import type { TagProps, TagVariant } from './types'

const variantColor: Record<TagVariant, string> = {
  default: neutral.gray60,
  primary: brand.primary,
  danger: func.danger,
  warning: func.warning,
  success: func.success,
}

export const Tag: React.FC<TagProps> = ({
  label,
  children,
  variant = 'default',
  selected = false,
  disabled = false,
  onPress,
  style,
  testID,
}) => {
  const handlePress = useCallback(() => {
    if (!disabled) {
      haptic('tap')
      onPress?.()
    }
  }, [disabled, onPress])
  const color = selected ? brand.primary : variantColor[variant]

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'text'}
      disabled={disabled || !onPress}
      onPress={handlePress}
      style={[styles.container, selected && styles.selected, disabled && styles.disabled, style]}
      testID={testID}
    >
      <Text style={[styles.text, { color }]}>{label ?? children}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: neutral.gray05,
    borderColor: neutral.gray20,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  selected: {
    backgroundColor: brand.primaryGhost,
    borderColor: brand.primary,
  },
  disabled: {
    opacity: 0.45,
  },
  text: {
    ...typography.bodyS,
  },
})

export default Tag
