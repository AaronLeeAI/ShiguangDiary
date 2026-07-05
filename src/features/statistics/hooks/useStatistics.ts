/**
 * useStatistics - 统计视图模型 Hook
 *
 * 订阅 statisticsStore(范围/状态)+ diaryStore(日记数据),
 * 经 statisticsService 派生 InsightsResult(summary + trend)。
 *
 * StatisticsScreen 只消费本 hook,不直接做统计计算(全在 statisticsService → insightsEngine,DECISIONS 033)。
 *
 * 数据流:StatisticsScreen → useStatistics → statisticsStore(态) + diaryStore(数据) → statisticsService
 */

import { useEffect, useMemo } from 'react'

import { useDiaryStore } from '@store/diaryStore'

import { statisticsService } from '../services/statisticsService'
import { useStatisticsStore } from '../store/statisticsStore'
import type { InsightsResult, StatisticsRange, SummaryMetrics, TrendData } from '../types'

export interface UseStatisticsResult {
  /** 当前时间范围。 */
  range: StatisticsRange
  /** 计算状态。 */
  status: ReturnType<typeof useStatisticsStore.getState>['status']
  /** 错误信息(error 态)。 */
  error: string | null
  /** 最近一次刷新时刻(ms)。 */
  lastGeneratedAt: number | null
  /** 汇总指标。 */
  summary: SummaryMetrics
  /** 趋势数据。 */
  trend: TrendData
  /** 全部数据为空(diaries 为空)。 */
  isEmpty: boolean
  /** 是否使用降级 mock(diaryStore DB 失败)。 */
  isFallback: boolean
  /** diaryStore 是否仍在初始加载。 */
  loading: boolean

  setRange: (r: StatisticsRange) => void
  refresh: () => void
}

// 空态产物(避免 null,简化 UI 分支)。
const EMPTY_SUMMARY: SummaryMetrics = {
  totalDiaries: 0,
  totalWords: 0,
  currentStreak: 0,
  longestStreak: 0,
  monthCount: 0,
  monthWords: 0,
  yearCount: 0,
  yearWords: 0,
  avgWordsPerDiary: 0,
  firstDiaryAt: null,
  lastDiaryAt: null,
}
const EMPTY_TREND: TrendData = { points: [], max: 0, unit: 'day' }
const EMPTY_RESULT: InsightsResult = {
  summary: EMPTY_SUMMARY,
  trend: EMPTY_TREND,
  generatedAt: 0,
}

export function useStatistics(): UseStatisticsResult {
  const range = useStatisticsStore(s => s.range)
  const status = useStatisticsStore(s => s.status)
  const error = useStatisticsStore(s => s.error)
  const lastGeneratedAt = useStatisticsStore(s => s.lastGeneratedAt)
  const setRange = useStatisticsStore(s => s.setRange)
  const refreshStore = useStatisticsStore(s => s.refresh)
  const markDone = useStatisticsStore(s => s.markDone)

  const diaries = useDiaryStore(s => s.diaries)
  const isFallback = useDiaryStore(s => s.useFallback)
  const loading = useDiaryStore(s => s.loading)

  const isEmpty = !loading && diaries.length === 0

  // 派生 InsightsResult:同步纯函数,随 diaries/range 变化重算。
  // 用 Date.now() 取"今日"(统计的"今日"与 calendar 不同步无碍)。
  // 纯函数边界守齐(除0/空数组均安全),不在此 setState;状态由下方 effect 转 done。
  const result = useMemo<InsightsResult>(() => {
    if (isEmpty) {
      return EMPTY_RESULT
    }
    return statisticsService.generateStatistics(diaries, range, Date.now())
  }, [diaries, range, isEmpty])

  // 状态管理:派生完成 → done(首次/切换/刷新后)。diaryStore 初始加载中不写态。
  useEffect(() => {
    if (loading) {
      return
    }
    markDone()
    // markDone 不入依赖(其余变化已由 useMemo 覆盖,此处仅转态)。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, loading])

  return {
    range,
    status,
    error,
    lastGeneratedAt,
    summary: result.summary,
    trend: result.trend,
    isEmpty,
    isFallback,
    loading,
    setRange,
    refresh: refreshStore,
  }
}
