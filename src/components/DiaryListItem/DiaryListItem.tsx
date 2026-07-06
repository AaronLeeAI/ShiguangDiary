import React, { useCallback } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Icon } from '@/components/Icon'
import { haptic } from '@animations/haptics'
import { neutral, semantic, spacing, typography } from '@theme'
import type { DiaryListItemProps } from './types'

export const DiaryListItem: React.FC<DiaryListItemProps> = ({
  title = '未命名日记',
  content,
  date,
  mood,
  imageCount = 0,
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
      disabled={!onPress}
      onPress={handlePress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed, style]}
      testID={testID}
    >
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {content ? (
          <Text numberOfLines={2} style={styles.excerpt}>
            {content}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          {date ? <Text style={styles.meta}>{date}</Text> : null}
          {mood ? <Text style={styles.meta}>{mood}</Text> : null}
          {imageCount > 0 ? (
            <View style={styles.imageMeta}>
              <Icon name="image" size={13} color={semantic.icon.tertiary} />
              <Text style={styles.meta}>{imageCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Icon name="chevronRight" size={16} color={semantic.icon.tertiary} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomColor: semantic.divider.subtle,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 76,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  pressed: {
    backgroundColor: semantic.bg.subtle,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.bodyL,
    color: neutral.gray90,
  },
  excerpt: {
    ...typography.bodyS,
    color: neutral.gray60,
    marginTop: 2,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  meta: {
    ...typography.caption,
    color: neutral.gray50,
  },
  imageMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
})

export default DiaryListItem
