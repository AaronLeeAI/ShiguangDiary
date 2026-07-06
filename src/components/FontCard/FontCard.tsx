import React, { useCallback } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Icon } from '@/components/Icon'
import { haptic } from '@animations/haptics'
import { brand, neutral, radius, semantic, spacing, typography } from '@theme'
import type { FontCardProps } from './types'

export const FontCard: React.FC<FontCardProps> = ({
  name = '系统字体',
  sample = '时光日记 Aa 123',
  fontFamily,
  selected = false,
  disabled = false,
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
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled || !onPress}
      onPress={handlePress}
      style={[styles.card, selected && styles.selected, disabled && styles.disabled, style]}
      testID={testID}
    >
      <View style={styles.textWrap}>
        <Text style={styles.name}>{name}</Text>
        <Text style={[styles.sample, fontFamily ? { fontFamily } : null]}>{sample}</Text>
      </View>
      {selected ? <Icon name="check" size={20} color={brand.primary} /> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: semantic.bg.card,
    borderColor: semantic.border.default,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    padding: spacing.base,
  },
  selected: {
    borderColor: brand.primary,
  },
  disabled: {
    opacity: 0.45,
  },
  textWrap: {
    flex: 1,
  },
  name: {
    ...typography.bodyL,
    color: neutral.gray90,
  },
  sample: {
    ...typography.bodyM,
    color: neutral.gray60,
    marginTop: spacing.xs,
  },
})

export default FontCard
