/**
 * Statistics Feature - 公共导出
 *
 * 统计纯派生范式(DECISIONS 033):statisticsService/insightsEngine 以 diaryStore.diaries
 * 为入参,零 DB 查询,与 calendarService/searchService 同范式。
 */

export { useStatistics } from './hooks/useStatistics'
export type { UseStatisticsResult } from './hooks/useStatistics'

export { useStatisticsStore as statisticsStore } from './store/statisticsStore'
export { statisticsService } from './services/statisticsService'

export { SummaryCard } from './components/SummaryCard'
export type { SummaryCardProps } from './components/SummaryCard'
export { StatisticsCard } from './components/StatisticsCard'
export type { StatisticsCardProps } from './components/StatisticsCard'
export { TrendChart } from './components/TrendChart'
export type { TrendChartProps } from './components/TrendChart'
export { RangeSelector } from './components/RangeSelector'
export type { RangeSelectorProps } from './components/RangeSelector'

export { TREND_BUCKETS } from './types'
export type {
  StatisticsRange,
  StatisticsStatus,
  SummaryMetrics,
  TrendPoint,
  TrendData,
  InsightsResult,
  StatisticsState,
  StatisticsActions,
  StatisticsStore,
} from './types'
