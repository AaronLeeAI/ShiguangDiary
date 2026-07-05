/**
 * Insights Engine 纯函数单测
 *
 * 覆盖 streak/summary/trend 关键边界:
 *  - 今日有日记 / 今日无但昨日有(当前连续断) / 全空
 *  - 跨月连续段 longest 取最大
 *  - 本月/本年计数、平均字数
 *  - 月趋势 7 根 / 年趋势 7 根 / 全空 max=0
 *
 * 用相对路径 import(纯函数,仅 type-only 依赖 @types,运行时无别名解析)。
 */

import { it, expect, describe } from '@jest/globals'

import {
  countWords,
  computeStreak,
  computeSummary,
  computeTrend,
} from '../../../src/features/statistics/utils/insightsEngine'
import type { Diary } from '../../../src/types/models'
import { TREND_BUCKETS } from '../../../src/features/statistics/types'

/** 构造 Diary(只填统计相关字段)。 */
const makeDiary = (createdAt: number, content = '内容'): Diary => ({
  id: `d-${createdAt}`,
  notebookId: 'nb-1',
  title: '',
  summary: content.slice(0, 80),
  content,
  cover: null,
  weather: null,
  location: null,
  mood: null,
  day: '01',
  monthYear: '1月·一',
  timestamp: '00:00',
  isPinned: false,
  isEncrypted: false,
  isDraft: false,
  createdAt,
  updatedAt: createdAt,
  deletedAt: null,
})

const DAY = 86_400_000

describe('countWords', () => {
  it('去除空白后字符数', () => {
    expect(countWords('')).toBe(0)
    expect(countWords('hello world')).toBe(10)
    expect(countWords('今 天 天 气 真 好')).toBe(6)
    expect(countWords('\n  a b\tc  ')).toBe(3)
  })
})

describe('computeStreak', () => {
  it('全空 → 0/0', () => {
    const now = Date.now()
    expect(computeStreak([], now)).toEqual({ currentStreak: 0, longestStreak: 0 })
  })

  it('今日有日记 → currentStreak=1', () => {
    const now = Date.now()
    const diaries = [makeDiary(now)]
    expect(computeStreak(diaries, now)).toEqual({ currentStreak: 1, longestStreak: 1 })
  })

  it('今日无、昨日有 → 当前连续断(0),最长保留 1', () => {
    const now = Date.now()
    const diaries = [makeDiary(now - DAY)]
    const r = computeStreak(diaries, now)
    expect(r.currentStreak).toBe(0)
    expect(r.longestStreak).toBe(1)
  })

  it('连续 3 天(含今日) → currentStreak=3, longestStreak=3', () => {
    const now = Date.now()
    const diaries = [makeDiary(now - 2 * DAY), makeDiary(now - 1 * DAY), makeDiary(now)]
    const r = computeStreak(diaries, now)
    expect(r.currentStreak).toBe(3)
    expect(r.longestStreak).toBe(3)
  })

  it('历史存在更长的连续段 → longestStreak 取历史最大', () => {
    const now = Date.now()
    // 历史段:5 天连续(今日起 10 天前);今日又连续 2 天。
    const segStart = now - 10 * DAY
    const historySeg = [0, 1, 2, 3, 4].map(off => makeDiary(segStart + off * DAY))
    const recent = [makeDiary(now - DAY), makeDiary(now)]
    const diaries = [...historySeg, ...recent]
    const r = computeStreak(diaries, now)
    expect(r.currentStreak).toBe(2)
    expect(r.longestStreak).toBe(5)
  })

  it('跳过 deletedAt 不为空的日记', () => {
    const now = Date.now()
    const removed = makeDiary(now)
    removed.deletedAt = now
    const r = computeStreak([removed], now)
    expect(r).toEqual({ currentStreak: 0, longestStreak: 0 })
  })

  it('同日多条只计 1 个连续日', () => {
    const now = Date.now()
    const diaries = [makeDiary(now), makeDiary(now), makeDiary(now - DAY)]
    const r = computeStreak(diaries, now)
    expect(r.currentStreak).toBe(2)
  })
})

describe('computeSummary', () => {
  it('空数据 → 全 0/null', () => {
    const now = Date.now()
    const s = computeSummary([], now)
    expect(s.totalDiaries).toBe(0)
    expect(s.totalWords).toBe(0)
    expect(s.currentStreak).toBe(0)
    expect(s.firstDiaryAt).toBeNull()
    expect(s.lastDiaryAt).toBeNull()
    expect(s.avgWordsPerDiary).toBe(0)
  })

  it('本月本年计数 / 总字数 / 平均', () => {
    const now = Date.now()
    const thisYear = new Date(now).getFullYear()
    const thisMonth = new Date(now).getMonth()
    const inMonth = makeDiary(new Date(thisYear, thisMonth, 15, 10).getTime(), 'abc') // 3 字
    const inYearOtherMonth = makeDiary(
      new Date(thisYear, (thisMonth + 6) % 12, 1, 10).getTime(),
      'de',
    ) // 2 字
    const lastYear = makeDiary(new Date(thisYear - 1, 5, 1, 10).getTime(), 'fghij') // 5 字(计入 total/avg,不计入 year)
    const diaries = [inMonth, inYearOtherMonth, lastYear]
    const s = computeSummary(diaries, now)
    expect(s.totalDiaries).toBe(3)
    expect(s.totalWords).toBe(3 + 2 + 5)
    expect(s.avgWordsPerDiary).toBe(Math.round(10 / 3))
    expect(s.yearCount).toBe(2)
    expect(s.yearWords).toBe(3 + 2)
    expect(s.monthCount).toBe(1)
    expect(s.monthWords).toBe(3)
  })

  it('首尾时间戳正确', () => {
    const now = Date.now()
    const t1 = now - 5 * DAY
    const t2 = now - DAY
    const t3 = now
    const s = computeSummary([makeDiary(t2), makeDiary(t1), makeDiary(t3)], now)
    expect(s.firstDiaryAt).toBe(t1)
    expect(s.lastDiaryAt).toBe(t3)
  })
})

describe('computeTrend', () => {
  it('month 范围 → 7 根,unit=day', () => {
    const now = Date.now()
    const t = computeTrend([], 'month', now)
    expect(t.points).toHaveLength(TREND_BUCKETS)
    expect(t.unit).toBe('day')
    expect(t.max).toBe(0)
  })

  it('month 范围今日有 2 条 → 最右一根 value=2 且为 max', () => {
    const now = Date.now()
    const diaries = [makeDiary(now), makeDiary(now), makeDiary(now - DAY)]
    const t = computeTrend(diaries, 'month', now)
    expect(t.points).toHaveLength(TREND_BUCKETS)
    const last = t.points[t.points.length - 1]
    expect(last.value).toBe(2)
    expect(t.max).toBe(2)
  })

  it('year 范围 → 7 根,unit=month,本月为最右', () => {
    const now = Date.now()
    const t = computeTrend([makeDiary(now)], 'year', now)
    expect(t.points).toHaveLength(TREND_BUCKETS)
    expect(t.unit).toBe('month')
    expect(t.points[t.points.length - 1].value).toBe(1)
    expect(t.max).toBe(1)
  })

  it('all 范围与 year 同为按月', () => {
    const now = Date.now()
    const t = computeTrend([makeDiary(now)], 'all', now)
    expect(t.unit).toBe('month')
    expect(t.points).toHaveLength(TREND_BUCKETS)
  })

  it('空数据 → max=0(全平直柱)', () => {
    const now = Date.now()
    const t = computeTrend([], 'year', now)
    expect(t.max).toBe(0)
    expect(t.points.every(p => p.value === 0)).toBe(true)
  })
})
