/**
 * ThemeModeSelector - 主题模式三段切换(跟随系统/浅色/深色)
 *
 * 受控组件,绑 useSettings.setThemeMode。视觉仿 RangeSelector(胶囊式三段)。
 */

import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'

import { colors, radius, spacing, typography } from '@theme'
import type { ThemeModePref } from '../types'

export interface ThemeModeSelectorProps {
  value: ThemeModePref
  onChange: (mode: ThemeModePref) => void
  testID?: string
}

const OPTIONS: Array<{ key: ThemeModePref; label: string }> = [
  { key: 'system', label: '跟随系统' },
  { key: 'light', label: '浅色' },
  { key: 'dark', label: '深色' },
]

export const ThemeModeSelector: React.FC<ThemeModeSelectorProps> = ({
  value,
  onChange,
  testID,
}) => {
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
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.semantic.bg.subtle,
    alignItems: 'center',
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

export default ThemeModeSelector
