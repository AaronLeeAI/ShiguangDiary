/**
 * Calendar Feature - 类型定义
 *
 * 日历 browse 语义:周/月/年三态浏览 + 日期标记 + 选中定位。
 * Calendar 只持日期状态,不持 Diary 内容(Diary 经 diaryStore)。
 *
 * 数据流:HomeScreen → useCalendar → calendarStore(日期态)
 *                                  └→ calendarService(纯派生于 diaryStore.diaries)
 */

/** 日历浏览形态(对应设计稿三态)。 */
export type CalendarMode = 'week' | 'month' | 'year'

/** 月份网格单元(月视图一格)。 */
export interface CalendarDay {
  /** 日期键 YYYY-MM-DD(同月非本月日期也带真实键,便于跨月点击)。 */
  key: string
  /** 公历年。 */
  year: number
  /** 公历月 1-12。 */
  month: number
  /** 公历日 1-31。 */
  day: number
  /** 是否属于当前展示月(月首尾补格则为 false)。 */
  inCurrentMonth: boolean
  /** 是否今日(基于 todayKey 计算)。 */
  isToday: boolean
  /** 是否被选中(基于 selectedKey 计算)。 */
  isSelected: boolean
  /** 该日期是否有日记(基于 markers 计算)。 */
  hasDiary: boolean
}

/** 月份网格(6 行 × 7 列的标准月视图)。 */
export interface MonthMatrix {
  year: number
  month: number
  weeks: CalendarDay[][]
}

/** 周视图的 7 天。 */
export interface WeekRow {
  days: CalendarDay[]
}

/** 有日记的日期集合(按月 / 按年)。 */
export interface CalendarMarkers {
  /** 月视图:YYYY-MM-DD → true 的集合。 */
  monthDays: Set<string>
  /** 年视图:YYYY-MM → true 的集合(该月是否有任意日记)。 */
  yearMonths: Set<string>
}

/** Calendar Store 运行时态(不持久化,纯浏览状态)。 */
export interface CalendarState {
  mode: CalendarMode
  currentYear: number
  currentMonth: number
  /** 选中日期键 YYYY-MM-DD;null = 未选(首页显示全部)。 */
  selectedKey: string | null
  /** 今日日期键(进入 store 时固化,避免渲染中漂移)。 */
  todayKey: string
}

export interface CalendarActions {
  setMode: (mode: CalendarMode) => void
  /** 切换月份(±1);跨年自动进位。 */
  changeMonth: (delta: number) => void
  /** 回到今天(年/月/选中日均归位今日)。 */
  goToday: () => void
  /** 选中某日;null 清除选择。 */
  selectDate: (key: string | null) => void
  /** 年视图选中某月 → 进入该月月视图。 */
  selectMonth: (year: number, month: number) => void
  /** 重置为入口态(周视图 + 当月 + 清除选择)。 */
  reset: () => void
}

export type CalendarStore = CalendarState & CalendarActions
