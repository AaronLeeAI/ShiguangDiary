/**
 * Calendar Service - 日历日期派生
 *
 * 纯函数,以 diaryStore 已缓存的 diaries 为入参派生日期索引,
 * **不直接访问 Repository/DAO/SQLite**(经 diaryStore 已有的全量缓存)。
 * 满足 Task11"避免重复查询整个月份"——零新增 DB 查询。
 *
 * 调用方:useCalendar hook,不注册到全局 registry(非跨 feature 服务)。
 */

import type { Diary } from '@types'
import { toMonthKey, toDateKey } from '../utils/timeline'
import type { CalendarMarkers } from '../types'

/**
 * 计算月份标记:该月有日记的日期键集合(YYYY-MM-DD)。
 * 全量 diaries 过滤到该年该月,O(n)。
 */
export function getMonthMarkers(diaries: Diary[], year: number, month: number): Set<string> {
  const out = new Set<string>()
  for (const d of diaries) {
    if (d.deletedAt !== null) {
      continue
    }
    const created = new Date(d.createdAt)
    if (created.getFullYear() === year && created.getMonth() + 1 === month) {
      out.add(toDateKey(d.createdAt))
    }
  }
  return out
}

/**
 * 计算年视图标记:该年哪些月份有日记(YYYY-MM 集合)。
 */
export function getYearMarkers(diaries: Diary[], year: number): Set<string> {
  const out = new Set<string>()
  for (const d of diaries) {
    if (d.deletedAt !== null) {
      continue
    }
    const created = new Date(d.createdAt)
    if (created.getFullYear() === year) {
      out.add(toMonthKey(year, created.getMonth() + 1))
    }
  }
  return out
}

/**
 * 一次性算全 markers(月+年),供 useCalendar 在 diaries 变更时重算并缓存。
 * 年/月都按当前 store 的 currentYear/currentMonth。
 */
export function computeMarkers(diaries: Diary[], year: number, month: number): CalendarMarkers {
  return {
    monthDays: getMonthMarkers(diaries, year, month),
    yearMonths: getYearMarkers(diaries, year),
  }
}

/**
 * 全量日期键集合(供周视图跨月标记,避免月 marker 跨月缺失)。
 * O(n) over diaries;随 diaries 变化重算。
 */
export function getAllDateKeys(diaries: Diary[]): Set<string> {
  const out = new Set<string>()
  for (const d of diaries) {
    if (d.deletedAt !== null) {
      continue
    }
    out.add(toDateKey(d.createdAt))
  }
  return out
}

/**
 * 选中日期的日记列表(按 createdAt 降序,与 diaryStore 既有排序一致)。
 * diaryStore.diaries 已是降序,这里保持原相对顺序返回。
 */
export function filterByDate(diaries: Diary[], key: string): Diary[] {
  return diaries.filter(d => {
    if (d.deletedAt !== null) {
      return false
    }
    return toDateKey(d.createdAt) === key
  })
}

/**
 * 回收"日期不存在"语义:选中日期在 diaries 中是否有任意日记。
 */
export function dateHasDiary(diaries: Diary[], key: string): boolean {
  return diaries.some(d => d.deletedAt === null && toDateKey(d.createdAt) === key)
}

/** 聚合导出(便于依赖注入 / 测试替换)。 */
export const calendarService = {
  getMonthMarkers,
  getYearMarkers,
  computeMarkers,
  getAllDateKeys,
  filterByDate,
  dateHasDiary,
}
