import React, { useCallback, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { haptic } from '@animations/haptics'
import { brand, neutral, radius } from '@theme'
import type { LockPatternProps } from './types'

const DOTS = Array.from({ length: 9 }, (_, index) => index + 1)

export const LockPattern: React.FC<LockPatternProps> = ({
  value,
  onChange,
  onComplete,
  disabled = false,
  size = 240,
  style,
  testID,
}) => {
  const [inner, setInner] = useState<number[]>([])
  const selected = value ?? inner
  const cellSize = size / 3

  const selectDot = useCallback(
    (dot: number) => {
      if (disabled || selected.includes(dot)) {
        return
      }
      const next = [...selected, dot]
      haptic('tap')
      if (!value) {
        setInner(next)
      }
      onChange?.(next)
      if (next.length >= 4) {
        onComplete?.(next)
      }
    },
    [disabled, onChange, onComplete, selected, value],
  )

  return (
    <View
      style={[styles.grid, { height: size, width: size }, disabled && styles.disabled, style]}
      testID={testID}
    >
      {DOTS.map(dot => {
        const active = selected.includes(dot)
        return (
          <Pressable
            accessibilityLabel={`手势点 ${dot}`}
            accessibilityRole="button"
            key={dot}
            onPress={() => selectDot(dot)}
            style={[styles.cell, { height: cellSize, width: cellSize }]}
          >
            <View style={[styles.dot, active && styles.dotActive]} />
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  disabled: {
    opacity: 0.45,
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    backgroundColor: neutral.gray20,
    borderColor: neutral.gray40,
    borderRadius: radius.full,
    borderWidth: 1,
    height: 24,
    width: 24,
  },
  dotActive: {
    backgroundColor: brand.primary,
    borderColor: brand.primary,
  },
})

export default LockPattern
