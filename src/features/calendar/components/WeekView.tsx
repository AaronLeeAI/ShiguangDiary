/**
 * WeekView - 周视图(7 天单行)
 *
 * 设计稿 P002 默认形态。点击单元 → 选中并切到月视图(由 selectDate 自动切)。
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'

import { spacing } from '@theme'
import type { WeekRow, CalendarDay } from '../types'
import { CalendarCell } from './CalendarCell'
import { WeekdayHeader } from './WeekdayHeader'

export interface WeekViewProps {
  week: WeekRow
  weekdayLabels: readonly string[]
  onSelectDate: (day: CalendarDay) => void
}

export const WeekView: React.FC<WeekViewProps> = ({ week, weekdayLabels, onSelectDate }) => (
  <View style={styles.container}>
    <WeekdayHeader labels={weekdayLabels} />
    <View style={styles.row}>
      {week.days.map(d => (
        <CalendarCell key={d.key} day={d} onPress={onSelectDate} size="week" />
      ))}
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    height: 76,
  },
})

export default WeekView
