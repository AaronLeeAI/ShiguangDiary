import React, { useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Icon } from '@/components/Icon'
import { brand, neutral, radius, semantic, spacing, typography } from '@theme'
import type { CalendarDay, CalendarProps } from './types'

const DEFAULT_WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

const createDefaultDays = (): CalendarDay[] => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const total = new Date(year, month + 1, 0).getDate()
  const days: CalendarDay[] = []
  for (let i = 0; i < firstDay; i += 1) {
    days.push({ key: `empty-${i}`, day: 0, inCurrentMonth: false })
  }
  for (let day = 1; day <= total; day += 1) {
    days.push({
      key: `${year}-${month + 1}-${day}`,
      day,
      inCurrentMonth: true,
      isToday: day === today.getDate(),
    })
  }
  return days
}

export const Calendar: React.FC<CalendarProps> = ({
  title,
  weekdayLabels = DEFAULT_WEEKDAYS,
  days,
  onPrev,
  onNext,
  onSelectDate,
  style,
  testID,
}) => {
  const resolvedDays = useMemo(() => days ?? createDefaultDays(), [days])
  const resolvedTitle = useMemo(() => {
    if (title) {
      return title
    }
    const now = new Date()
    return `${now.getFullYear()}年${now.getMonth() + 1}月`
  }, [title])

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.header}>
        <Pressable hitSlop={8} onPress={onPrev} style={styles.navButton}>
          <Icon name="chevronLeft" size={18} color={semantic.icon.primary} />
        </Pressable>
        <Text style={styles.title}>{resolvedTitle}</Text>
        <Pressable hitSlop={8} onPress={onNext} style={styles.navButton}>
          <Icon name="chevronRight" size={18} color={semantic.icon.primary} />
        </Pressable>
      </View>
      <View style={styles.weekdays}>
        {weekdayLabels.map(label => (
          <Text key={label} style={styles.weekday}>
            {label}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {resolvedDays.map(day => {
          const isEmpty = !day.inCurrentMonth || day.day === 0
          return (
            <Pressable
              accessibilityLabel={isEmpty ? undefined : `${day.day}日`}
              accessibilityRole={isEmpty ? undefined : 'button'}
              disabled={isEmpty || !onSelectDate}
              key={day.key}
              onPress={() => onSelectDate?.(day)}
              style={styles.cell}
            >
              {!isEmpty ? (
                <View
                  style={[
                    styles.dayCircle,
                    day.selected && styles.selected,
                    day.isToday && styles.today,
                  ]}
                >
                  <Text style={[styles.dayText, day.selected && styles.selectedText]}>
                    {day.day}
                  </Text>
                  {day.hasDiary ? (
                    <View style={[styles.dot, day.selected && styles.selectedDot]} />
                  ) : null}
                </View>
              ) : null}
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: semantic.bg.card,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  title: {
    ...typography.titleS,
    color: neutral.gray90,
  },
  weekdays: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekday: {
    ...typography.caption,
    color: neutral.gray50,
    flex: 1,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    alignItems: 'center',
    aspectRatio: 1,
    justifyContent: 'center',
    width: '14.2857%',
  },
  dayCircle: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: radius.full,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  today: {
    borderColor: brand.primary,
  },
  selected: {
    backgroundColor: brand.primary,
  },
  dayText: {
    ...typography.bodyM,
    color: neutral.gray90,
  },
  selectedText: {
    color: neutral.white,
  },
  dot: {
    backgroundColor: neutral.gray90,
    borderRadius: radius.full,
    height: 3,
    marginTop: 1,
    width: 3,
  },
  selectedDot: {
    backgroundColor: neutral.white,
  },
})

export default Calendar
