/**
 * WeekdayHeader - 周一-周日 表头(月/周视图共用)
 */

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import { cal, fontSize, spacing } from '@theme'

export interface WeekdayHeaderProps {
  labels: readonly string[]
}

export const WeekdayHeader: React.FC<WeekdayHeaderProps> = ({ labels }) => (
  <View style={styles.row}>
    {labels.map(l => (
      <Text key={l} style={styles.label}>
        {l}
      </Text>
    ))}
  </View>
)

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.bodyS,
    color: cal.lunar,
    includeFontPadding: false,
  },
})

export default WeekdayHeader
