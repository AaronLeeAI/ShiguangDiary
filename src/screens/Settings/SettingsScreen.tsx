/**
 * Settings Screen - 设置首页(统一配置入口)
 *
 * Task14 配置中心入口页:分组列出外观/通用/编辑器/关于等子页入口。
 * 数据流:本页仅做路由聚合 + 当前值摘要(派生自 useSettings);真实配置读写在各子页
 * (DarkMode/Preferences/About),经 useSettings → preferencesStore(MMKV 持久化)。
 * 页面不直接访问 MMKV,统一经 useSettings。
 */

import React, { useCallback } from 'react'
import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { SettingsGroup } from '@/components/SettingsGroup'
import { SettingsRow } from '@/components/SettingsRow'
import { TopBar } from '@/components/TopBar'
import { ROUTES } from '@constants/routes'
import { useSettings } from '@features/settings'
import type { RootStackParamList } from '@navigation/types'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { spacing } from '@theme'

export type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>
export interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp
}

const HOME_LIST_LABELS: Record<string, string> = {
  timeline: '时间轴',
  card: '卡片',
  compact: '紧凑',
}
const SORT_LABELS: Record<string, string> = {
  updatedDesc: '最近更新',
  createdDesc: '创建 新→旧',
  createdAsc: '创建 旧→新',
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  const { homeListStyle, diarySortOrder, followsSystem, isDark } = useSettings()

  const go = useCallback(
    (route: keyof RootStackParamList) => () => {
      navigation.navigate(route as never)
    },
    [navigation],
  )

  const themeHint = followsSystem ? '跟随系统' : isDark ? '深色' : '浅色'

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <TopBar title="设置" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.base, paddingBottom: spacing.huge }}>
        <SettingsGroup title="外观">
          <SettingsRow
            icon="moon"
            label="深色模式"
            hint={themeHint}
            onPress={go(ROUTES.DARK_MODE)}
          />
          <SettingsRow icon="image" label="主题背景" hint="敬请期待" disabled showArrow={false} />
        </SettingsGroup>

        <SettingsGroup title="通用">
          <SettingsRow
            icon="tune"
            label="偏好设置"
            hint={`${HOME_LIST_LABELS[homeListStyle] ?? ''} · ${SORT_LABELS[diarySortOrder] ?? ''}`}
            onPress={go(ROUTES.PREFERENCES)}
          />
          <SettingsRow icon="list" label="列表样式" hint="敬请期待" disabled showArrow={false} />
        </SettingsGroup>

        <SettingsGroup title="编辑器">
          <SettingsRow icon="edit" label="工具栏定制" hint="敬请期待" disabled showArrow={false} />
          <SettingsRow icon="bold" label="字体管理" hint="敬请期待" disabled showArrow={false} />
        </SettingsGroup>

        <SettingsGroup title="关于">
          <SettingsRow icon="doc" label="关于拾光日记" onPress={go(ROUTES.ABOUT)} />
        </SettingsGroup>
      </ScrollView>
    </View>
  )
}

export default SettingsScreen
