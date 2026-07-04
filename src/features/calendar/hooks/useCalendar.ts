/**
 * useCalendar - 日历视图模型 Hook
 *
 * 订阅 calendarStore(日期浏览态)+ diaryStore(日记数据),
 * 经 calendarService 派生月网格/周视图/年缩略/标记/选中日日记列表。
 *
 * HomeScreen 只消费本 hook,不直接处理日期计算、不直接读 store 内部。
 *
 * 数据流:HomeScreen → useCalendar → calendarStore +日记 diaryStore → calendarService(纯派生)
 */

import { useMemo } from 'react'

import { useDiaryStore } from '@store/diaryStore'
import type { Diary } from '@types'

import { calendarService } from '../services/calendarService'
import { useCalendarStore } from '../store/calendarStore'
import {
  computeMonthMatrix,
  computeWeekRow,
  computeYearMonths,
  formatTitle,
  WEEKDAY_LABELS,
  parseKey,
} from '../utils/timeline'
import type { MonthMatrix, WeekRow } from '../types'

export interface UseCalendarResult {
  mode: ReturnType<typeof useCalendarStore.getState>['mode']
  currentYear: number
  currentMonth: number
  selectedKey: string | null
  todayKey: string
  /** 周视图 7 天(首尾真实日期,跨月不补非本月标记)。 */
  week: WeekRow
  /** 月视图网格(6×7,含标记/选中/今日)。 */
  monthMatrix: MonthMatrix
  /** 年视图 12 个月缩略(3×4 用)。 */
  yearMonths: Array<{ year: number; month: number; hasDiary: boolean }>
  /** 标题文案(随 mode)。 */
  title: string
  /** 周一-周日 表头文案。 */
  weekdayLabels: readonly string[]
  /** 选中日期的日记列表(降序);未选 → null 表示"显示全部"语义。 */
  selectedDiaries: Diary[] | null
  /** 选中日期是否有日记。 */
  hasSelectedDiaries: boolean
  /** 当前月有日记的日期集合(便于调试/UI 提示)。 */
  monthMarkers: Set<string>

  setMode: (m: 'week' | 'month' | 'year') => void
  /** 上一周期:month/week 切上一月,year 切上一年。 */
  prev: () => void
  /** 下一周期:month/week 切下一月,year 切下一年。 */
  next: () => void
  prevMonth: () => void
  nextMonth: () => void
  goToday: () => void
  /** 选中某日(传 key);null 清除。 */
  selectDate: (key: string | null) => void
  /** 年视图选月 → 进该月。 */
  selectMonth: (year: number, month: number) => void
  /** 周→展开月 / 月→点月份进年 / 年→月。 */
  toggleMode: () => void
  reset: () => void
}

export function useCalendar(): UseCalendarResult {
  const mode = useCalendarStore(s => s.mode)
  const currentYear = useCalendarStore(s => s.currentYear)
  const currentMonth = useCalendarStore(s => s.currentMonth)
  const selectedKey = useCalendarStore(s => s.selectedKey)
  const todayKey = useCalendarStore(s => s.todayKey)
  const setMode = useCalendarStore(s => s.setMode)
  const changeMonth = useCalendarStore(s => s.changeMonth)
  const goToday = useCalendarStore(s => s.goToday)
  const selectDateRaw = useCalendarStore(s => s.selectDate)
  const selectMonthRaw = useCalendarStore(s => s.selectMonth)
  const reset = useCalendarStore(s => s.reset)

  const diaries = useDiaryStore(s => s.diaries)

  // 月+年标记(随 diaries / 年 / 月 变化重算;O(n),日记量级下足够快)。
  const markers = useMemo(
    () => calendarService.computeMarkers(diaries, currentYear, currentMonth),
    [diaries, currentYear, currentMonth],
  )

  // 全量日期键(周视图跨月时仍能正确标"记")。
  const allDateKeys = useMemo(() => calendarService.getAllDateKeys(diaries), [diaries])

  // 周视图锚点:优先选中日,否则今日(今日不在当前月时仍以今日为锚)。
  const weekAnchor = selectedKey ?? todayKey

  const week = useMemo(
    () => computeWeekRow(weekAnchor, allDateKeys, selectedKey, todayKey),
    [weekAnchor, allDateKeys, selectedKey, todayKey],
  )

  const monthMatrix = useMemo(
    () => computeMonthMatrix(currentYear, currentMonth, markers.monthDays, selectedKey, todayKey),
    [currentYear, currentMonth, markers, selectedKey, todayKey],
  )

  const yearMonths = useMemo(
    () => computeYearMonths(currentYear, markers.yearMonths),
    [currentYear, markers],
  )

  const title = formatTitle(currentYear, currentMonth, mode)

  // 选中日的日记;未选 → null(首页显示全部)。
  const selectedDiaries = useMemo<Diary[] | null>(() => {
    if (selectedKey === null) {
      return null
    }
    return calendarService.filterByDate(diaries, selectedKey)
  }, [diaries, selectedKey])

  const hasSelectedDiaries = selectedDiaries !== null && selectedDiaries.length > 0

  const toggleMode = () => {
    setMode(mode === 'week' ? 'month' : mode === 'month' ? 'year' : 'week')
  }

  const selectDate = (key: string | null) => {
    if (key === null) {
      selectDateRaw(null)
      return
    }
    // 选中日跨月时,自动把 currentYear/Month 对齐到选中日所在月,
    // 避免月视图与选中日不在同一月。
    const { year, month } = parseKey(key)
    if (year !== currentYear || month !== currentMonth) {
      useCalendarStore.setState({ currentYear: year, currentMonth: month })
    }
    selectDateRaw(key)
  }

  const prevMonth = () => changeMonth(-1)
  const nextMonth = () => changeMonth(1)

  const prev = () => changeMonth(mode === 'year' ? -12 : -1)
  const next = () => changeMonth(mode === 'year' ? 12 : 1)

  return {
    mode,
    currentYear,
    currentMonth,
    selectedKey,
    todayKey,
    week,
    monthMatrix,
    yearMonths,
    title,
    weekdayLabels: WEEKDAY_LABELS,
    selectedDiaries,
    hasSelectedDiaries,
    monthMarkers: markers.monthDays,
    setMode,
    prev,
    next,
    prevMonth,
    nextMonth,
    goToday,
    selectDate,
    selectMonth: selectMonthRaw,
    toggleMode,
    reset,
  }
}
