/**
 * SearchHistory - 历史搜索 + 推荐标签
 *
 * 设计稿 P000-search 闲置态:历史搜索区 + 推荐区。
 * 点标签 → 填入并触发搜索;清空按钮清历史。
 */

import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'

import { colors, radius, spacing, typography } from '@theme'

export interface SearchHistoryProps {
  history: string[]
  recommendations: string[]
  onTagPress: (tag: string) => void
  onClearHistory: () => void
}

const TagList: React.FC<{ tags: string[]; onTagPress: (t: string) => void }> = ({
  tags,
  onTagPress,
}) => {
  if (tags.length === 0) {
    return <Text style={styles.empty}>暂无</Text>
  }
  return (
    <View style={styles.tags}>
      {tags.map(tag => (
        <Pressable
          key={tag}
          onPress={() => onTagPress(tag)}
          style={({ pressed }) => [styles.tag, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.tagText}>{tag}</Text>
        </Pressable>
      ))}
    </View>
  )
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({
  history,
  recommendations,
  onTagPress,
  onClearHistory,
}) => (
  <View style={styles.container}>
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>搜索历史</Text>
        {history.length > 0 ? (
          <Pressable hitSlop={8} onPress={onClearHistory}>
            <Text style={styles.clearButton}>清空</Text>
          </Pressable>
        ) : null}
      </View>
      <TagList tags={history} onTagPress={onTagPress} />
    </View>

    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { marginBottom: spacing.md }]}>推荐</Text>
      <TagList tags={recommendations} onTagPress={onTagPress} />
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.titleS,
    color: colors.semantic.text.primary,
  },
  clearButton: {
    ...typography.bodyS,
    color: colors.semantic.text.tertiary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.semantic.bg.subtle,
    borderRadius: radius.full,
  },
  tagText: {
    ...typography.bodyS,
    color: colors.semantic.text.secondary,
  },
  empty: {
    ...typography.bodyS,
    color: colors.semantic.text.tertiary,
  },
})

export default SearchHistory
