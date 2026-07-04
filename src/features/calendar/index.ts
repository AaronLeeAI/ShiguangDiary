/**
 * Calendar Feature - 公共导出
 *
 * Timeline Engine + 三态日历组件,嵌入首页驱动日期浏览。
 * 不新增路由/Tab;Calendar 是首页内嵌组件(遵设计稿 P002)。
 */

export { useCalendar } from './hooks/useCalendar'
export type { UseCalendarResult } from './hooks/useCalendar'

export { Calendar } from './components/Calendar'
export type { CalendarProps } from './components/Calendar'

export { useCalendarStore as calendarStore } from './store/calendarStore'
export { calendarService } from './services/calendarService'

export type { CalendarMode, CalendarDay, MonthMatrix, WeekRow, CalendarMarkers } from './types'
