/**
 * Search Store - 搜索运行时态 + 持久化历史
 *
 * 仅持 query/sort/history/status;
 * **不持 results 全量、不持 recommendations**(派生数据)——results 由 useSearch
 * useMemo 经 searchService 派生,推荐词由 useSearch 经 computeRecommendations 派生,
 * 避免与缓存状态分裂/rehydrate 不一致(DECISIONS 032)。
 *
 * 仅 history 持久化到 MMKV(zustand persist);query/sort/status 运行时态。
 *
 * 数据流:useSearch → searchStore(态) + diaryStore(数据,经 searchService 派生)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { createStoreStorage, storePersistKeys } from '@store/persist'
import type { SearchSort, SearchStatus, SearchStore } from '../types'

export const MAX_HISTORY = 8

/** 默认推荐词(与历史前若干合并)。 */
const DEFAULT_RECOMMENDATIONS = ['心情', '天气', '旅行', '加班']

/** 推荐 = 历史前 3 ∪ 默认词(去重,最多 7 个)。useSearch 用。 */
export function computeRecommendations(history: string[]): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const h of history.slice(0, 3)) {
    if (h && !seen.has(h)) {
      seen.add(h)
      out.push(h)
    }
  }
  for (const d of DEFAULT_RECOMMENDATIONS) {
    if (!seen.has(d)) {
      seen.add(d)
      out.push(d)
    }
  }
  return out.slice(0, 7)
}

export const useSearchStore = create<SearchStore>()(
  persist(
    set => ({
      query: '',
      sort: 'relevance',
      history: [],
      status: 'idle',

      setQuery: q => set({ query: q, status: q.trim() ? 'searching' : 'idle' }),

      setSort: sort => set({ sort }),

      addHistory: q => {
        const trimmed = q.trim()
        if (!trimmed) {
          return
        }
        set(s => ({
          history: [trimmed, ...s.history.filter(h => h !== trimmed)].slice(0, MAX_HISTORY),
        }))
      },

      removeHistory: q => set(s => ({ history: s.history.filter(h => h !== q) })),

      clearHistory: () => set({ history: [] }),

      setStatus: status => set({ status }),

      reset: () =>
        set({
          query: '',
          sort: 'relevance' as SearchSort,
          status: 'idle' as SearchStatus,
          // history 不重置(用户历史不应因返回清空)。
        }),
    }),
    {
      name: storePersistKeys.searchHistory,
      storage: createStoreStorage(),
      // 仅持久化 history;query/sort/status 运行时态(杀进程不恢复悬空搜索态)。
      partialize: s => ({ history: s.history }),
    },
  ),
)

export default useSearchStore
