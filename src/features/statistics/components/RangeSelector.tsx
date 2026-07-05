/**
 * RangeSelector - 月/年/全部 三段切换
 *
 * 视觉仿 SearchScreen 的 sortRow(胶囊式三段)。受控组件,无内部状态。
 * 颜色/间距走 theme token。
 */

import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'

import { colors, radius, spacing, typography } from '@theme'
import type { StatisticsRange } from '../types'

export interface RangeSelectorProps {
  value: StatisticsRange
  onChange: (range: StatisticsRange) => void
  testID?: string
}

const OPTIONS: Array<{ key: StatisticsRange; label: string }> = [
  { key: 'month', label: '本月' },
  { key: 'year', label: '本年' },
  { key: 'all', label: '全部' },
]

export const RangeSelector: React.FC<RangeSelectorProps> = ({ value, onChange, testID }) => {
  return (
    <View testID={testID} style={styles.row}>
      {OPTIONS.map(opt => {
        const active = opt.key === value
        return (
          <Pressable
            key={opt.key}
            hitSlop={6}
            onPress={() => onChange(opt.key)}
            style={[styles.button, active && styles.buttonActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>{opt.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  button: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.semantic.bg.subtle,
  },
  buttonActive: {
    backgroundColor: colors.brand.primaryGhost,
  },
  text: {
    ...typography.bodyS,
    color: colors.semantic.text.tertiary,
  },
  textActive: {
    color: colors.brand.primary,
    fontWeight: '600',
  },
})

export default RangeSelector
