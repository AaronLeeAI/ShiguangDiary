/**
 * Statistics Screen - P0xx 统计页
 *
 * 数据流:StatisticsScreen → useStatistics → statisticsStore(态) + diaryStore(数据) → statisticsService → insightsEngine
 * 页面只消费 useStatistics,不直接做统计计算(全在 insightsEngine,DECISIONS 033)。
 *
 * 态分支:
 *  - isEmpty → EmptyState(custom) 引导回写日记
 *  - status error → 友好兜底 + 重试
 *  - loading(初始/切换中) → Loading inline(短暂,纯函数派生同步)
 *  - done → SummaryCard + TrendChart(RangeSelector 切月/年/全部)
 */

import React, { useCallback } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { EmptyState } from '@/components/EmptyState'
import { Loading } from '@/components/Loading'
import { TopBar } from '@/components/TopBar'
import { RangeSelector, SummaryCard, TrendChart, useStatistics } from '@features/statistics'
import type { StatisticsRange } from '@features/statistics'
import { spacing } from '@theme'

import { styles } from './styles'
import type { StatisticsScreenProps } from './types'

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  const { range, status, error, isEmpty, isFallback, loading, summary, trend, setRange, refresh } =
    useStatistics()

  const handleRangeChange = useCallback((r: StatisticsRange) => setRange(r), [setRange])
  const handleRetry = useCallback(() => refresh(), [refresh])
  const handleBackHome = useCallback(() => navigation.goBack(), [navigation])

  const trendTitle = range === 'month' ? '近 7 天趋势' : '近 7 个月趋势'

  const renderBody = () => {
    if (loading) {
      return <Loading variant="inline" visible />
    }
    if (isEmpty) {
      return (
        <EmptyState
          variant="custom"
          title="还没有统计数据"
          subtitle="写下第一篇日记，就能在这里看到你的记录趋势"
          actionLabel="返回"
          onAction={handleBackHome}
        />
      )
    }
    if (status === 'error') {
      return (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error ?? '统计加载失败，请稍后重试'}</Text>
          <Pressable hitSlop={8} onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>重试</Text>
          </Pressable>
        </View>
      )
    }
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.huge }}
      >
        {isFallback ? (
          <Text style={styles.fallbackHint}>数据库不可用，以下统计基于本地示例数据</Text>
        ) : null}
        <View style={styles.section}>
          <SummaryCard metrics={summary} />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{trendTitle}</Text>
          <TrendChart data={trend} />
        </View>
      </ScrollView>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Task16 集成修复:补 back affordance(与 Home/About/Settings 一致,原先非空态死路) */}
      <TopBar title="数据统计" showBack onBackPress={handleBackHome} />
      <View style={styles.rangeRow}>
        <RangeSelector value={range} onChange={handleRangeChange} />
      </View>
      <View style={styles.body}>{renderBody()}</View>
    </View>
  )
}

export default StatisticsScreen
