/**
 * Calendar - 三态日历顶层容器
 *
 * 受控组件:接收 useCalendar() 返回的视图模型,按 mode 分发到对应子视图。
 * 纯展示,不直接订阅 store——状态由 useCalendar 编排。
 *
 * 数据流外层:HomeScreen → useCalendar() → <Calendar cal={cal} />
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'

import { colors, spacing } from '@theme'
import type { UseCalendarResult } from '../hooks/useCalendar'
import { MonthHeader } from './MonthHeader'
import { WeekView } from './WeekView'
import { CalendarGrid } from './CalendarGrid'
import { YearView } from './YearView'
import { parseKey } from '../utils/timeline'

export interface CalendarProps {
  cal: UseCalendarResult
}

export const Calendar: React.FC<CalendarProps> = ({ cal: c }) => {
  const content =
    c.mode === 'week' ? (
      <WeekView
        week={c.week}
        weekdayLabels={c.weekdayLabels}
        onSelectDate={d => c.selectDate(d.key)}
      />
    ) : c.mode === 'month' ? (
      <CalendarGrid
        matrix={c.monthMatrix}
        weekdayLabels={c.weekdayLabels}
        onSelectDate={d => c.selectDate(d.key)}
      />
    ) : (
      <YearView
        year={c.currentYear}
        yearMonths={c.yearMonths}
        todayMonth={parseKey(c.todayKey).month}
        onSelectMonth={c.selectMonth}
      />
    )

  return (
    <View style={styles.container}>
      <MonthHeader
        title={c.title}
        mode={c.mode}
        onPrev={c.prev}
        onNext={c.next}
        onToday={c.goToday}
        onToggleMode={c.toggleMode}
      />
      {content}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.semantic.bg.canvas,
    paddingVertical: spacing.xs,
  },
})

export default Calendar
