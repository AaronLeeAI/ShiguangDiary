/**
 * Insights Engine - 统计派生纯函数
 *
 * 全纯函数,入参 `diaries: Diary[]`,零 IO,可单测。
 * 不访问 Repository/DAO/SQLite(经 diaryStore 已缓存的 diaries 派生,DECISIONS 033)。
 * 不跨 feature import calendar/timeline(避免运行时耦合);日期 helper 本地极简实现。
 *
 * 日期键约定:YYYY-MM-DD / YYYY-MM(同 calendar,但本引擎内部独立计算)。
 * 全部跳过 `deletedAt !== null` 的日记(与 calendarService 一致)。
 */

import type { Diary } from '@types'
import type {
  SummaryMetrics,
  TrendData,
  TrendPoint,
  InsightsResult,
  StatisticsRange,
} from '../types'
import { TREND_BUCKETS } from '../types'

// ========== 极简日期 helper(本地,避免跨 feature 运行时依赖) ==========

const MS_PER_DAY = 86_400_000

/** 毫秒时间戳 → YYYY-MM-DD(本地时区)。 */
const toDateKey = (ts: number): string => {
  const d = new Date(ts)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** 年月 → YYYY-MM。 */
const toMonthKey = (year: number, month: number): string =>
  `${year}-${String(month).padStart(2, '0')}`

/** 时间戳 → {year,month,day}。 */
const toYmd = (ts: number) => {
  const d = new Date(ts)
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }
}

// ========== 字数 ==========

/**
 * 字数 = content 去除所有空白(`\s`)后字符数(DECISIONS 033)。
 * 不计 title/summary(summary 派生自 content,避免重复)。
 */
export function countWords(content: string): number {
  return content.replace(/\s/g, '').length
}

// ========== 连续记录 ==========

export interface StreakResult {
  currentStreak: number
  longestStreak: number
}

/**
 * 计算连续记录天数。
 *
 * - 收集所有未删日记的日期键(YYYY-MM-DD),去重。
 * - longestStreak:把日期键排序后,扫描所有"连续相邻日(+1 天)"的段,取最长段长度。
 * - currentStreak:
 *   - 若今日有日记 → 从今日起向前回扫连续相邻日的长度。
 *   - 若今日无、但最近有日记 → 当前连续已断,currentStreck=0。
 *   - 全空 → 0。
 *
 * 相邻性用"日期键相差恰好 1 天"判定,而非简单自增(避免同日多条、跨月断点误判)。
 */
export function computeStreak(diaries: Diary[], nowTs: number): StreakResult {
  const dateKeys = new Set<string>()
  for (const d of diaries) {
    if (d.deletedAt !== null) {
      continue
    }
    dateKeys.add(toDateKey(d.createdAt))
  }
  if (dateKeys.size === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // 排序为毫秒时间戳(UTC 当地午夜),便于相邻判断。
  const sortedDays = Array.from(dateKeys)
    .map(k => {
      const [y, m, d] = k.split('-').map(Number)
      // 用当地午夜做基准避免时区偏移。
      return new Date(y, m - 1, d).getTime()
    })
    .sort((a, b) => a - b)

  // longestStreak:扫描所有连续段。
  let longest = 1
  let run = 1
  for (let i = 1; i < sortedDays.length; i++) {
    if (sortedDays[i] - sortedDays[i - 1] === MS_PER_DAY) {
      run += 1
      if (run > longest) {
        longest = run
      }
    } else {
      run = 1
    }
  }

  // currentStreak:今日有日记则从今日起回扫。
  const todayKey = toDateKey(nowTs)
  if (!dateKeys.has(todayKey)) {
    return { currentStreak: 0, longestStreak: longest }
  }
  let current = 1
  const [ty, tm, td] = todayKey.split('-').map(Number)
  let cursor = new Date(ty, tm - 1, td).getTime()
  // eslint-disable-next-line no-constant-condition
  while (true) {
    cursor -= MS_PER_DAY
    if (dateKeys.has(toDateKey(cursor))) {
      current += 1
    } else {
      break
    }
  }
  if (current > longest) {
    longest = current
  }
  return { currentStreak: current, longestStreak: longest }
}

// ========== 汇总 ==========

/**
 * 计算 SummaryMetrics。O(n) 单遍(O(n) over diaries)。
 * 本月/本年按 createdAt 的本地年月比对 nowTs 的年月。
 */
export function computeSummary(diaries: Diary[], nowTs: number): SummaryMetrics {
  const now = new Date(nowTs)
  const curYear = now.getFullYear()
  const curMonth = now.getMonth() + 1

  let totalDiaries = 0
  let totalWords = 0
  let monthCount = 0
  let monthWords = 0
  let yearCount = 0
  let yearWords = 0
  let firstAt: number | null = null
  let lastAt: number | null = null

  for (const d of diaries) {
    if (d.deletedAt !== null) {
      continue
    }
    totalDiaries += 1
    const words = countWords(d.content)
    totalWords += words

    const { year, month } = toYmd(d.createdAt)
    if (year === curYear && month === curMonth) {
      monthCount += 1
      monthWords += words
    }
    if (year === curYear) {
      yearCount += 1
      yearWords += words
    }

    if (firstAt === null || d.createdAt < firstAt) {
      firstAt = d.createdAt
    }
    if (lastAt === null || d.createdAt > lastAt) {
      lastAt = d.createdAt
    }
  }

  const { currentStreak, longestStreak } = computeStreak(diaries, nowTs)

  return {
    totalDiaries,
    totalWords,
    currentStreak,
    longestStreak,
    monthCount,
    monthWords,
    yearCount,
    yearWords,
    avgWordsPerDiary: totalDiaries === 0 ? 0 : Math.round(totalWords / totalDiaries),
    firstDiaryAt: firstAt,
    lastDiaryAt: lastAt,
  }
}

// ========== 趋势 ==========

/** 月标签 "M月"(用于年/全部趋势轴)。 */
const monthLabel = (year: number, month: number): string => `${month}月`

/** 日标签 "M/D"(用于月趋势轴)。 */
const dayLabel = (ts: number): string => {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

/**
 * 计算趋势柱数据。
 * - `month`:最近 TREND_BUCKETS 天每天的日记数(含今日,无则 0)。
 * - `year` / `all`:最近 TREND_BUCKETS 个月每月日记数。
 */
export function computeTrend(diaries: Diary[], range: StatisticsRange, nowTs: number): TrendData {
  if (range === 'month') {
    return computeDailyTrend(diaries, nowTs)
  }
  return computeMonthlyTrend(diaries, nowTs)
}

/** 按日:从今日起向前 TREND_BUCKETS 天。 */
function computeDailyTrend(diaries: Diary[], nowTs: number): TrendData {
  // 计数:YYYY-MM-DD → count
  const counts = new Map<string, number>()
  for (const d of diaries) {
    if (d.deletedAt !== null) {
      continue
    }
    const k = toDateKey(d.createdAt)
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }

  // 生成桶:今日为最右一根,向前推。
  const points: TrendPoint[] = []
  let max = 0
  // 用今日当地午夜做基准。
  const today = new Date(nowTs)
  const baseMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  for (let i = TREND_BUCKETS - 1; i >= 0; i--) {
    const ts = baseMidnight - i * MS_PER_DAY
    const k = toDateKey(ts)
    const value = counts.get(k) ?? 0
    points.push({ key: k, label: dayLabel(ts), value })
    if (value > max) {
      max = value
    }
  }
  return { points, max, unit: 'day' }
}

/** 按月:从本月起向前 TREND_BUCKETS 个月。 */
function computeMonthlyTrend(diaries: Diary[], nowTs: number): TrendData {
  const counts = new Map<string, number>()
  for (const d of diaries) {
    if (d.deletedAt !== null) {
      continue
    }
    const { year, month } = toYmd(d.createdAt)
    const k = toMonthKey(year, month)
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }

  const points: TrendPoint[] = []
  let max = 0
  const now = new Date(nowTs)
  // 本月为最右一根,向前推 buckets 步。用 zero-based 偏移计算更稳。
  const startZero = now.getFullYear() * 12 + now.getMonth() - (TREND_BUCKETS - 1)
  for (let i = 0; i < TREND_BUCKETS; i++) {
    const zero = startZero + i
    const py = Math.floor(zero / 12)
    const pm = (zero % 12) + 1
    const k = toMonthKey(py, pm)
    const value = counts.get(k) ?? 0
    points.push({ key: k, label: monthLabel(py, pm), value })
    if (value > max) {
      max = value
    }
  }
  return { points, max, unit: 'month' }
}

// ========== 组合 ==========

/** 一次性派生:summary + trend + generatedAt。 */
export function generateInsights(
  diaries: Diary[],
  range: StatisticsRange,
  nowTs: number,
): InsightsResult {
  return {
    summary: computeSummary(diaries, nowTs),
    trend: computeTrend(diaries, range, nowTs),
    generatedAt: nowTs,
  }
}
