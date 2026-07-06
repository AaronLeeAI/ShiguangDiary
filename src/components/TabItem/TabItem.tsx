import React, { useCallback } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'

import { Icon } from '@/components/Icon'
import { haptic } from '@animations/haptics'
import { brand, semantic, spacing, typography } from '@theme'
import type { TabItemProps } from './types'

export const TabItem: React.FC<TabItemProps> = ({
  label = 'Tab',
  icon = 'list',
  activeIcon,
  active = false,
  onPress,
  style,
  testID,
}) => {
  const handlePress = useCallback(() => {
    haptic('tap')
    onPress?.()
  }, [onPress])
  const color = active ? brand.primary : semantic.icon.tertiary

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={handlePress}
      style={[styles.container, style]}
      testID={testID}
    >
      <Icon name={active && activeIcon ? activeIcon : icon} size={24} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 52,
  },
  label: {
    ...typography.tabLabel,
  },
})

export default TabItem
