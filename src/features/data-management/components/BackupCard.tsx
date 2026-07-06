/**
 * BackupCard - 单条备份展示卡片
 *
 * 受控纯展示:渲染备份元数据(创建时间/大小/统计摘要)+ 操作回调(恢复/删除)。
 * token 样式,零第三方依赖。
 */

import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { colors, radius, spacing, typography } from '@theme'
import type { BackupMetadata } from '../types'

export interface BackupCardProps {
  data: BackupMetadata
  /** "恢复"按钮点击。 */
  onRestore?: () => void
  /** "删除"按钮点击。 */
  onDelete?: () => void
  testID?: string
}

const formatTime = (ms: number): string => {
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export const BackupCard: React.FC<BackupCardProps> = ({ data, onRestore, onDelete, testID }) => {
  const s = data.stats
  const summary = `${s.diaries} 日记 · ${s.notebooks} 日记本 · ${s.albums} 相册 · ${s.attachments} 附件`

  return (
    <View testID={testID} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{formatTime(data.createdAt)}</Text>
        <Text style={styles.size}>{formatSize(data.size)}</Text>
      </View>
      <Text style={styles.summary}>{summary}</Text>
      <Text style={styles.version}>
        schema v{data.schemaVersion} · app v{data.appVersion}
      </Text>
      <View style={styles.actions}>
        {onRestore && (
          <Pressable
            onPress={onRestore}
            style={({ pressed }) => [
              styles.action,
              styles.actionPrimary,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.actionPrimaryText}>恢复</Text>
          </Pressable>
        )}
        {onDelete && (
          <Pressable
            onPress={onDelete}
            style={({ pressed }) => [styles.action, styles.actionDanger, pressed && styles.pressed]}
          >
            <Text style={styles.actionDangerText}>删除</Text>
          </Pressable>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.titleS,
    color: colors.semantic.text.primary,
  },
  size: {
    ...typography.caption,
    color: colors.semantic.text.tertiary,
  },
  summary: {
    ...typography.bodyS,
    color: colors.semantic.text.secondary,
    marginBottom: spacing.xs,
  },
  version: {
    ...typography.caption,
    color: colors.semantic.text.tertiary,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  actionPrimary: {
    backgroundColor: colors.brand.primary,
  },
  actionPrimaryText: {
    ...typography.bodyS,
    color: colors.semantic.text.inverse,
  },
  actionDanger: {
    backgroundColor: colors.func.danger,
  },
  actionDangerText: {
    ...typography.bodyS,
    color: colors.semantic.text.inverse,
  },
  pressed: {
    opacity: 0.6,
  },
})
