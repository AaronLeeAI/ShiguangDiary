import React, { useCallback } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { Icon } from '@/components/Icon'
import { haptic } from '@animations/haptics'
import { brand, neutral, radius } from '@theme'
import type { ColorSwatchProps } from './types'

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color = neutral.white,
  selected = false,
  disabled = false,
  size = 32,
  label,
  onPress,
  style,
  testID,
}) => {
  const handlePress = useCallback(() => {
    if (!disabled) {
      haptic('tap')
      onPress?.(color)
    }
  }, [color, disabled, onPress])

  return (
    <Pressable
      accessibilityLabel={label ?? color}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled || !onPress}
      onPress={handlePress}
      style={[styles.touch, disabled && styles.disabled, style]}
      testID={testID}
    >
      <View
        style={[styles.outer, selected && styles.selected, { height: size + 8, width: size + 8 }]}
      >
        <View style={[styles.inner, { backgroundColor: color, height: size, width: size }]}>
          {selected ? <Icon name="check" size={16} color={neutral.white} /> : null}
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  touch: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  outer: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: radius.full,
    borderWidth: 2,
    justifyContent: 'center',
  },
  selected: {
    borderColor: brand.primary,
  },
  inner: {
    alignItems: 'center',
    borderColor: neutral.gray20,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
})

export default ColorSwatch
