/**
 * Statistics Store - 统计运行时态
 *
 * 仅持时间范围与计算状态;**不持久化**(浏览态无续航需求);
 * **不持派生结果**(summary/trend 由 useStatistics 经 statisticsService 派生,
 * 避免与 diaries 缓存分裂——DECISIONS 033,同 search results 范式)。
 *
 * 数据流:useStatistics → statisticsStore(范围/态) + diaryStore(数据,经 statisticsService 派生)
 */

import { create } from 'zustand'

import type { StatisticsRange, StatisticsStore } from '../types'

export const useStatisticsStore = create<StatisticsStore>(set => ({
  range: 'month',
  status: 'idle',
  error: null,
  lastGeneratedAt: null,

  setRange: range => {
    // 切换范围 → 标记重新派生。
    set({ range, status: 'loading', error: null })
  },

  refresh: () => set({ status: 'loading', error: null }),

  reset: () =>
    set({
      // 保留 range(用户偏好不应因返回清空),清错误与正在计算态。
      status: 'idle',
      error: null,
    }),

  markDone: () => set({ status: 'done', error: null, lastGeneratedAt: Date.now() }),

  markError: (message: string) => set({ status: 'error', error: message }),
}))

export default useStatisticsStore

/** 便于非 hook 调用方(测试)取当前 range。 */
export const getRange = (): StatisticsRange => useStatisticsStore.getState().range
