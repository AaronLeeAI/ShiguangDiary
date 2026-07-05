/**
 * StatisticsCard - 通用统计卡片(label + value + 可选副文案)
 *
 * 内部使用 token (禁止硬编码颜色)。受控组件,SummaryCard 复用本卡片网格化展示。
 */

import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'

import { colors, radius, spacing, typography } from '@theme'

export interface StatisticsCardProps {
  label: string
  value: string | number
  sublabel?: string
  /** 是否强调(数字用 brand.primary,如"连续记录")。 */
  accent?: boolean
  style?: ViewStyle
  testID?: string
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  label,
  value,
  sublabel,
  accent = false,
  style,
  testID,
}) => {
  return (
    <View testID={testID} style={[styles.container, style]}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.value, accent && styles.valueAccent]} numberOfLines={1}>
        {value}
      </Text>
      {sublabel ? (
        <Text style={styles.sublabel} numberOfLines={1}>
          {sublabel}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.semantic.bg.card,
    borderRadius: radius.lg,
  },
  label: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    color: colors.semantic.text.tertiary,
    marginBottom: spacing.xs,
  },
  value: {
    fontFamily: typography.titleL.fontFamily,
    fontSize: typography.titleL.fontSize,
    fontWeight: typography.titleL.fontWeight,
    lineHeight: typography.titleL.lineHeight,
    color: colors.semantic.text.primary,
  },
  valueAccent: {
    color: colors.brand.primary,
  },
  sublabel: {
    marginTop: spacing.xs,
    fontFamily: typography.bodyS.fontFamily,
    fontSize: typography.bodyS.fontSize,
    color: colors.semantic.text.tertiary,
  },
})

export default StatisticsCard
