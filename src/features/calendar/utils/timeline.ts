/**
 * Timeline Engine - 日期索引纯函数
 *
 * 页面/组件不得直接做日期计算,统一经本模块。
 * 全部纯函数,可单测;不依赖任何 IO。
 *
 * 日期键约定:YYYY-MM-DD(由毫秒时间戳派生)。
 * 网格首列为周一(对齐设计稿 P002 表头:一/二/三/四/五/六/日)。
 */

import type { CalendarDay, MonthMatrix, WeekRow } from '../types'

/** Date.now() 等效入口(供 store 固化 today 用,避免渲染中漂移)。 */
export const nowKey = (): string => toDateKey(Date.now())

/** 毫秒时间戳 → YYYY-MM-DD。 */
export function toDateKey(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** {year,month,day} → YYYY-MM-DD。 */
export function toDateKeyFromParts(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

/** YYYY-MM-DD → {year,month,day}。 */
export function parseKey(key: string): { year: number; month: number; day: number } {
  const [y, m, d] = key.split('-').map(Number)
  return { year: y, month: m, day: d }
}

/** JS getDay() (周日=0..周六=6) → 周一首列索引 (0..6)。 */
const weekdayToMonFirst = (jsDay: number): number => (jsDay + 6) % 7

/** 该月 1 号是周几(0=周一..6=周日)。 */
const firstWeekdayMonFirst = (year: number, month: number): number =>
  weekdayToMonFirst(new Date(year, month - 1, 1).getDay())

/** 月份天数(支持闰年)。 */
export const daysInMonth = (year: number, month: number): number =>
  new Date(year, month, 0).getDate()

/** 月份标题:设计稿 "5月12日"(月) / "2026"(年)。 */
export function formatTitle(year: number, month: number, mode: 'week' | 'month' | 'year'): string {
  if (mode === 'year') return `${year}`
  return `${month}月`
}

/** 周一-周日 表头文案。 */
export const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'] as const

/**
 * 构建月视图网格:6 行 × 7 列,首尾补上下月日期(便于跨月点击)。
 * 每个 cell 带 hasDiary/isSelected/isToday 之外的语义需调用方注入。
 * 此处只算日期骨架;标记/选中/今日在 computeMonthMatrix 中注入。
 */
function buildMonthSkeleton(year: number, month: number): CalendarDay[] {
  const total = firstWeekdayMonFirst(year, month)
  const dim = daysInMonth(year, month)
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const prevDim = daysInMonth(prevYear, prevMonth)

  const cells: CalendarDay[] = []
  for (let i = total - 1; i >= 0; i--) {
    const day = prevDim - i
    cells.push(makeCell(prevYear, prevMonth, day, false))
  }
  for (let day = 1; day <= dim; day++) {
    cells.push(makeCell(year, month, day, true))
  }
  let next = 1
  while (cells.length % 7 !== 0) {
    cells.push(makeCell(nextYear, nextMonth, next, false))
    next++
  }
  // 设计稿月视图标准 6 行(42 格);不足补足下月。
  while (cells.length < 42) {
    cells.push(makeCell(nextYear, nextMonth, next, false))
    next++
  }
  return cells
}

const makeCell = (
  year: number,
  month: number,
  day: number,
  inCurrentMonth: boolean,
): CalendarDay => ({
  key: toDateKeyFromParts(year, month, day),
  year,
  month,
  day,
  inCurrentMonth,
  isToday: false,
  isSelected: false,
  hasDiary: false,
})

/**
 * 月视图网格(含标记/选中/今日注入)。
 * calendarService 之外的纯函数,便于单测与缓存。
 */
export function computeMonthMatrix(
  year: number,
  month: number,
  markers: Set<string>,
  selectedKey: string | null,
  todayKey: string,
): MonthMatrix {
  const cells = buildMonthSkeleton(year, month).map(c => ({
    ...c,
    isToday: c.key === todayKey,
    isSelected: selectedKey !== null && c.key === selectedKey,
    hasDiary: markers.has(c.key),
  }))
  const weeks: CalendarDay[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return { year, month, weeks }
}

/**
 * 周视图:从 todayKey(或 selectedKey)所在周构造 7 天。
 * 返回该周(周一-周日)的 cell,不补非本月标记(周视图跨月时仍显示真实日期)。
 */
export function computeWeekRow(
  anchorKey: string,
  markers: Set<string>,
  selectedKey: string | null,
  todayKey: string,
): WeekRow {
  const { year, month, day } = parseKey(anchorKey)
  const anchor = new Date(year, month - 1, day)
  const startOffset = weekdayToMonFirst(anchor.getDay())
  const start = new Date(year, month - 1, day - startOffset)
  const days: CalendarDay[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    const key = toDateKey(d.getTime())
    days.push({
      key,
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      inCurrentMonth: d.getMonth() + 1 === month,
      isToday: key === todayKey,
      isSelected: selectedKey !== null && key === selectedKey,
      hasDiary: markers.has(key),
    })
  }
  return { days }
}

/** 月份键 YYYY-MM(年视图缩略 + yearMarkers 索引)。 */
export function toMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

/**
 * 年视图:12 个月缩略网格数据(3 行 × 4 列)。
 * 每月返回 {year,month,hasDiary:该月是否有任意日记}。
 */
export function computeYearMonths(
  year: number,
  yearMonths: Set<string>,
): Array<{
  year: number
  month: number
  hasDiary: boolean
}> {
  const out: Array<{ year: number; month: number; hasDiary: boolean }> = []
  for (let m = 1; m <= 12; m++) {
    out.push({ year, month: m, hasDiary: yearMonths.has(toMonthKey(year, m)) })
  }
  return out
}

/** 跨年切换月份(±1 会跨年)。 */
export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const zero = year * 12 + (month - 1) + delta
  return { year: Math.floor(zero / 12), month: (zero % 12) + 1 }
}
