/**
 * Diary Card Component
 *
 * 日记列表卡片，用于首页/搜索结果/日记本内页。
 * 默认展示日期、标题、正文预览、时间、置顶/加密标记；首页可使用紧凑左右布局。
 *
 * 规范来源：
 * - docs/project-设计-docs/components/DiaryCard.md
 * - docs/project-设计-docs/docs/04_Design_System.md
 */

import React from 'react'
import {
  Image,
  View,
  Text,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { PressableScale } from '@/components/PressableScale'
import { styles } from './styles'
import type { Diary } from '@types'

export interface DiaryCardProps {
  /** 日记数据 */
  item: Diary
  /** 点击回调 */
  onPress?: () => void
  /** 长按回调 */
  onLongPress?: () => void
  /** 卡片展示变体 */
  variant?: 'default' | 'homeCompact'
  /** 首页覆盖展示：日期 */
  displayDay?: string
  /** 首页覆盖展示：月份/星期 */
  displayMonthYear?: string
  /** 首页覆盖展示：标题 */
  displayTitle?: string
  /** 首页覆盖展示：摘要 */
  displaySummary?: string
  /** Home cover / first content image */
  coverSource?: ImageSourcePropType | null
  /** 外部样式扩展 */
  style?: StyleProp<ViewStyle>
}

/**
 * Diary Card - 日记卡片组件
 *
 * 展示单条日记的核心信息，支持点击/长按交互。
 */
export const DiaryCard: React.FC<DiaryCardProps> = ({
  item,
  onPress,
  onLongPress,
  variant = 'default',
  displayDay,
  displayMonthYear,
  displayTitle,
  displaySummary,
  coverSource,
  style,
}) => {
  const day = displayDay ?? item.day
  const monthYear = displayMonthYear ?? item.monthYear
  const title = displayTitle ?? item.title ?? ''
  const summary = displaySummary ?? item.summary

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`日记:${title || '无标题'}`}
      hapticIntent="tap"
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={450}
      style={[styles.container, style]}
    >
      {variant === 'homeCompact' ? (
        <View>
          <View style={styles.homeRow}>
            <View style={styles.homeDateBlock}>
              <Text style={styles.homeDay}>{day}</Text>
              <Text style={styles.homeMonthYear}>{monthYear}</Text>
            </View>
            <View style={styles.homeContent}>
              <Text style={styles.title} numberOfLines={1}>
                {title || '无标题'}
              </Text>
              <Text style={styles.summary} numberOfLines={2}>
                {summary}
              </Text>
            </View>
          </View>
          {coverSource ? (
            <View style={styles.homeCoverFrame}>
              <Image source={coverSource} style={styles.homeCoverImage} resizeMode="cover" />
            </View>
          ) : null}
        </View>
      ) : (
        <>
          {/* 头部：日期 + 置顶/加密标记 */}
          <View style={styles.header}>
            <View style={styles.dateBlock}>
              <Text style={styles.day}>{day}</Text>
              <Text style={styles.monthYear}>{monthYear}</Text>
            </View>
            <View style={styles.tags}>
              {item.isPinned && <Text style={styles.pinned}>📌</Text>}
              {item.isEncrypted && <Text style={styles.locked}>🔒</Text>}
            </View>
          </View>

          {/* 正文 */}
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>
              {title || '无标题'}
            </Text>
            <Text style={styles.summary} numberOfLines={2}>
              {summary}
            </Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
        </>
      )}
    </PressableScale>
  )
}

export default DiaryCard
