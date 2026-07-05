/**
 * SummaryCard - 顶部统计汇总卡片
 *
 * 消费 SummaryMetrics,网格化展示核心指标(总日记/总字数/连续记录)
 * + 本月/本年统计行。受控组件接 metrics,无内部状态。
 * 颜色/间距/圆角走 theme token,禁止硬编码。
 */

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import { colors, radius, spacing, typography } from '@theme'
import type { SummaryMetrics } from '../types'
import { StatisticsCard } from './StatisticsCard'

export interface SummaryCardProps {
  metrics: SummaryMetrics
  testID?: string
}

const fmt = (n: number): string => {
  // 千级以上用 "1.2k" 简化展示(避免长数字撑爆窄卡)。
  if (n >= 10000) {
    return `${(n / 1000).toFixed(1)}k`
  }
  return String(n)
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ metrics, testID }) => {
  return (
    <View testID={testID} style={styles.container}>
      <View style={styles.topRow}>
        <StatisticsCard label="日记总数" value={fmt(metrics.totalDiaries)} />
        <StatisticsCard label="总字数" value={fmt(metrics.totalWords)} />
        <StatisticsCard
          label="连续记录"
          value={`${metrics.currentStreak}天`}
          accent
          sublabel={`最长 ${metrics.longestStreak}天`}
        />
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>本月记录</Text>
        <View style={styles.sectionRow}>
          <View style={styles.sectionItem}>
            <Text style={styles.sectionValue}>{metrics.monthCount}</Text>
            <Text style={styles.sectionLabel}>篇</Text>
          </View>
          <View style={styles.sectionDivider} />
          <View style={styles.sectionItem}>
            <Text style={styles.sectionValue}>{fmt(metrics.monthWords)}</Text>
            <Text style={styles.sectionLabel}>字</Text>
          </View>
          <View style={styles.sectionDivider} />
          <View style={styles.sectionItem}>
            <Text style={styles.sectionValue}>{metrics.avgWordsPerDiary}</Text>
            <Text style={styles.sectionLabel}>平均字数</Text>
          </View>
        </View>
      </View>

      <View style={[styles.sectionBox, styles.sectionBoxLast]}>
        <Text style={styles.sectionTitle}>本年记录</Text>
        <View style={styles.sectionRow}>
          <View style={styles.sectionItem}>
            <Text style={styles.sectionValue}>{metrics.yearCount}</Text>
            <Text style={styles.sectionLabel}>篇</Text>
          </View>
          <View style={styles.sectionDivider} />
          <View style={styles.sectionItem}>
            <Text style={styles.sectionValue}>{fmt(metrics.yearWords)}</Text>
            <Text style={styles.sectionLabel}>字</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sectionBox: {
    marginTop: spacing.sm,
    padding: spacing.base,
    backgroundColor: colors.semantic.bg.card,
    borderRadius: radius.lg,
  },
  sectionBoxLast: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontFamily: typography.bodyL.fontFamily,
    fontSize: typography.bodyS.fontSize,
    fontWeight: typography.bodyM.fontWeight,
    color: colors.semantic.text.secondary,
    marginBottom: spacing.sm,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  sectionValue: {
    fontFamily: typography.titleM.fontFamily,
    fontSize: typography.titleM.fontSize,
    fontWeight: typography.titleM.fontWeight,
    color: colors.semantic.text.primary,
    marginRight: spacing.xs,
  },
  sectionLabel: {
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.semantic.text.tertiary,
  },
  sectionDivider: {
    width: StyleSheet.hairlineWidth,
    height: spacing.lg,
    backgroundColor: colors.semantic.divider.subtle,
    marginHorizontal: spacing.xs,
  },
})

export default SummaryCard
