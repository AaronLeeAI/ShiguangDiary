import React, { useCallback } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { haptic } from '@animations/haptics'
import { brand, neutral, radius, spacing, typography } from '@theme'
import type { DateBlockProps } from './types'

export const DateBlock: React.FC<DateBlockProps> = ({
  day = new Date().getDate(),
  month,
  weekday,
  lunar,
  selected = false,
  hasDiary = false,
  onPress,
  style,
  testID,
}) => {
  const handlePress = useCallback(() => {
    haptic('tap')
    onPress?.()
  }, [onPress])

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={{ selected }}
      disabled={!onPress}
      onPress={handlePress}
      style={[styles.container, selected && styles.selected, style]}
      testID={testID}
    >
      {month ? <Text style={[styles.meta, selected && styles.selectedText]}>{month}</Text> : null}
      <Text style={[styles.day, selected && styles.selectedText]}>
        {String(day).padStart(2, '0')}
      </Text>
      {weekday ? (
        <Text style={[styles.meta, selected && styles.selectedText]}>{weekday}</Text>
      ) : null}
      {lunar ? <Text style={[styles.lunar, selected && styles.selectedText]}>{lunar}</Text> : null}
      {hasDiary ? <View style={[styles.dot, selected && styles.selectedDot]} /> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: radius.md,
    minWidth: 56,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  selected: {
    backgroundColor: brand.primary,
  },
  day: {
    ...typography.titleL,
    color: neutral.gray90,
  },
  meta: {
    ...typography.caption,
    color: neutral.gray60,
  },
  lunar: {
    ...typography.micro,
    color: neutral.gray50,
  },
  selectedText: {
    color: neutral.white,
  },
  dot: {
    backgroundColor: neutral.gray90,
    borderRadius: radius.full,
    height: 4,
    marginTop: 2,
    width: 4,
  },
  selectedDot: {
    backgroundColor: neutral.white,
  },
})

export default DateBlock
