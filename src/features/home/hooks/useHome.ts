/**
 * useHome - 首页视图模型 Hook
 *
 * 桥接 HomeScreen 与 diaryStore，封装首页加载 / 空状态 / 刷新语义，
 * 让 HomeScreen 保持纯展示。页面不直接读取 Store 内部实现细节。
 */

import { useCallback } from 'react'

import { useDiaryStore } from '@store/diaryStore'

export interface UseHomeResult {
  diaries: ReturnType<typeof useDiaryStore.getState>['diaries']
  loading: boolean
  initialized: boolean
  isEmpty: boolean
  useFallback: boolean
  /** DB init / 操作失败时的错误信息(null 表示无错)。 */
  error: string | null
  init: () => Promise<void>
  reload: () => Promise<void>
}

export function useHome(): UseHomeResult {
  const diaries = useDiaryStore(s => s.diaries)
  const loading = useDiaryStore(s => s.loading)
  const initialized = useDiaryStore(s => s.initialized)
  const useFallback = useDiaryStore(s => s.useFallback)
  const error = useDiaryStore(s => s.error)
  const init = useDiaryStore(s => s.init)
  const reload = useDiaryStore(s => s.reload)

  const handleInit = useCallback(() => init(), [init])
  const handleReload = useCallback(() => reload(), [reload])

  return {
    diaries,
    loading,
    initialized,
    isEmpty: initialized && !loading && diaries.length === 0,
    useFallback,
    error,
    init: handleInit,
    reload: handleReload,
  }
}
