/**
 * CalendarCell - 日历单元(月/周视图共用)
 *
 * 设计:今日实心绿圆白字;"记"角标黑色圆角方块;非本月灰色;
 * 选中态绿色描边圆。尺寸用 spacing/radius token,禁止硬编码。
 */

import React from 'react'
import { Pressable, View, Text, StyleSheet } from 'react-native'

import { colors, cal, spacing, radius, fontSize } from '@theme'
import type { CalendarDay } from '../types'

export interface CalendarCellProps {
  day: CalendarDay
  /** 农历/节气小字(占位,默认空——农历由后续 task 接入)。 */
  lunar?: string
  onPress?: (day: CalendarDay) => void
  /** 是否压挤态(周视图更大;月视图标准)。 */
  size?: 'month' | 'week'
}

const CELL = 44

export const CalendarCell: React.FC<CalendarCellProps> = ({
  day,
  lunar,
  onPress,
  size = 'month',
}) => {
  const dim = !day.inCurrentMonth
  const isToday = day.isToday
  const isSelected = day.isSelected

  const numberColor = isToday ? colors.semantic.text.inverse : dim ? cal.solarDim : cal.solar

  const circleBg = isToday ? colors.brand.primary : 'transparent'
  const borderColor = isSelected && !isToday ? colors.brand.primary : 'transparent'

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${day.year}-${day.month}-${day.day}${day.hasDiary ? ' 有日记' : ''}`}
      onPress={() => onPress?.(day)}
      style={[styles.cell, { height: size === 'week' ? CELL + spacing.huge : CELL }]}
    >
      <View
        style={[
          styles.circle,
          {
            backgroundColor: circleBg,
            borderColor,
            borderWidth: isSelected && !isToday ? 1.5 : 0,
            borderRadius: radius.full,
          },
        ]}
      >
        <Text
          style={[
            styles.number,
            { fontSize: fontSize.titleM, color: numberColor, fontWeight: isToday ? '600' : '500' },
          ]}
        >
          {day.day}
        </Text>
      </View>
      {day.hasDiary ? <View style={styles.marker} /> : null}
      {lunar ? (
        <Text style={styles.lunar} numberOfLines={1}>
          {lunar}
        </Text>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing.xs,
  },
  circle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    includeFontPadding: false,
  },
  marker: {
    position: 'absolute',
    top: spacing.xxs,
    right: '38%',
    width: 6,
    height: 6,
    borderRadius: radius.xs,
    backgroundColor: cal.marker,
  },
  lunar: {
    fontSize: fontSize.caption,
    color: cal.lunar,
    marginTop: 2,
    includeFontPadding: false,
  },
})

export default CalendarCell
