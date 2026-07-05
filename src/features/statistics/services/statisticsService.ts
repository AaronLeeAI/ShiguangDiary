/**
 * Statistics Service - 统计派生聚合
 *
 * 纯函数聚合,以 diaryStore 已缓存的 diaries 为入参派生统计/趋势,
 * **不直接访问 Repository/DAO/SQLite**(经 diaryStore 已有全量缓存),
 * **不注册全局 registry**(非跨 feature 服务,与 calendarService/searchService 同范式,DECISIONS 033)。
 *
 * 调用方:useStatistics hook。页面不得直接做统计计算,统一经本 service → insightsEngine。
 *
 * 数据流:useStatistics → statisticsService → insightsEngine(纯函数)
 */

import type { Diary } from '@types'
import type { InsightsResult, StatisticsRange, SummaryMetrics, TrendData } from '../types'
import {
  computeSummary,
  computeTrend,
  computeStreak,
  generateInsights,
  type StreakResult,
} from '../utils/insightsEngine'

/**
 * 一次性派生全部 Insights(summary + trend)。
 * 随 diaries/range 变化重算(O(n) over diaries,日记量级下足够快)。
 */
export function generateStatistics(
  diaries: Diary[],
  range: StatisticsRange,
  nowTs: number,
): InsightsResult {
  return generateInsights(diaries, range, nowTs)
}

/** 仅汇总指标(顶部卡片)。 */
export function getSummary(diaries: Diary[], nowTs: number): SummaryMetrics {
  return computeSummary(diaries, nowTs)
}

/** 仅趋势(自绘柱状图)。 */
export function getTrend(diaries: Diary[], range: StatisticsRange, nowTs: number): TrendData {
  return computeTrend(diaries, range, nowTs)
}

/** 仅连续记录(便于调试/独立调用)。 */
export function getStreak(diaries: Diary[], nowTs: number): StreakResult {
  return computeStreak(diaries, nowTs)
}

/** 聚合导出(便于依赖注入 / 测试替换)。 */
export const statisticsService = {
  generateStatistics,
  getSummary,
  getTrend,
  getStreak,
}
