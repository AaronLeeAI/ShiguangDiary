/**
 * TrendChart - 自绘柱状趋势条
 *
 * 纯 RN View+StyleSheet 绘制,零第三方依赖;接口抽象(受控 props),
 * 后续可替换为 chart 库而不改调用方(DECISIONS 033)。
 *
 * 渲染:TREND_BUCKETS 根柱(均分宽度),柱高按 value/max 归一;最高柱用 brand.primary,
 * 其余用 brand.primaryGhost;柱顶显示数值(非 0);底部一行 label(日期/月)。
 */

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import { colors, radius, spacing, typography } from '@theme'
import type { TrendData } from '../types'

export interface TrendChartProps {
  data: TrendData
  testID?: string
}

const MAX_BAR_HEIGHT = 120

export const TrendChart: React.FC<TrendChartProps> = ({ data, testID }) => {
  const { points, max } = data

  // 全空(max===0)时给一个占位高度,展示"无数据"的平直柱。
  const hasData = max > 0

  return (
    <View testID={testID} style={styles.container}>
      <View style={styles.barsRow}>
        {points.map((p, i) => {
          const ratio = hasData && p.value > 0 ? p.value / max : 0
          const height = hasData && p.value > 0 ? Math.max(ratio * MAX_BAR_HEIGHT, 4) : 2
          const isMax = hasData && p.value === max && p.value > 0
          return (
            <View key={p.key} style={styles.barCell}>
              <View style={styles.barValueWrap}>
                {p.value > 0 ? (
                  <Text style={[styles.barValue, isMax && styles.barValueMax]}>{p.value}</Text>
                ) : null}
              </View>
              <View
                style={[
                  styles.bar,
                  { height },
                  isMax ? styles.barMax : p.value > 0 ? styles.barFilled : styles.barEmpty,
                ]}
              />
            </View>
          )
        })}
      </View>
      <View style={styles.labelsRow}>
        {points.map((p, i) => (
          // 隔点显示 label(避免拥挤);首尾必显示。
          <Text
            key={p.key}
            style={[styles.label, i % 2 === 1 && i !== points.length - 1 && styles.labelDim]}
            numberOfLines={1}
          >
            {p.label}
          </Text>
        ))}
      </View>
      {!hasData ? <Text style={styles.emptyHint}>暂无趋势数据</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.semantic.bg.card,
    borderRadius: radius.lg,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: MAX_BAR_HEIGHT + spacing.lg,
  },
  barCell: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: spacing.xxs,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValueWrap: {
    height: spacing.lg,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barValue: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    color: colors.semantic.text.tertiary,
  },
  barValueMax: {
    color: colors.brand.primary,
    fontWeight: typography.titleM.fontWeight,
  },
  bar: {
    width: '70%',
    borderRadius: radius.xs,
  },
  barFilled: {
    backgroundColor: colors.brand.primaryGhost,
  },
  barMax: {
    backgroundColor: colors.brand.primary,
  },
  barEmpty: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.semantic.divider.subtle,
  },
  labelsRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    color: colors.semantic.text.secondary,
  },
  labelDim: {
    color: 'transparent',
  },
  emptyHint: {
    textAlign: 'center',
    marginTop: spacing.sm,
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.semantic.text.tertiary,
  },
})

export default TrendChart
