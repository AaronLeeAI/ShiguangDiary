/**
 * Profile Screen - P004 个人中心
 *
 * 数据源：useDiaryStore（真实统计）
 * UI：SettingsGroup + SettingsRow 组件化
 */

import React, { useCallback, useEffect, useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Avatar } from '@/components/Avatar'
import { BottomTabBar } from '@/components/BottomTabBar'
import { Pressable } from 'react-native'
import { SettingsGroup } from '@/components/SettingsGroup'
import { SettingsRow } from '@/components/SettingsRow'
import { TopBar } from '@/components/TopBar'
import { APP_VERSION_LABEL } from '@constants/app'
import { ROUTES } from '@constants/routes'
import { colors, spacing, typography } from '@theme'
import { useDiaryStore } from '@store/diaryStore'

import { styles } from './styles'
import type { ProfileMenuItem, ProfileScreenProps } from './types'

const MENU_GROUPS: ProfileMenuItem[][] = [
  [
    { key: 'agent-chat', label: 'AI 助手', icon: 'chart', showArrow: true, route: 'AgentChat' },
    { key: 'settings', label: '设置', icon: 'settings', showArrow: true, route: 'Settings' },
    {
      key: 'recycle',
      label: '回收站',
      icon: 'recycle',
      hint: '敬请期待',
      showArrow: false,
      disabled: true,
    },
    {
      key: 'drafts',
      label: '草稿箱',
      icon: 'edit',
      hint: '敬请期待',
      showArrow: false,
      disabled: true,
    },
    { key: 'statistics', label: '数据统计', icon: 'chart', showArrow: true, route: 'Statistics' },
  ],
  [
    { key: 'darkmode', label: '深色模式', icon: 'moon', showArrow: true, route: 'DarkMode' },
    { key: 'preferences', label: '偏好设置', icon: 'tune', showArrow: true, route: 'Preferences' },
    {
      key: 'liststyle',
      label: '列表样式',
      icon: 'list',
      hint: '敬请期待',
      showArrow: false,
      disabled: true,
    },
    {
      key: 'theme-bg',
      label: '主题背景',
      icon: 'image',
      hint: '敬请期待',
      showArrow: false,
      disabled: true,
    },
  ],
  [
    { key: 'export', label: '导出与备份', icon: 'export', showArrow: true, route: 'Export' },
    { key: 'about', label: '关于拾光日记', icon: 'doc', showArrow: true, route: 'About' },
  ],
]

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets()

  const diaries = useDiaryStore(s => s.diaries)
  const notebooks = useDiaryStore(s => s.notebooks)
  const albums = useDiaryStore(s => s.albums)
  const initialized = useDiaryStore(s => s.initialized)
  const init = useDiaryStore(s => s.init)

  useEffect(() => {
    if (!initialized) {
      init()
    }
  }, [initialized, init])

  const stats = useMemo(
    () => [
      { label: '日记', value: diaries.length },
      { label: '日记本', value: notebooks.length },
      { label: '相册', value: albums.length },
    ],
    [diaries.length, notebooks.length, albums.length],
  )

  const handleItemPress = useCallback(
    (item: ProfileMenuItem) => {
      if (item.onPress) {
        item.onPress()
        return
      }
      if (item.route) {
        navigation.navigate(item.route as never)
      }
    },
    [navigation],
  )

  const handleTabPress = useCallback(
    (tab: 'Home' | 'Notebook' | 'Album' | 'Profile') => {
      if (tab === 'Profile') {
        return
      }
      navigation.navigate(ROUTES.MAIN_TABS, { screen: tab })
    },
    [navigation],
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TopBar title="我的" />

      <ScrollView style={styles.body} contentContainerStyle={styles.scrollContent}>
        {/* 用户卡片 */}
        <View style={styles.userCard}>
          <Avatar size="large" name="拾光" />
          <Text style={styles.userName}>拾光日记</Text>
          <Text style={styles.userBio}>记录每一个值得记住的瞬间</Text>
          <Pressable disabled style={[styles.editButton, { opacity: 0.6 }]}>
            <Text style={styles.editButtonText}>编辑资料 · 敬请期待</Text>
          </Pressable>
        </View>

        {/* 统计 */}
        <View style={styles.statsRow}>
          {stats.map((s, idx) => (
            <React.Fragment key={s.label}>
              {idx > 0 && <View style={styles.statDivider} />}
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* 菜单组（组件化） */}
        {MENU_GROUPS.map(group => (
          <SettingsGroup key={group[0]?.key ?? 'group'}>
            {group.map(item => (
              <SettingsRow
                key={item.key}
                icon={item.icon}
                label={item.label}
                hint={item.hint}
                showArrow={item.showArrow !== false}
                destructive={item.destructive}
                disabled={item.disabled}
                onPress={() => handleItemPress(item)}
              />
            ))}
          </SettingsGroup>
        ))}

        <Text
          style={{
            ...typography.caption,
            color: colors.semantic.text.tertiary,
            textAlign: 'center',
            marginTop: spacing.lg,
          }}
        >
          拾光日记 · {APP_VERSION_LABEL}
        </Text>
      </ScrollView>

      <BottomTabBar currentTab="Profile" onTabPress={handleTabPress} />
    </View>
  )
}

export default ProfileScreen
