import React, { useCallback } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Icon } from '@/components/Icon'
import { haptic } from '@animations/haptics'
import { brand, neutral, radius, semantic, spacing, typography } from '@theme'
import type { ListStyleCardProps } from './types'

export const ListStyleCard: React.FC<ListStyleCardProps> = ({
  title = '卡片视图',
  description = '封面、标题与摘要信息',
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
      <View style={styles.preview}>
        <View style={styles.previewLineWide} />
        <View style={styles.previewLine} />
        <View style={styles.previewDot} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
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
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    padding: spacing.base,
  },
  selected: {
    borderColor: brand.primary,
    borderWidth: 1,
  },
  preview: {
    backgroundColor: semantic.bg.subtle,
    borderRadius: radius.sm,
    height: 48,
    justifyContent: 'center',
    marginRight: spacing.md,
    padding: spacing.sm,
    width: 56,
  },
  previewLineWide: {
    backgroundColor: neutral.gray40,
    borderRadius: radius.full,
    height: 6,
    marginBottom: spacing.xs,
    width: 36,
  },
  previewLine: {
    backgroundColor: neutral.gray30,
    borderRadius: radius.full,
    height: 5,
    width: 28,
  },
  previewDot: {
    backgroundColor: brand.primary,
    borderRadius: radius.full,
    height: 5,
    marginTop: spacing.xs,
    width: 5,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.bodyL,
    color: neutral.gray90,
  },
  description: {
    ...typography.bodyS,
    color: neutral.gray50,
    marginTop: 2,
  },
})

export default ListStyleCard
