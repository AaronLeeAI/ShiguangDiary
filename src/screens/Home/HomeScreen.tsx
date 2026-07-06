/**
 * Home Screen - P001 首页（日记列表）
 *
 * 数据流：HomeScreen → useHome → diaryStore → diaryService → diaryRepository → SQLite
 * 页面经 useHome hook 访问视图状态，不直接读取 Store 内部实现。
 */

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
  type ImageSourcePropType,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ActionSheet } from '@/components/ActionSheet'
import { BottomTabBar } from '@/components/BottomTabBar'
import { DiaryCard } from '@/components/DiaryCard'
import { EmptyState } from '@/components/EmptyState'
import { Icon } from '@/components/Icon'
import { Loading } from '@/components/Loading'
import { TopBar } from '@/components/TopBar'
import { toast } from '@/components/Toast'
import { useHome } from '@features/home'
import { Calendar, useCalendar } from '@features/calendar'
import { ROUTES } from '@constants/routes'
import { useDiaryStore } from '@store/diaryStore'
import { colors } from '@theme'

import { styles } from './styles'
import type { Diary } from '@types'
import type { HomeScreenProps } from './types'

const homeReferenceImage = require('./assets/home-reference-game-card.jpg') as number
const LOCAL_HOME_COVER_KEYS = new Set(['home-reference-game-card'])
const FAB_HIDE_SCROLL_Y = 180
const FAB_SCROLL_DELTA = 8

type HomeDisplayOverride = {
  day: string
  monthYear: string
  title: string
  summary: string
}

const HOME_DISPLAY_OVERRIDES: Record<string, HomeDisplayOverride> = {
  'seed-1': {
    day: '15',
    monthYear: '\u5341\u4e00\u6708\u2022\u661f\u671f\u516d',
    title: '\u968f\u8bb0',
    summary:
      '\u5ffd\u77e5\u5ffd\u89c9\uff0c\u4f3c\u4e4e\u6211\u5df2\u7ecf\u7ed3\u675f\u8bfe\u7a0b...',
  },
  'seed-2': {
    day: '11',
    monthYear: '\u5341\u4e00\u6708\u2022\u661f\u671f\u4e8c',
    title: '\u968f\u8bb0',
    summary: '\u6700\u8fd1\u8fd8\u662f\u5728\u8eba\u5e73...',
  },
  'seed-3': {
    day: '05',
    monthYear: '\u5341\u4e00\u6708\u2022\u661f\u671f\u4e09',
    title: '\u968f\u611f\u968f\u8bb0',
    summary: '\u6210\u957f\u7684\u70e6\u607c\u597d\u591a\u554a...',
  },
}
type HomeListItem = {
  diary: Diary
  display?: HomeDisplayOverride
  summary: string
  coverSource?: ImageSourcePropType | null
}

const firstImageFromContent = (content: string): string | null => {
  const markdownMatch = content.match(/!\[[^\]]*]\(([^)]+)\)/)
  if (markdownMatch?.[1]) {
    return markdownMatch[1]
  }

  const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  return htmlMatch?.[1] ?? null
}

const normalizeImageUri = (uri: string): string => {
  if (/^(https?:|file:|content:|data:|asset:)/i.test(uri)) {
    return uri
  }

  if (uri.startsWith('/')) {
    return `file://${uri}`
  }

  return uri
}

const stripImageMarkup = (content: string): string =>
  content
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

const makeHomeSummary = (diary: Diary): string => {
  const summary = stripImageMarkup(diary.summary)
  if (summary) {
    return summary
  }

  return stripImageMarkup(diary.content)
}

const resolveHomeCoverSource = (diary: Diary): ImageSourcePropType | null => {
  const candidate = diary.cover ?? firstImageFromContent(diary.content)
  if (!candidate) {
    return null
  }

  if (LOCAL_HOME_COVER_KEYS.has(candidate)) {
    return homeReferenceImage
  }

  return { uri: normalizeImageUri(candidate) }
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  const { diaries, initialized, loading, useFallback, error, reload, init } = useHome()
  const notebooks = useDiaryStore(s => s.notebooks)
  const togglePin = useDiaryStore(s => s.togglePin)
  const removeDiary = useDiaryStore(s => s.removeDiary)
  const cal = useCalendar()
  const [calendarVisible, setCalendarVisible] = useState(false)
  const [actionDiary, setActionDiary] = useState<Diary | null>(null)
  const [notebookDropdownVisible, setNotebookDropdownVisible] = useState(false)
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null)
  const [fabVisible, setFabVisible] = useState(true)
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    if (!initialized) {
      init()
    }
  }, [initialized, init])

  // 首页使用已实现的自定义 BottomTabBar，隐藏 React Navigation 默认底栏，避免首页出现双底栏。
  useLayoutEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: 'none' },
    })
  }, [navigation])

  const handleItemPress = useCallback(
    (id: string) => {
      navigation.navigate(ROUTES.DIARY_VIEW, { id })
    },
    [navigation],
  )

  const handleItemLongPress = useCallback((item: Diary) => {
    setActionDiary(item)
  }, [])

  const handleNewDiary = useCallback(() => {
    setNotebookDropdownVisible(false)
    navigation.navigate(ROUTES.DIARY_EDIT, {})
  }, [navigation])

  const handleEditDiary = useCallback(() => {
    if (!actionDiary) {
      return
    }
    navigation.navigate(ROUTES.DIARY_EDIT, { id: actionDiary.id })
  }, [actionDiary, navigation])

  const handleTogglePinDiary = useCallback(async () => {
    if (!actionDiary) {
      return
    }
    await togglePin(actionDiary.id)
    toast.success(actionDiary.isPinned ? '已取消置顶' : '已置顶')
  }, [actionDiary, togglePin])

  const handleDeleteDiary = useCallback(async () => {
    if (!actionDiary) {
      return
    }
    await removeDiary(actionDiary.id)
    toast.success('已删除')
  }, [actionDiary, removeDiary])

  const handleOpenSearch = useCallback(() => {
    setNotebookDropdownVisible(false)
    navigation.navigate(ROUTES.SEARCH)
  }, [navigation])

  const handleOpenCalendar = useCallback(() => {
    setNotebookDropdownVisible(false)
    setCalendarVisible(true)
  }, [])

  const handleCloseCalendar = useCallback(() => {
    setCalendarVisible(false)
  }, [])

  const handleToggleNotebookDropdown = useCallback(() => {
    setNotebookDropdownVisible(visible => !visible)
  }, [])

  const handleCloseNotebookDropdown = useCallback(() => {
    setNotebookDropdownVisible(false)
  }, [])

  const handleSelectNotebook = useCallback((notebookId: string | null) => {
    setSelectedNotebookId(notebookId)
    setNotebookDropdownVisible(false)
  }, [])

  // 选中日 → 仅显示该日日记；否则显示全部（diaryStore 已降序）。
  const visibleDiaries = cal.selectedDiaries ?? diaries
  const isFilteredByDate = cal.selectedDiaries !== null

  const filteredVisibleDiaries = useMemo(
    () =>
      visibleDiaries.filter(
        diary =>
          !diary.isEncrypted && (!selectedNotebookId || diary.notebookId === selectedNotebookId),
      ),
    [selectedNotebookId, visibleDiaries],
  )

  const selectedNotebook = useMemo(
    () => notebooks.find(notebook => notebook.id === selectedNotebookId),
    [notebooks, selectedNotebookId],
  )

  const filterLabel = selectedNotebook
    ? `${selectedNotebook.name} - 不含加密记录`
    : '全部 - 不含加密记录'

  const homeListData = useMemo<HomeListItem[]>(
    () =>
      filteredVisibleDiaries.map(diary => {
        const display = HOME_DISPLAY_OVERRIDES[diary.id]
        return {
          diary,
          display,
          summary: display?.summary ?? makeHomeSummary(diary),
          coverSource: resolveHomeCoverSource(diary),
        }
      }),
    [filteredVisibleDiaries],
  )

  const notebookDiaryCounts = useMemo(
    () =>
      diaries.reduce<Record<string, number>>((acc, diary) => {
        if (!diary.isEncrypted && diary.notebookId) {
          acc[diary.notebookId] = (acc[diary.notebookId] ?? 0) + 1
        }
        return acc
      }, {}),
    [diaries],
  )

  const allNotebookDiaryCount = useMemo(
    () => diaries.filter(diary => !diary.isEncrypted).length,
    [diaries],
  )

  const notebookMenuItems = useMemo(
    () => [
      {
        key: 'all',
        label: '\u5168\u90e8',
        count: allNotebookDiaryCount,
        selected: selectedNotebookId === null,
        onPress: () => handleSelectNotebook(null),
      },
      ...notebooks.map(notebook => ({
        key: notebook.id,
        label: notebook.name,
        count: notebookDiaryCounts[notebook.id] ?? 0,
        selected: selectedNotebookId === notebook.id,
        onPress: () => handleSelectNotebook(notebook.id),
      })),
    ],
    [
      allNotebookDiaryCount,
      handleSelectNotebook,
      notebookDiaryCounts,
      notebooks,
      selectedNotebookId,
    ],
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

  const showEmpty = !loading && initialized && homeListData.length === 0

  const keyExtractor = useCallback((item: HomeListItem) => item.diary.id, [])

  const renderDiaryItem = useCallback<ListRenderItem<HomeListItem>>(
    ({ item }) => (
      <DiaryCard
        item={item.diary}
        variant="homeCompact"
        displayDay={item.display?.day}
        displayMonthYear={item.display?.monthYear}
        displayTitle={item.display?.title}
        displaySummary={item.summary}
        coverSource={item.coverSource}
        onPress={() => handleItemPress(item.diary.id)}
        onLongPress={() => handleItemLongPress(item.diary)}
        style={styles.diaryCard}
      />
    ),
    [handleItemPress, handleItemLongPress],
  )

  const renderSeparator = useCallback(() => <View style={styles.separator} />, [])

  const handleHomeListScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = Math.max(0, event.nativeEvent.contentOffset.y)
    const deltaY = currentY - lastScrollYRef.current

    if (currentY > FAB_HIDE_SCROLL_Y && deltaY > FAB_SCROLL_DELTA) {
      setFabVisible(false)
    } else if (deltaY < -FAB_SCROLL_DELTA || currentY < FAB_HIDE_SCROLL_Y / 2) {
      setFabVisible(true)
    }

    lastScrollYRef.current = currentY
  }, [])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.filterArea}>
          <Pressable
            style={[styles.filterPill, notebookDropdownVisible && styles.filterPillExpanded]}
            onPress={handleToggleNotebookDropdown}
            accessibilityRole="button"
            accessibilityState={{ expanded: notebookDropdownVisible }}
            accessibilityLabel={`\u9009\u62e9\u9996\u9875\u65e5\u8bb0\u672c\uff0c\u5f53\u524d\u4e3a${filterLabel}`}
          >
            <View style={styles.filterPillIconSquare} />
            <Text style={styles.filterPillText} numberOfLines={1}>
              {filterLabel}
            </Text>
            <Icon name="chevronDown" size={14} color={colors.brand.primary} />
          </Pressable>

          {notebookDropdownVisible ? (
            <View style={styles.dropdownPanel}>
              {notebookMenuItems.map(item => (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: item.selected }}
                  onPress={item.onPress}
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    item.selected && styles.dropdownItemSelected,
                    pressed && styles.dropdownItemPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.dropdownItemIconSquare,
                      item.selected && styles.dropdownItemIconSquareSelected,
                    ]}
                  />
                  <Text style={styles.dropdownItemLabel} numberOfLines={1}>
                    {item.label}
                    <Text style={styles.dropdownItemCount}>{`\uff08${item.count}\uff09`}</Text>
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.topActionsCompact}>
          <Pressable
            hitSlop={10}
            onPress={handleOpenSearch}
            style={styles.compactIconButton}
            accessibilityRole="button"
            accessibilityLabel="搜索"
          >
            <Icon name="search" size={21} color={colors.semantic.icon.secondary} />
          </Pressable>
          <Pressable
            hitSlop={10}
            onPress={handleOpenCalendar}
            style={[styles.compactIconButton, styles.compactIconButtonSpaced]}
            accessibilityRole="button"
            accessibilityLabel="打开日历"
          >
            <View style={styles.staticCalendarIcon}>
              <View style={styles.staticCalendarTopLine} />
              <Text style={styles.staticCalendarText}>06</Text>
            </View>
          </Pressable>
        </View>
      </View>

      {notebookDropdownVisible ? (
        <Pressable style={styles.dropdownDismissLayer} onPress={handleCloseNotebookDropdown} />
      ) : null}

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
              subtitle="点击右下角加号记录这一天"
            />
          ) : (
            <EmptyState variant="noDiaryToday" />
          )
        ) : (
          <FlatList
            data={homeListData}
            keyExtractor={keyExtractor}
            renderItem={renderDiaryItem}
            ItemSeparatorComponent={renderSeparator}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
            onScroll={handleHomeListScroll}
            scrollEventThrottle={16}
          />
        )}
      </View>

      {fabVisible ? (
        <View style={[styles.fabLayer, { bottom: 76 + insets.bottom }]}>
          <Pressable
            onPress={handleNewDiary}
            accessibilityRole="button"
            accessibilityLabel="新建日记"
            style={({ pressed }) => [styles.fabButton, pressed && styles.fabButtonPressed]}
          >
            <Text style={styles.fabPlus}>{'\uff0b'}</Text>
          </Pressable>
        </View>
      ) : null}

      <BottomTabBar currentTab="Home" onTabPress={handleTabPress} />

      <ActionSheet
        visible={actionDiary !== null}
        onClose={() => setActionDiary(null)}
        title={actionDiary?.title || '无标题'}
        items={[
          { key: 'edit', label: '编辑', icon: 'edit', onPress: handleEditDiary },
          {
            key: 'pin',
            label: actionDiary?.isPinned ? '取消置顶' : '置顶',
            icon: 'bookmark',
            onPress: handleTogglePinDiary,
          },
          {
            key: 'delete',
            label: '删除',
            icon: 'delete',
            destructive: true,
            onPress: handleDeleteDiary,
          },
        ]}
      />

      <Modal
        visible={calendarVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseCalendar}
      >
        <View style={[styles.calendarPage, { paddingTop: insets.top }]}>
          <TopBar title="日历" showBack onBackPress={handleCloseCalendar} />
          <Calendar cal={cal} />
        </View>
      </Modal>
    </View>
  )
}

export default HomeScreen
