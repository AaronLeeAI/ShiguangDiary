/**
 * CalendarGrid - 月视图网格(6 行 × 7 列)
 *
 * 渲染 MonthMatrix.weeks,本周一为首列。
 * 点击单元 → onSelectDate(day)。设计稿:点有日记日 → 定位该日;点无日记日 → 留待后续接编辑。
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'

import { spacing } from '@theme'
import type { MonthMatrix, CalendarDay } from '../types'
import { CalendarCell } from './CalendarCell'
import { WeekdayHeader } from './WeekdayHeader'

export interface CalendarGridProps {
  matrix: MonthMatrix
  weekdayLabels: readonly string[]
  onSelectDate: (day: CalendarDay) => void
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  matrix,
  weekdayLabels,
  onSelectDate,
}) => (
  <View style={styles.container}>
    <WeekdayHeader labels={weekdayLabels} />
    {matrix.weeks.map((week, i) => (
      <View key={`${matrix.year}-${matrix.month}-${i}`} style={styles.week}>
        {week.map(d => (
          <CalendarCell key={d.key} day={d} onPress={onSelectDate} size="month" />
        ))}
      </View>
    ))}
  </View>
)

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xs,
  },
  week: {
    flexDirection: 'row',
    height: 48,
  },
})

export default CalendarGrid
