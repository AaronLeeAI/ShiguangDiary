/**
 * About Screen - 关于拾光日记(版本 + 简介 + 预留入口)
 *
 * 开源许可与检查更新为预留入口(本 Task 不实现),用 hint 标记"敬请期待"并禁用点击。
 */

import React from 'react'
import { View, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AboutCard } from '@features/settings'
import { SettingsGroup } from '@/components/SettingsGroup'
import { SettingsRow } from '@/components/SettingsRow'
import { TopBar } from '@/components/TopBar'
import { spacing } from '@theme'

import type { AboutScreenProps } from './types'

export const APP_NAME = '拾光日记'
export const APP_VERSION = '0.1.0'
export const APP_DESCRIPTION = '记录每一个值得记住的瞬间。'

export const AboutScreen: React.FC<AboutScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets()

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <TopBar title="关于" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.base, paddingBottom: spacing.huge }}>
        <AboutCard appName={APP_NAME} version={APP_VERSION} description={APP_DESCRIPTION} />

        <SettingsGroup title="更多">
          <SettingsRow icon="link" label="开源许可证" hint="敬请期待" disabled showArrow={false} />
          <SettingsRow
            icon="check"
            label="检查更新"
            hint={`v${APP_VERSION}`}
            disabled
            showArrow={false}
          />
        </SettingsGroup>
      </ScrollView>
    </View>
  )
}

export default AboutScreen
