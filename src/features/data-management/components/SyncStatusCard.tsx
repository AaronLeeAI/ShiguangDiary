/**
 * SyncStatusCard - 同步状态展示卡片
 *
 * 受控纯展示:渲染当前同步提供者/上次同步时间/配置状态。Local Provider 阶段
 * 显示"已配置(本地)",WebDAV/Git 接入后不变调用方。
 */

import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { colors, radius, spacing, typography } from '@theme'

export interface SyncStatusCardProps {
  providerId: string | null
  providerName: string
  lastSyncedAt: number | null
  isConfigured: boolean
  pending: number
  testID?: string
}

const formatTime = (ms: number | null): string => {
  if (ms === null) {
    return '从未同步'
  }
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`
}

export const SyncStatusCard: React.FC<SyncStatusCardProps> = ({
  providerId,
  providerName,
  lastSyncedAt,
  isConfigured,
  pending,
  testID,
}) => {
  return (
    <View testID={testID} style={styles.card}>
      <Text style={styles.title}>同步状态</Text>
      <View style={styles.row}>
        <Text style={styles.label}>提供者</Text>
        <Text style={styles.value}>
          {providerId ?? '未配置'} · {providerName}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>最近同步</Text>
        <Text style={styles.value}>{formatTime(lastSyncedAt)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>待同步</Text>
        <Text style={styles.value}>{pending} 项</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>状态</Text>
        <Text style={[styles.value, !isConfigured && styles.warning]}>
          {isConfigured ? '已配置' : '未配置(仅本地)'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.semantic.bg.card,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.titleS,
    color: colors.semantic.text.primary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.bodyS,
    color: colors.semantic.text.tertiary,
  },
  value: {
    ...typography.bodyS,
    color: colors.semantic.text.primary,
  },
  warning: {
    color: colors.func.danger,
  },
})
