import React, { useCallback } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Icon } from '@/components/Icon'
import { haptic } from '@animations/haptics'
import { brand, neutral, radius, semantic, shadow, spacing, typography } from '@theme'
import type { ThemePreviewCardProps } from './types'

export const ThemePreviewCard: React.FC<ThemePreviewCardProps> = ({
  title = '默认主题',
  primaryColor = brand.primary,
  backgroundColor = neutral.white,
  selected = false,
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
      accessibilityState={{ selected }}
      disabled={!onPress}
      onPress={handlePress}
      style={[styles.card, selected && styles.selected, style]}
      testID={testID}
    >
      <View style={[styles.preview, { backgroundColor }]}>
        <View style={[styles.previewTop, { backgroundColor: primaryColor }]} />
        <View style={styles.previewLineWide} />
        <View style={styles.previewLine} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.title}>{title}</Text>
        {selected ? <Icon name="check" size={18} color={brand.primary} /> : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: semantic.bg.card,
    borderColor: semantic.border.default,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    width: 144,
  },
  selected: {
    ...shadow('sm'),
    borderColor: brand.primary,
  },
  preview: {
    height: 96,
    padding: spacing.sm,
  },
  previewTop: {
    borderRadius: radius.sm,
    height: 24,
    marginBottom: spacing.sm,
  },
  previewLineWide: {
    backgroundColor: neutral.gray30,
    borderRadius: radius.full,
    height: 8,
    marginBottom: spacing.xs,
    width: 88,
  },
  previewLine: {
    backgroundColor: neutral.gray20,
    borderRadius: radius.full,
    height: 8,
    width: 64,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 40,
    paddingHorizontal: spacing.sm,
  },
  title: {
    ...typography.bodyS,
    color: neutral.gray80,
    flex: 1,
  },
})

export default ThemePreviewCard
