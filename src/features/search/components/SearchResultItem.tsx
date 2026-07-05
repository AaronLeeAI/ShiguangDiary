/**
 * SearchResultItem - 搜索结果项(带关键词高亮)
 *
 * 视觉骨架参考 DiaryCard,但标题/摘要用 HighlightText 渲染命中高亮。
 * **不复用 DiaryCard 组件**(它无 highlight prop;独立建避免破坏 Home)。
 * 颜色/间距/圆角走 theme token,禁止硬编码。
 */

import React from 'react'
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native'
import { StyleSheet } from 'react-native'

import { colors, radius, spacing, typography } from '@theme'
import { HighlightText } from './HighlightText'
import type { SearchResult } from '../types'

export interface SearchResultItemProps {
  result: SearchResult
  onPress?: (id: string) => void
  style?: ViewStyle
  testID?: string
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  result,
  onPress,
  style,
  testID,
}) => {
  const { item, titleRanges, snippet, snippetRanges } = result
  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.7}
      onPress={() => onPress?.(item.id)}
      style={[styles.container, style]}
    >
      <View style={styles.header}>
        <View style={styles.dateBlock}>
          <Text style={styles.day}>{item.day}</Text>
          <Text style={styles.monthYear}>{item.monthYear}</Text>
        </View>
        <View style={styles.tags}>
          {item.isPinned ? <Text style={styles.pinned}>📌</Text> : null}
          {item.isEncrypted ? <Text style={styles.locked}>🔒</Text> : null}
        </View>
      </View>

      <View style={styles.content}>
        <HighlightText
          text={item.title || '无标题'}
          ranges={titleRanges}
          variant="bodyL"
          numberOfLines={1}
        />
        <View style={styles.snippetWrap}>
          <HighlightText
            text={snippet || item.summary}
            ranges={snippetRanges}
            variant="bodyM"
            numberOfLines={2}
            color={colors.semantic.text.secondary}
          />
        </View>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.base,
    marginBottom: spacing.sm,
    backgroundColor: colors.semantic.bg.card,
    borderRadius: radius.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.base,
  },
  dateBlock: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  day: {
    fontFamily: typography.titleM.fontFamily,
    fontSize: typography.titleM.fontSize,
    fontWeight: typography.titleM.fontWeight,
    color: colors.semantic.text.primary,
  },
  monthYear: {
    fontSize: typography.bodyS.fontSize,
    lineHeight: typography.bodyS.lineHeight,
    color: colors.semantic.text.tertiary,
  },
  tags: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinned: {
    fontSize: typography.caption.fontSize,
    color: colors.semantic.text.primary,
  },
  locked: {
    fontSize: typography.caption.fontSize,
    color: colors.func.danger,
  },
  content: {},
  snippetWrap: {
    marginTop: spacing.xs,
  },
  timestamp: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    color: colors.semantic.text.tertiary,
    marginTop: spacing.xs,
  },
})

export default SearchResultItem
