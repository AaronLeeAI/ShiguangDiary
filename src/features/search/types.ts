/**
 * Search Feature - 类型定义
 *
 * 搜索纯派生范式:searchEngine 以 diaryStore.diaries 为入参,
 * 不碰 Repository,不注册全局 registry。派生结果不持在 store(由 useSearch useMemo 派生),
 * store 只持 keyword/history/sort/status。
 */

import type { Diary } from '@types'

/** 搜索防抖时长(ms)。 */
export const SEARCH_DEBOUNCE_MS = 300

/** 排序方式。 */
export type SearchSort = 'relevance' | 'time'

/** 运行时状态。 */
export type SearchStatus = 'idle' | 'searching' | 'done'

/** 文本高亮范围(闭端不包,[start, start+len))。 */
export interface HighlightRange {
  start: number
  length: number
}

/** 单条搜索结果(含命中元信息,用于高亮/snippet)。 */
export interface SearchResult {
  /** 命中日记。 */
  item: Diary
  /** 相关度分数(仅 relevance 排序时用作排序键)。 */
  score: number
  /** 正文摘要片段(围绕首个命中处截取)。 */
  snippet: string
  /** 标题中的高亮范围。 */
  titleRanges: HighlightRange[]
  /** snippet 中的高亮范围。 */
  snippetRanges: HighlightRange[]
}

/** Search Store(运行时态 + 持久化历史)。 */
export interface SearchState {
  query: string
  sort: SearchSort
  history: string[]
  status: SearchStatus
}

export interface SearchActions {
  setQuery: (q: string) => void
  setSort: (s: SearchSort) => void
  /** 入历史(去重、最多 N 条)。空串忽略。 */
  addHistory: (q: string) => void
  removeHistory: (q: string) => void
  clearHistory: () => void
  setStatus: (s: SearchStatus) => void
  reset: () => void
}

export type SearchStore = SearchState & SearchActions
