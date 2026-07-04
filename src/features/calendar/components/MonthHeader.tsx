/**
 * MonthHeader - ◀ 标题 ▶ + 今天按钮
 *
 * 标题点击:周→月→年 循环切换(对齐设计稿点月份标题进年视图)。
 * ◀ ▶:切换月份(年视图隐藏)。
 * 今天:回到当日(切回周视图)。
 */

import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'

import { Icon } from '@/components/Icon'
import { colors, fontSize, spacing, cal } from '@theme'

export interface MonthHeaderProps {
  title: string
  mode: 'week' | 'month' | 'year'
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onToggleMode: () => void
}

export const MonthHeader: React.FC<MonthHeaderProps> = ({
  title,
  mode,
  onPrev,
  onNext,
  onToday,
  onToggleMode,
}) => {
  const showArrows = mode !== 'year'
  return (
    <View style={styles.row}>
      {showArrows ? (
        <Pressable
          hitSlop={12}
          onPress={onPrev}
          style={styles.arrowBtn}
          accessibilityLabel="上一月"
        >
          <Icon name="chevronLeft" size={22} color={colors.semantic.icon.secondary} />
        </Pressable>
      ) : (
        <View style={styles.arrowBtn} />
      )}

      <Pressable
        hitSlop={8}
        onPress={onToggleMode}
        style={styles.titleBtn}
        accessibilityLabel="切换日历形态"
      >
        <Text style={styles.title}>{title}</Text>
      </Pressable>

      {showArrows ? (
        <Pressable
          hitSlop={12}
          onPress={onNext}
          style={styles.arrowBtn}
          accessibilityLabel="下一月"
        >
          <Icon name="chevronRight" size={22} color={colors.semantic.icon.secondary} />
        </Pressable>
      ) : (
        <View style={styles.arrowBtn} />
      )}

      <Pressable
        hitSlop={8}
        onPress={onToday}
        style={styles.todayBtn}
        accessibilityLabel="回到今天"
      >
        <Text style={styles.todayText}>今天</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.titleS,
    fontWeight: '600',
    color: cal.solar,
    includeFontPadding: false,
  },
  todayBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  todayText: {
    fontSize: fontSize.bodyS,
    color: colors.brand.primary,
    includeFontPadding: false,
  },
})

export default MonthHeader
