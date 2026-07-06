import React, { useCallback, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Icon } from '@/components/Icon'
import { haptic } from '@animations/haptics'
import { brand, neutral, radius, semantic, shadow, spacing, typography } from '@theme'
import type { FilterDropdownProps } from './types'

export const FilterDropdown = <T extends string = string>({
  label = '筛选',
  value,
  options = [],
  onChange,
  style,
  testID,
}: FilterDropdownProps<T>) => {
  const [open, setOpen] = useState(false)
  const current = useMemo(() => options.find(item => item.value === value), [options, value])
  const toggle = useCallback(() => {
    haptic('tap')
    setOpen(v => !v)
  }, [])

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Pressable accessibilityRole="button" onPress={toggle} style={styles.trigger}>
        <Text style={styles.triggerText}>{current?.label ?? label}</Text>
        <Icon name={open ? 'chevronUp' : 'chevronDown'} size={16} color={semantic.icon.tertiary} />
      </Pressable>
      {open ? (
        <View style={styles.menu}>
          {options.map(option => {
            const selected = option.value === value
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  haptic('tap')
                  onChange?.(option.value)
                  setOpen(false)
                }}
                style={styles.option}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                  {option.label}
                </Text>
                {typeof option.count === 'number' ? (
                  <Text style={styles.count}>{option.count}</Text>
                ) : null}
                {selected ? <Icon name="check" size={16} color={brand.primary} /> : null}
              </Pressable>
            )
          })}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  trigger: {
    alignItems: 'center',
    backgroundColor: semantic.bg.subtle,
    borderRadius: radius.full,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  triggerText: {
    ...typography.bodyS,
    color: neutral.gray80,
    marginRight: spacing.xs,
  },
  menu: {
    ...shadow('md'),
    backgroundColor: neutral.white,
    borderRadius: radius.md,
    minWidth: 160,
    paddingVertical: spacing.xs,
    position: 'absolute',
    right: 0,
    top: 40,
  },
  option: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  optionText: {
    ...typography.bodyM,
    color: neutral.gray80,
    flex: 1,
  },
  optionTextSelected: {
    color: brand.primary,
  },
  count: {
    ...typography.caption,
    color: neutral.gray50,
    marginRight: spacing.xs,
  },
})

export default FilterDropdown
