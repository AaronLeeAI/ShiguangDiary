import React, { useCallback } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { haptic } from '@animations/haptics'
import { brand, neutral, radius, spacing, typography } from '@theme'
import type { RadioGroupProps, RadioOption } from './types'

export const RadioGroup = <T extends string = string>({
  options = [],
  value,
  onChange,
  direction = 'vertical',
  disabled = false,
  style,
  testID,
}: RadioGroupProps<T>) => {
  const handlePress = useCallback(
    (option: RadioOption<T>) => {
      if (disabled || option.disabled) {
        return
      }
      haptic('tap')
      onChange?.(option.value)
    },
    [disabled, onChange],
  )

  return (
    <View style={[direction === 'horizontal' ? styles.row : styles.column, style]} testID={testID}>
      {options.map(option => {
        const selected = option.value === value
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled: disabled || option.disabled }}
            disabled={disabled || option.disabled}
            key={option.value}
            onPress={() => handlePress(option)}
            style={[styles.item, direction === 'horizontal' && styles.itemHorizontal]}
          >
            <View style={[styles.dotOuter, selected && styles.dotOuterSelected]}>
              {selected ? <View style={styles.dotInner} /> : null}
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.label}>{option.label}</Text>
              {option.description ? (
                <Text style={styles.description}>{option.description}</Text>
              ) : null}
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  column: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 40,
  },
  itemHorizontal: {
    flex: 1,
  },
  dotOuter: {
    alignItems: 'center',
    borderColor: neutral.gray40,
    borderRadius: radius.full,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  dotOuterSelected: {
    borderColor: brand.primary,
  },
  dotInner: {
    backgroundColor: brand.primary,
    borderRadius: radius.full,
    height: 10,
    width: 10,
  },
  textWrap: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  label: {
    ...typography.bodyM,
    color: neutral.gray80,
  },
  description: {
    ...typography.bodyS,
    color: neutral.gray50,
  },
})

export default RadioGroup
