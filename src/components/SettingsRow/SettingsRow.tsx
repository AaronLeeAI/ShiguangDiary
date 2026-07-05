/**
 * SettingsRow - 单行设置项
 *
 * icon + label + (hint | right | chevron)
 */

import React, { useCallback } from 'react'
import { Pressable, Text, View } from 'react-native'

import { Icon } from '@/components/Icon'
import { haptic } from '@animations/haptics'
import { colors } from '@theme'
import { styles } from './styles'
import type { SettingsRowProps } from './types'

/**
 * SettingsRow 组件
 */
export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  label,
  hint,
  right,
  showArrow = true,
  disabled = false,
  destructive = false,
  onPress,
  style,
  testID,
  accessibilityLabel,
}) => {
  const handlePress = useCallback(() => {
    haptic(destructive ? 'delete' : 'tap')
    onPress?.()
  }, [destructive, onPress])

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      testID={testID}
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon && (
        <View style={styles.iconWrap}>
          <Icon
            name={icon}
            size={22}
            color={destructive ? colors.func.danger : colors.semantic.icon.primary}
          />
        </View>
      )}
      <View style={styles.labelWrap}>
        <Text
          style={[
            styles.label,
            destructive && styles.labelDestructive,
            disabled && styles.labelDisabled,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      {!!hint && <Text style={styles.hint}>{hint}</Text>}
      {right ??
        (showArrow && (
          <View style={styles.arrowWrap}>
            <Icon name="chevronRight" size={16} color={colors.semantic.icon.tertiary} />
          </View>
        ))}
    </Pressable>
  )
}

export default SettingsRow
