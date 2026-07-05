/**
 * Search Feature - 公共导出
 *
 * 搜索纯派生范式(DECISIONS 032):searchEngine/searchService 以 diaryStore.diaries
 * 为入参,零 DB 查询,与 calendarService 同范式。
 */

export { useSearch } from './hooks/useSearch'
export type { UseSearchResult } from './hooks/useSearch'

export { useSearchStore as searchStore } from './store/searchStore'
export { computeRecommendations, MAX_HISTORY } from './store/searchStore'

export { searchService } from './services/searchService'

export { HighlightText } from './components/HighlightText'
export type { HighlightTextProps } from './components/HighlightText'
export { SearchResultItem } from './components/SearchResultItem'
export type { SearchResultItemProps } from './components/SearchResultItem'
export { SearchHistory } from './components/SearchHistory'
export type { SearchHistoryProps } from './components/SearchHistory'

export { SEARCH_DEBOUNCE_MS } from './types'
export type {
  SearchSort,
  SearchStatus,
  HighlightRange,
  SearchResult,
  SearchState,
  SearchActions,
  SearchStore,
} from './types'
