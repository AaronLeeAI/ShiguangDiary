/**
 * useSearch - 搜索视图模型 Hook
 *
 * 订阅 searchStore(query/sort/history/status)+ diaryStore(diaries),
 * 经 searchService 派生结果。防抖 300ms(避免每键重算)。
 *
 * SearchScreen 只消费本 hook,不直接写 match/filter(全在 searchService → searchEngine)。
 *
 * 数据流:SearchScreen → useSearch → searchStore(态) + diaryStore(数据) → searchService
 */

import { useEffect, useMemo, useRef, useState } from 'react'

import { useDiaryStore } from '@store/diaryStore'

import { searchService } from '../services/searchService'
import { computeRecommendations, useSearchStore } from '../store/searchStore'
import { SEARCH_DEBOUNCE_MS } from '../types'
import type { SearchResult, SearchSort } from '../types'

export interface UseSearchResult {
  /** 输入框当前值(即时,绑定 SearchBar)。 */
  query: string
  /** 已防抖的查询(实际参与搜索)。用于防闪烁的 UI。 */
  debouncedQuery: string
  /** 是否处于输入但尚未搜索完(flicker 控制)。 */
  isTyping: boolean
  sort: SearchSort
  status: ReturnType<typeof useSearchStore.getState>['status']
  history: string[]
  recommendations: string[]
  /** 搜索结果(基于 debouncedQuery)。 */
  results: SearchResult[]
  /** 是否空结果(仅当有 query 且无命中时 true)。 */
  isEmpty: boolean
  /** 是否处于"未输入"态(显示历史/推荐)。 */
  isIdle: boolean

  setQuery: (q: string) => void
  setSort: (s: SearchSort) => void
  /** 提交历史(点搜索/历史标签后调用)。 */
  commitHistory: (q?: string) => void
  removeHistory: (q: string) => void
  clearHistory: () => void
  /** 退出搜索页:清 query 但保留历史。 */
  reset: () => void
}

export function useSearch(): UseSearchResult {
  const query = useSearchStore(s => s.query)
  const sort = useSearchStore(s => s.sort)
  const status = useSearchStore(s => s.status)
  const history = useSearchStore(s => s.history)
  const setQueryRaw = useSearchStore(s => s.setQuery)
  const setSort = useSearchStore(s => s.setSort)
  const addHistory = useSearchStore(s => s.addHistory)
  const removeHistoryRaw = useSearchStore(s => s.removeHistory)
  const clearHistoryRaw = useSearchStore(s => s.clearHistory)
  const setStatus = useSearchStore(s => s.setStatus)
  const resetStore = useSearchStore(s => s.reset)

  const diaries = useDiaryStore(s => s.diaries)

  // 防抖:query 变化后延迟 SEARCH_DEBOUNCE_MS 再落到 debouncedQuery + 状态 done。
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    const trimmed = query.trim()
    if (!trimmed) {
      setDebouncedQuery('')
      setStatus('idle')
      return
    }
    setStatus('searching')
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(trimmed)
      setStatus('done')
    }, SEARCH_DEBOUNCE_MS)
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [query, setStatus])

  // 结果派生:基于 debouncedQuery + sort + diaries(内存,O(n) 量级足够)。
  const results = useMemo<SearchResult[]>(
    () => searchService.searchDiaries(diaries, debouncedQuery, sort),
    [diaries, debouncedQuery, sort],
  )

  const recommendations = useMemo(() => computeRecommendations(history), [history])
  const isIdle = !query.trim()
  const isTyping = query.trim() !== debouncedQuery && !!query.trim()
  const isEmpty = !isIdle && status === 'done' && results.length === 0

  const setQuery = (q: string) => setQueryRaw(q)
  const commitHistory = (q?: string) => addHistory(q ?? query)
  const removeHistory = (q: string) => removeHistoryRaw(q)
  const clearHistory = () => clearHistoryRaw()
  const reset = () => resetStore()

  return {
    query,
    debouncedQuery,
    isTyping,
    sort,
    status,
    history,
    recommendations,
    results,
    isEmpty,
    isIdle,
    setQuery,
    setSort,
    commitHistory,
    removeHistory,
    clearHistory,
    reset,
  }
}
