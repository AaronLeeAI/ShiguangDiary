/**
 * Search Screen - P005 搜索页面
 *
 * 闭合"读 → 写 → 查"主流程。
 *
 * 整合组件：
 * - SearchBar：顶部搜索输入
 * - DiaryCard：搜索结果列表
 * - EmptyState（search 变体）：无结果
 * - Loading：搜索中
 * - 历史标签：搜索历史
 *
 * 当前使用 mock 数据。
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { DiaryCard } from '@/components/DiaryCard'
import { EmptyState } from '@/components/EmptyState'
import { Loading } from '@/components/Loading'
import { SearchBar } from '@/components/SearchBar'
import { ROUTES } from '@constants/routes'
import type { Diary } from '@types'

import { styles } from './styles'
import type { SearchScreenProps } from './types'

const MOCK_DATASET: Diary[] = [
  {
    id: '1',
    notebookId: 'nb-1',
    title: '今天天气真好',
    summary: '下午和朋友们去公园散步，看到了盛开的樱花，心情非常愉快。',
    content: '粉白色的花瓣在阳光下透出淡淡的粉色，风一吹就飘落下来。',
    cover: null,
    weather: '晴',
    location: '北京·朝阳公园',
    mood: '😊',
    day: '04',
    monthYear: '07月·周四',
    timestamp: '14:30',
    isPinned: true,
    isEncrypted: false,
    isDraft: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    deletedAt: null,
  },
  {
    id: '2',
    notebookId: 'nb-1',
    title: '',
    summary: '项目进入关键阶段，团队加班到深夜，终于把核心功能跑通了。',
    content: '技术债总是要还的。',
    cover: null,
    weather: null,
    location: null,
    mood: null,
    day: '03',
    monthYear: '07月·周三',
    timestamp: '23:15',
    isPinned: false,
    isEncrypted: false,
    isDraft: false,
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 172800000,
    deletedAt: null,
  },
  {
    id: '3',
    notebookId: 'nb-2',
    title: '深夜随想',
    summary: '有些事情过去就过去了，不必执着，也不必后悔。',
    content: '夜深人静的时候容易想太多。',
    cover: null,
    weather: null,
    location: null,
    mood: null,
    day: '02',
    monthYear: '07月·周二',
    timestamp: '01:20',
    isPinned: false,
    isEncrypted: true,
    isDraft: false,
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 259200000,
    deletedAt: null,
  },
  {
    id: '4',
    notebookId: 'nb-3',
    title: '杭州西湖一日游',
    summary: '雷峰塔下，断桥残雪。江南的烟雨总是让人流连忘返。',
    content: '西湖的水是绿的，山是青的。',
    cover: null,
    weather: '小雨',
    location: '杭州·西湖',
    mood: '😍',
    day: '15',
    monthYear: '06月·周日',
    timestamp: '10:00',
    isPinned: false,
    isEncrypted: false,
    isDraft: false,
    createdAt: Date.now() - 20 * 86400000,
    updatedAt: Date.now() - 20 * 86400000,
    deletedAt: null,
  },
]

const INITIAL_HISTORY = ['樱花', '加班', '杭州', '深夜', '夏天']

/**
 * SearchScreen 组件
 */
export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  const [keyword, setKeyword] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [results, setResults] = useState<Diary[]>([])
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<string[]>(INITIAL_HISTORY)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // 防抖搜索：输入 300ms 后自动查询
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    if (!keyword.trim()) {
      setResults([])
      setSubmitted('')
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(() => {
      const k = keyword.trim().toLowerCase()
      const filtered = MOCK_DATASET.filter(d => {
        const hay = [d.title, d.summary, d.content, d.location ?? '', d.weather ?? '']
          .join(' ')
          .toLowerCase()
        return hay.includes(k)
      })
      setResults(filtered)
      setSubmitted(keyword.trim())
      setLoading(false)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [keyword])

  const handleItemPress = useCallback(
    (item: Diary) => {
      navigation.navigate(ROUTES.DIARY_VIEW, { id: item.id })
    },
    [navigation],
  )

  const handleHistoryTap = useCallback((tag: string) => {
    setKeyword(tag)
  }, [])

  const handleClearHistory = useCallback(() => {
    setHistory([])
  }, [])

  const handleCancel = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  // 当前是否处于"未输入"状态（显示历史）
  const isIdle = !keyword.trim()

  // 搜索结果列表头
  const ListHeader = useMemo(() => {
    if (isIdle) {
      return (
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>搜索历史</Text>
            {history.length > 0 && (
              <Pressable hitSlop={8} onPress={handleClearHistory}>
                <Text style={styles.clearButton}>清空</Text>
              </Pressable>
            )}
          </View>
          {history.length > 0 ? (
            <View style={styles.historyTags}>
              {history.map(tag => (
                <Pressable
                  key={tag}
                  onPress={() => handleHistoryTap(tag)}
                  style={({ pressed }) => [styles.historyTag, pressed && { opacity: 0.6 }]}
                >
                  <Text style={styles.historyTagText}>{tag}</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={{ ...styles.clearButton, color: '#999' }}>暂无历史</Text>
          )}
        </View>
      )
    }
    return (
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <Text style={styles.resultCount}>
          共 {results.length} 条与&ldquo;{submitted}&rdquo;相关的日记
        </Text>
      </View>
    )
  }, [isIdle, history, results, submitted, handleClearHistory, handleHistoryTap])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SearchBar
        value={keyword}
        onChangeText={setKeyword}
        onSubmit={() => {
          if (keyword.trim() && !history.includes(keyword.trim())) {
            setHistory(prev => [keyword.trim(), ...prev].slice(0, 8))
          }
        }}
        showCancel
        onCancel={handleCancel}
        autoFocus
      />

      <View style={styles.body}>
        {loading ? (
          <Loading variant="inline" visible={loading} />
        ) : isIdle ? (
          ListHeader
        ) : results.length === 0 ? (
          <EmptyState variant="search" subtitle={`试试搜索"${submitted || keyword}"相关的关键词`} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <DiaryCard item={item} onPress={() => handleItemPress(item)} />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListHeaderComponent={ListHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </View>
  )
}

export default SearchScreen
