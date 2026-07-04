/**
 * YearView - 年视图(12 个月缩略,3 行 × 4 列)
 *
 * 设计稿:月份大字绿色;有记的月份为黄色 `#FFB400`;今日所在月描边。
 * 点击某月 → 进入该月月视图。
 */

import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'

import { cal, colors, fontSize, radius, spacing } from '@theme'

export interface YearViewProps {
  year: number
  yearMonths: Array<{ year: number; month: number; hasDiary: boolean }>
  /** 今日所在月(用于高亮当前月)。 */
  todayMonth: number
  onSelectMonth: (year: number, month: number) => void
}

export const YearView: React.FC<YearViewProps> = ({
  year,
  yearMonths,
  todayMonth,
  onSelectMonth,
}) => {
  const rows = [yearMonths.slice(0, 4), yearMonths.slice(4, 8), yearMonths.slice(8, 12)]
  return (
    <View style={styles.container}>
      {rows.map((row, ri) => (
        <View key={`${year}-row-${ri}`} style={styles.row}>
          {row.map(m => {
            const isToday = m.year === year && m.month === todayMonth
            const color = m.hasDiary ? cal.solarYearHasNote : cal.solarYear
            return (
              <Pressable
                key={`${m.year}-${m.month}`}
                hitSlop={4}
                onPress={() => onSelectMonth(m.year, m.month)}
                style={[
                  styles.cell,
                  {
                    borderColor: isToday ? colors.brand.primary : 'transparent',
                    borderWidth: isToday ? 1.5 : 0,
                    borderRadius: radius.md,
                  },
                ]}
                accessibilityLabel={`${m.year}年${m.month}月${m.hasDiary ? ' 有日记' : ''}`}
              >
                <Text style={[styles.label, { color }]}>{m.month}月</Text>
              </Pressable>
            )
          })}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cell: {
    flex: 1,
    marginHorizontal: spacing.xs,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: fontSize.bodyL,
    fontWeight: '600',
    includeFontPadding: false,
  },
})

export default YearView
