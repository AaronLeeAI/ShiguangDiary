/**
 * Statistics Feature - 类型定义
 *
 * 数据统计与 Insights Engine 的视图模型类型。
 * Statistics 只持运行时态(时间范围/状态/错误),不持 Diary 内容,
 * 也不持久化派生结果(派生于 diaryStore.diaries,见 DECISIONS 033)。
 *
 * 数据流:StatisticsScreen → useStatistics → statisticsStore(态)
 *                                            └→ diaryStore(数据,经 statisticsService/insightsEngine 派生)
 */

/** 趋势时间范围。月=最近若干天,年/全部=最近若干月。 */
export type StatisticsRange = 'month' | 'year' | 'all'

/** 统计计算状态。 */
export type StatisticsStatus = 'idle' | 'loading' | 'done' | 'error'

/** 趋势柱单元。 */
export interface TrendPoint {
  /** 日期键(YYYY-MM-DD 或 YYYY-MM),用于唯一标识/调试。 */
  key: string
  /** 展示文案(如 "7/3"、"7月")。 */
  label: string
  /** 该时间桶内日记数。 */
  value: number
}

/** 趋势数据(自绘柱状图消费)。 */
export interface TrendData {
  points: TrendPoint[]
  /** 出现过的最大 value(用于柱高归一;0 表示全空,UI 兜底)。 */
  max: number
  /** 时间桶粒度(影响轴文案)。 */
  unit: 'day' | 'month'
}

/** 汇总指标(顶部卡片网格)。 */
export interface SummaryMetrics {
  /** 总日记数(未删除)。 */
  totalDiaries: number
  /** 总字数(content 去空白字符数累加)。 */
  totalWords: number
  /** 当前连续记录天数(今日或最近有日记日起,向前连续未缺的天数)。 */
  currentStreak: number
  /** 历史最长连续记录天数。 */
  longestStreak: number
  /** 本月日记数。 */
  monthCount: number
  /** 本月总字数。 */
  monthWords: number
  /** 本年日记数。 */
  yearCount: number
  /** 本年总字数。 */
  yearWords: number
  /** 平均每条字数(空时 0)。 */
  avgWordsPerDiary: number
  /** 首条日记时间戳(空数据时 null)。 */
  firstDiaryAt: number | null
  /** 最近日记时间戳(空数据时 null)。 */
  lastDiaryAt: number | null
}

/** Insights Engine 单次产物。 */
export interface InsightsResult {
  summary: SummaryMetrics
  trend: TrendData
  /** 生成时刻(ms),用于调试与"刷新"语义。 */
  generatedAt: number
}

/** Statistics Store 运行时态(不持久化,纯计算触发态)。 */
export interface StatisticsState {
  range: StatisticsRange
  status: StatisticsStatus
  error: string | null
  /** 最近一次刷新时刻(ms);null=从未计算。 */
  lastGeneratedAt: number | null
}

export interface StatisticsActions {
  /** 切换时间范围(会触发 hook 重算)。 */
  setRange: (range: StatisticsRange) => void
  /** 强制重算(用户下拉/点击重试)。 */
  refresh: () => void
  /** 退出页重置(保留 range,清错误)。 */
  reset: () => void
  /** 内部:派生计算完成后回写状态。 */
  markDone: () => void
  markError: (message: string) => void
}

export type StatisticsStore = StatisticsState & StatisticsActions

/** 趋势条数(自绘图宽度友好)。 */
export const TREND_BUCKETS = 7
