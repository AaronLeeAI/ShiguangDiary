/**
 * Search Screen - P000 搜索页
 *
 * 数据流:SearchScreen → useSearch → searchStore(态) + diaryStore(数据) → searchService → searchEngine
 * 页面只消费 useSearch,不直接写 match/filter(全在 searchEngine,DECISIONS 032)。
 *
 * 闲置:SearchHistory(历史 + 推荐,MMKV 持久)。
 * 有 query:防抖 300ms 后展示 SearchResultItem(关键词高亮),空命中 EmptyState。
 */

import React, { useCallback } from 'react'
import { FlatList, Pressable, Text, View, type ListRenderItem } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { EmptyState } from '@/components/EmptyState'
import { Loading } from '@/components/Loading'
import { SearchBar } from '@/components/SearchBar'
import { SearchHistory, SearchResultItem, useSearch, type SearchResult } from '@features/search'
import { ROUTES } from '@constants/routes'

import { styles } from './styles'
import type { SearchScreenProps } from './types'

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  const {
    query,
    sort,
    status,
    history,
    recommendations,
    results,
    isEmpty,
    isIdle,
    isTyping,
    setQuery,
    setSort,
    commitHistory,
    clearHistory,
  } = useSearch()

  const handleItemPress = useCallback(
    (id: string) => {
      navigation.navigate(ROUTES.DIARY_VIEW, { id })
    },
    [navigation],
  )

  const handleTagPress = useCallback(
    (tag: string) => {
      setQuery(tag)
      commitHistory(tag)
    },
    [setQuery, commitHistory],
  )

  const handleSubmit = useCallback(() => {
    if (query.trim()) {
      commitHistory()
    }
  }, [query, commitHistory])

  const handleCancel = useCallback(() => navigation.goBack(), [navigation])

  const ListHeader = useCallback(() => {
    if (isIdle) {
      return (
        <SearchHistory
          history={history}
          recommendations={recommendations}
          onTagPress={handleTagPress}
          onClearHistory={clearHistory}
        />
      )
    }
    return (
      <View style={styles.resultHeader}>
        <Text style={styles.resultCount}>
          共 {results.length} 条与&ldquo;{query.trim()}&rdquo;相关的日记
        </Text>
        <View style={styles.sortRow}>
          <Pressable
            hitSlop={6}
            onPress={() => setSort('relevance')}
            style={[styles.sortButton, sort === 'relevance' && styles.sortButtonActive]}
          >
            <Text style={[styles.sortText, sort === 'relevance' && styles.sortTextActive]}>
              相关度
            </Text>
          </Pressable>
          <Pressable
            hitSlop={6}
            onPress={() => setSort('time')}
            style={[styles.sortButton, sort === 'time' && styles.sortButtonActive]}
          >
            <Text style={[styles.sortText, sort === 'time' && styles.sortTextActive]}>时间</Text>
          </Pressable>
        </View>
      </View>
    )
  }, [
    isIdle,
    history,
    recommendations,
    query,
    results,
    sort,
    setSort,
    handleTagPress,
    clearHistory,
  ])

  const showResults = !isIdle && (status === 'done' || (status === 'searching' && !isTyping))

  const keyExtractor = useCallback((result: SearchResult) => result.item.id, [])

  const renderResultItem = useCallback<ListRenderItem<SearchResult>>(
    ({ item }) => <SearchResultItem result={item} onPress={handleItemPress} />,
    [handleItemPress],
  )

  const renderSeparator = useCallback(() => <View style={styles.separator} />, [])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onSubmit={handleSubmit}
        showCancel
        onCancel={handleCancel}
        autoFocus
      />

      <View style={styles.body}>
        {isIdle ? (
          ListHeader()
        ) : isEmpty ? (
          <EmptyState variant="search" subtitle={`未找到与"${query.trim()}"相关的日记`} />
        ) : showResults ? (
          <FlatList
            data={results}
            keyExtractor={keyExtractor}
            renderItem={renderResultItem}
            ItemSeparatorComponent={renderSeparator}
            ListHeaderComponent={ListHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews
          />
        ) : (
          <Loading variant="inline" visible />
        )}
      </View>
    </View>
  )
}

export default SearchScreen
