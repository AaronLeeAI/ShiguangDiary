import React, { useCallback } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Icon } from '@/components/Icon'
import { haptic } from '@animations/haptics'
import { neutral, semantic, spacing, typography } from '@theme'
import type { ListRowProps } from './types'

export const ListRow: React.FC<ListRowProps> = ({
  title,
  subtitle,
  icon,
  left,
  right,
  showArrow = false,
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
      accessibilityRole={onPress ? 'button' : 'text'}
      disabled={disabled || !onPress}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      testID={testID}
    >
      {left ?? (icon ? <Icon name={icon} size={22} color={semantic.icon.secondary} /> : null)}
      <View style={styles.content}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
      {showArrow ? <Icon name="chevronRight" size={16} color={semantic.icon.tertiary} /> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomColor: semantic.divider.subtle,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: spacing.base,
  },
  pressed: {
    backgroundColor: semantic.bg.subtle,
  },
  disabled: {
    opacity: 0.45,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    ...typography.bodyL,
    color: neutral.gray90,
  },
  subtitle: {
    ...typography.bodyS,
    color: neutral.gray50,
    marginTop: 2,
  },
})

export default ListRow
