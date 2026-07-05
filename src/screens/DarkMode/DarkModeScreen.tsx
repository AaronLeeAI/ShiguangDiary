/**
 * DarkMode Screen - 主题模式选择(跟随系统/浅色/深色)
 *
 * 复用 ThemeModeSelector;直接绑定 useSettings.setThemeMode,即时生效 + 持久化(MMKV)。
 */

import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { SettingsGroup } from '@/components/SettingsGroup'
import { TopBar } from '@/components/TopBar'
import { ThemeModeSelector, useSettings } from '@features/settings'
import { colors, spacing, typography } from '@theme'

import type { DarkModeScreenProps } from './types'

export const DarkModeScreen: React.FC<DarkModeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  const { themeMode, setThemeMode, followsSystem, isDark } = useSettings()

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <TopBar title="深色模式" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.base }}>
        <SettingsGroup title="主题模式">
          <View style={{ paddingVertical: spacing.md }}>
            <ThemeModeSelector value={themeMode} onChange={setThemeMode} />
          </View>
        </SettingsGroup>
        <Text
          style={{
            ...typography.bodyS,
            color: colors.semantic.text.tertiary,
            marginTop: spacing.md,
            textAlign: 'center',
          }}
        >
          {followsSystem ? '当前跟随系统' : isDark ? '当前：深色' : '当前：浅色'}
        </Text>
      </ScrollView>
    </View>
  )
}

export default DarkModeScreen
