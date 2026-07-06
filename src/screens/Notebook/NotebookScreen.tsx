/**
 * Notebook Screen - P002 日记本列表
 *
 * 数据源：useDiaryStore
 */

import React, { useCallback, useEffect } from 'react'
import { FlatList, Pressable, View, type ListRenderItem } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { BottomTabBar } from '@/components/BottomTabBar'
import { DiaryBookCard } from '@/components/DiaryBookCard'
import { EmptyState } from '@/components/EmptyState'
import { FloatingActionButton } from '@/components/FloatingActionButton'
import { Icon } from '@/components/Icon'
import { Loading } from '@/components/Loading'
import { TopBar } from '@/components/TopBar'
import { ROUTES } from '@constants/routes'
import { colors, spacing } from '@theme'
import { useDiaryStore } from '@store/diaryStore'
import { toast } from '@/components/Toast'

import { styles } from './styles'
import type { Notebook } from '@types'
import type { NotebookScreenProps } from './types'

export const NotebookScreen: React.FC<NotebookScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  const notebooks = useDiaryStore(s => s.notebooks)
  const initialized = useDiaryStore(s => s.initialized)
  const loading = useDiaryStore(s => s.loading)
  const init = useDiaryStore(s => s.init)
  const createNotebook = useDiaryStore(s => s.createNotebook)

  useEffect(() => {
    if (!initialized) {
      init()
    }
  }, [initialized, init])

  const handleItemPress = useCallback(
    (id: string) => {
      navigation.navigate(ROUTES.NOTEBOOK_DETAIL, { id })
    },
    [navigation],
  )

  const handleItemLongPress = useCallback((id: string) => {
    // 后续接 ActionSheet
    toast.info(`长按日记本: ${id}`)
  }, [])

  const handleNew = useCallback(async () => {
    try {
      const nb = await createNotebook(`新日记本 ${notebooks.length + 1}`)
      toast.success(`已创建: ${nb.name}`)
    } catch (e) {
      toast.error('创建失败')
    }
  }, [createNotebook, notebooks.length])

  const handleSort = useCallback(() => {
    navigation.navigate(ROUTES.NOTEBOOK_SORT)
  }, [navigation])

  const handleTabPress = useCallback(
    (tab: 'Home' | 'Notebook' | 'Album' | 'Profile') => {
      if (tab === 'Notebook') {
        return
      }
      navigation.navigate(ROUTES.MAIN_TABS, { screen: tab })
    },
    [navigation],
  )

  const keyExtractor = useCallback((item: Notebook) => item.id, [])

  const renderNotebookItem = useCallback<ListRenderItem<Notebook>>(
    ({ item }) => (
      <DiaryBookCard
        item={item}
        onPress={() => handleItemPress(item.id)}
        onLongPress={() => handleItemLongPress(item.id)}
      />
    ),
    [handleItemLongPress, handleItemPress],
  )

  const renderSeparator = useCallback(() => <View style={styles.separator} />, [])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TopBar
        title="日记本"
        right={
          <Pressable hitSlop={12} onPress={handleSort} style={{ padding: spacing.sm }}>
            <Icon name="tune" size={22} color={colors.semantic.icon.primary} />
          </Pressable>
        }
      />

      <View style={styles.body}>
        {loading || !initialized ? (
          <Loading variant="full" visible={true} />
        ) : notebooks.length === 0 ? (
          <EmptyState variant="notebook" actionLabel="新建日记本" onAction={handleNew} />
        ) : (
          <FlatList
            data={notebooks}
            keyExtractor={keyExtractor}
            renderItem={renderNotebookItem}
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

      <FloatingActionButton onPress={handleNew} />

      <BottomTabBar currentTab="Notebook" onTabPress={handleTabPress} />
    </View>
  )
}

export default NotebookScreen
