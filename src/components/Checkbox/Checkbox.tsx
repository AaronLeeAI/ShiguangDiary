import React, { useCallback, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Icon } from '@/components/Icon'
import { haptic } from '@animations/haptics'
import { brand, neutral, spacing, typography } from '@theme'
import type { CheckboxProps } from './types'

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  value,
  defaultChecked = false,
  onChange,
  onValueChange,
  disabled = false,
  label,
  style,
  testID,
  accessibilityLabel,
}) => {
  const isControlled = typeof checked === 'boolean' || typeof value === 'boolean'
  const controlledValue = checked ?? value
  const [innerChecked, setInnerChecked] = useState(defaultChecked)
  const selected = isControlled ? Boolean(controlledValue) : innerChecked

  const handlePress = useCallback(() => {
    if (disabled) {
      return
    }
    const next = !selected
    if (!isControlled) {
      setInnerChecked(next)
    }
    haptic('tap')
    onChange?.(next)
    onValueChange?.(next)
  }, [disabled, isControlled, onChange, onValueChange, selected])

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={handlePress}
      style={[styles.container, disabled && styles.disabled, style]}
      testID={testID}
    >
      <View style={[styles.box, selected && styles.boxChecked]}>
        {selected ? <Icon name="check" size={14} color={neutral.white} /> : null}
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  disabled: {
    opacity: 0.45,
  },
  box: {
    alignItems: 'center',
    borderColor: neutral.gray50,
    borderRadius: 2,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  boxChecked: {
    backgroundColor: brand.primary,
    borderColor: brand.primary,
  },
  label: {
    ...typography.bodyM,
    color: neutral.gray80,
    marginLeft: spacing.sm,
  },
})

export default Checkbox
