/**
 * Home Screen - P001 首页（日记列表）
 *
 * 数据流：HomeScreen → useHome → diaryStore → diaryService → diaryRepository → SQLite
 * 页面经 useHome hook 访问视图状态，不直接读取 Store 内部实现。
 */

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
  type ImageSourcePropType,
  type ListRenderItem,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ActionSheet } from '@/components/ActionSheet'
import { BottomTabBar } from '@/components/BottomTabBar'
import { DiaryCard } from '@/components/DiaryCard'
import { EmptyState } from '@/components/EmptyState'
import { FloatingActionButton } from '@/components/FloatingActionButton'
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

type HomeDisplayOverride = {
  day: string
  monthYear: string
  title: string
  summary: string
}

const HOME_DISPLAY_OVERRIDES: Record<string, HomeDisplayOverride> = {
  'seed-1': {
    day: '15',
    monthYear: '???????',
    title: '??',
    summary: '??????????????...',
  },
  'seed-2': {
    day: '11',
    monthYear: '???????',
    title: '??',
    summary: '???????...',
  },
  'seed-3': {
    day: '05',
    monthYear: '???????',
    title: '????',
    summary: '????????...',
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
  const [notebookSheetVisible, setNotebookSheetVisible] = useState(false)
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null)

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
    navigation.navigate(ROUTES.SEARCH)
  }, [navigation])

  const handleOpenCalendar = useCallback(() => {
    setCalendarVisible(true)
  }, [])

  const handleCloseCalendar = useCallback(() => {
    setCalendarVisible(false)
  }, [])

  const handleOpenNotebookSheet = useCallback(() => {
    setNotebookSheetVisible(true)
  }, [])

  const handleCloseNotebookSheet = useCallback(() => {
    setNotebookSheetVisible(false)
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

  const notebookActionItems = useMemo(
    () => [
      {
        key: 'all',
        label: '全部 - 不含加密记录',
        icon: 'list' as const,
        onPress: () => setSelectedNotebookId(null),
      },
      ...notebooks.map(notebook => ({
        key: notebook.id,
        label: notebook.name,
        icon: 'book' as const,
        onPress: () => setSelectedNotebookId(notebook.id),
      })),
    ],
    [notebooks],
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.filterPill}
          onPress={handleOpenNotebookSheet}
          accessibilityRole="button"
          accessibilityLabel={`选择首页日记本，当前为${filterLabel}`}
        >
          <Text style={styles.filterPillText} numberOfLines={1}>
            {filterLabel}
          </Text>
          <Icon name="chevronDown" size={14} color={colors.semantic.icon.tertiary} />
        </Pressable>

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
            style={styles.compactIconButton}
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
            removeClippedSubviews
          />
        )}
      </View>

      <FloatingActionButton
        onPress={handleNewDiary}
        accessibilityLabel="新建日记"
        style={[styles.fab, { bottom: 76 + insets.bottom }]}
      />

      <BottomTabBar currentTab="Home" onTabPress={handleTabPress} />

      <ActionSheet
        visible={notebookSheetVisible}
        onClose={handleCloseNotebookSheet}
        title="选择日记本"
        description="首页仅展示所选日记本中的非加密记录"
        items={notebookActionItems}
      />

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
