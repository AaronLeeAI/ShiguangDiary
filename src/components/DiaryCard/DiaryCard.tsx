/**
 * Diary Card Component
 *
 * 日记列表卡片，用于首页/搜索结果/日记本内页。
 * 展示：日期、标题、正文预览、时间、标签、置顶/加密标记。
 *
 * 规范来源：
 * - docs/project-设计-docs/components/DiaryCard.md
 * - docs/project-设计-docs/docs/04_Design_System.md
 */

import React from 'react'
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native'
import { styles } from './styles'
import type { Diary } from '@types'

export interface DiaryCardProps {
  /** 日记数据 */
  item: Diary
  /** 点击回调 */
  onPress?: () => void
  /** 外部样式扩展 */
  style?: ViewStyle
}

/**
 * Diary Card - 日记卡片组件
 *
 * 展示单条日记的核心信息，支持点击交互。
 */
export const DiaryCard: React.FC<DiaryCardProps> = ({ item, onPress, style }) => {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.container, style]}>
      {/* 头部：日期 + 置顶/加密标记 */}
      <View style={styles.header}>
        <View style={styles.dateBlock}>
          <Text style={styles.day}>{item.day}</Text>
          <Text style={styles.monthYear}>{item.monthYear}</Text>
        </View>
        <View style={styles.tags}>
          {item.isPinned && <Text style={styles.pinned}>📌</Text>}
          {item.isEncrypted && <Text style={styles.locked}>🔒</Text>}
        </View>
      </View>

      {/* 正文 */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title || '无标题'}
        </Text>
        <Text style={styles.summary} numberOfLines={2}>
          {item.summary}
        </Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default DiaryCard
