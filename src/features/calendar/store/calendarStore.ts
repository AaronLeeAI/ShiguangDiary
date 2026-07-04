/**
 * Calendar Store - 日历浏览运行时态
 *
 * 仅持日期浏览状态(模式/当前年月/选中日/今日键)。
 * **不持久化**——浏览态无续航需求;**不持 Diary 内容**——Diary 经 diaryStore。
 *
 * 数据流:useCalendar → calendarStore(日期态) + diaryStore(日记数据,经 calendarService 派生)
 */

import { create } from 'zustand'

import { nowKey, parseKey, shiftMonth } from '../utils/timeline'
import type { CalendarStore } from '../types'

const initialToday = nowKey()
const initialParsed = parseKey(initialToday)

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  mode: 'week',
  currentYear: initialParsed.year,
  currentMonth: initialParsed.month,
  selectedKey: null,
  todayKey: initialToday,

  setMode: mode => set({ mode }),

  changeMonth: delta => {
    const { currentYear, currentMonth } = get()
    const next = shiftMonth(currentYear, currentMonth, delta)
    set({ currentYear: next.year, currentMonth: next.month })
  },

  goToday: () => {
    const today = nowKey()
    const { year, month } = parseKey(today)
    set({
      mode: 'week',
      currentYear: year,
      currentMonth: month,
      selectedKey: today,
    })
  },

  selectDate: key =>
    set({
      selectedKey: key,
      // 选中日期后默认展开到月视图(对齐设计稿:周→月→点日期定位)。
      mode: key === null ? get().mode : 'month',
    }),

  /** 年视图点击某月 → 进入该月月视图。 */
  selectMonth: (year, month) => set({ mode: 'month', currentYear: year, currentMonth: month }),

  reset: () => {
    const today = nowKey()
    const { year, month } = parseKey(today)
    set({
      mode: 'week',
      currentYear: year,
      currentMonth: month,
      selectedKey: null,
      todayKey: today,
    })
  },
}))

export default useCalendarStore
