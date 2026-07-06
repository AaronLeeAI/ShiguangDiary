/**
 * Home Screen - P001 首页（日记列表）
 *
 * 数据流：HomeScreen → useHome → diaryStore → diaryService → diaryRepository → SQLite
 * 页面经 useHome hook 访问视图状态，不直接读取 Store 内部实现。
 */

import React, { useCallback, useEffect, useMemo } from 'react'
import { FlatList, Pressable, Text, View, type ListRenderItem } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { BottomTabBar } from '@/components/BottomTabBar'
import { DiaryCard } from '@/components/DiaryCard'
import { EmptyState } from '@/components/EmptyState'
import { FloatingActionButton } from '@/components/FloatingActionButton'
import { Icon } from '@/components/Icon'
import { Loading } from '@/components/Loading'
import { TopBar } from '@/components/TopBar'
import { useHome } from '@features/home'
import { Calendar, useCalendar } from '@features/calendar'
import { parseKey } from '@features/calendar/utils/timeline'
import { ROUTES } from '@constants/routes'
import { colors, spacing } from '@theme'

import { styles } from './styles'
import type { Diary } from '@types'
import type { HomeScreenProps } from './types'

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  const { diaries, initialized, loading, isEmpty, useFallback, error, reload, init } = useHome()
  const cal = useCalendar()

  useEffect(() => {
    if (!initialized) {
      init()
    }
  }, [initialized, init])

  const handleItemPress = useCallback(
    (id: string) => {
      navigation.navigate(ROUTES.DIARY_VIEW, { id })
    },
    [navigation],
  )

  const handleNewDiary = useCallback(() => {
    navigation.navigate(ROUTES.DIARY_EDIT, {})
  }, [navigation])

  const handleOpenSearch = useCallback(() => {
    navigation.navigate(ROUTES.SEARCH)
  }, [navigation])

  const handleToggleCalendar = useCallback(() => {
    cal.toggleMode()
  }, [cal])

  // 选中日 → 仅显示该日日记;否则显示全部(diaryStore 已降序)。
  const visibleDiaries = cal.selectedDiaries ?? diaries
  const isFilteredByDate = cal.selectedDiaries !== null
  const todayDay = useMemo(
    () => String(parseKey(cal.todayKey).day).padStart(2, '0'),
    [cal.todayKey],
  )

  const handleTabPress = useCallback(
    (tab: 'Home' | 'Notebook' | 'Album' | 'Profile') => {
      if (tab === 'Home') {
        return
      }
      navigation.navigate(ROUTES.MAIN_TABS, { screen: tab })
    },
    [navigation],
  )

  const showEmpty =
    !loading && initialized && (isEmpty || (isFilteredByDate && visibleDiaries.length === 0))

  const keyExtractor = useCallback((item: Diary) => item.id, [])

  const renderDiaryItem = useCallback<ListRenderItem<Diary>>(
    ({ item }) => <DiaryCard item={item} onPress={() => handleItemPress(item.id)} />,
    [handleItemPress],
  )

  const renderSeparator = useCallback(() => <View style={styles.separator} />, [])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TopBar
        title=""
        right={
          <View style={{ flexDirection: 'row' }}>
            <Pressable hitSlop={12} onPress={handleOpenSearch} style={{ padding: spacing.sm }}>
              <Icon name="search" size={22} color={colors.semantic.icon.primary} />
            </Pressable>
            <Pressable
              hitSlop={12}
              onPress={handleToggleCalendar}
              style={styles.calendarBtn}
              accessibilityLabel="切换日历"
            >
              <Icon name="calendar" size={22} color={colors.semantic.icon.primary} />
              <View style={styles.calendarBadge}>
                <Text style={styles.calendarBadgeText}>{todayDay}</Text>
              </View>
            </Pressable>
          </View>
        }
      />

      <Calendar cal={cal} />

      {/* Task16 集成修复:DB 不可用时显降级提示(与 Statistics 一致);真实错误时显 error banner + 重试。 */}
      {useFallback && (
        <View style={styles.fallbackBanner}>
          <Text style={styles.fallbackText}>数据库不可用，以下为本地示例数据</Text>
        </View>
      )}
      {!useFallback && error ? (
        <Pressable style={styles.errorBanner} onPress={reload}>
          <Text style={styles.errorText}>数据加载失败：{error}</Text>
          <Text style={styles.errorAction}>点击重试</Text>
        </Pressable>
      ) : null}

      <View style={styles.body}>
        {loading || !initialized ? (
          <Loading variant="full" visible={true} />
        ) : showEmpty ? (
          isFilteredByDate ? (
            <EmptyState
              variant="custom"
              title="这一天没有日记"
              subtitle="点击右上角加号记录这一天"
            />
          ) : (
            <EmptyState variant="noDiaryToday" />
          )
        ) : (
          <FlatList
            data={visibleDiaries}
            keyExtractor={keyExtractor}
            renderItem={renderDiaryItem}
            ItemSeparatorComponent={renderSeparator}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews
          />
        )}
      </View>

      <FloatingActionButton onPress={handleNewDiary} />

      <BottomTabBar currentTab="Home" onTabPress={handleTabPress} />
    </View>
  )
}

export default HomeScreen
