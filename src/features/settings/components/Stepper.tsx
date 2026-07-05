/**
 * Stepper - 数值步进器(± 按钮 + 当前值)
 *
 * 受控组件,用于编辑器字体倍数、自动保存间隔等数值偏好。零第三方依赖,token 样式。
 */

import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'

import { colors, radius, spacing, typography } from '@theme'

export interface StepperProps {
  value: number
  /** 显示格式化(默认直接转字符串)。 */
  format?: (v: number) => string
  onDecrement: () => void
  onIncrement: () => void
  canDecrement?: boolean
  canIncrement?: boolean
  testID?: string
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  format,
  onDecrement,
  onIncrement,
  canDecrement = true,
  canIncrement = true,
  testID,
}) => {
  const label = format ? format(value) : String(value)
  return (
    <View testID={testID} style={styles.row}>
      <Pressable
        hitSlop={8}
        onPress={onDecrement}
        disabled={!canDecrement}
        style={[styles.button, !canDecrement && styles.buttonDisabled]}
      >
        <Text style={styles.sign}>−</Text>
      </Pressable>
      <Text style={styles.value}>{label}</Text>
      <Pressable
        hitSlop={8}
        onPress={onIncrement}
        disabled={!canIncrement}
        style={[styles.button, !canIncrement && styles.buttonDisabled]}
      >
        <Text style={styles.sign}>+</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  button: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.semantic.bg.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  sign: {
    ...typography.bodyL,
    color: colors.brand.primary,
    fontWeight: '600',
  },
  value: {
    minWidth: 56,
    textAlign: 'center',
    ...typography.bodyM,
    color: colors.semantic.text.primary,
  },
})

export default Stepper
