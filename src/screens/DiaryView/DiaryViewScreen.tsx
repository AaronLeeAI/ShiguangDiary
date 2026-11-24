/**
 * DiaryView Screen - 日记详情页
 *
 * 数据源：useDiaryStore
 */

import React, { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ActionSheet } from '@/components/ActionSheet'
import { Icon } from '@/components/Icon'
import { Loading } from '@/components/Loading'
import { PrimaryButton } from '@/components/PrimaryButton'
import { TopBar } from '@/components/TopBar'
import { toast } from '@/components/Toast'
import { ROUTES } from '@constants/routes'
import { haptic } from '@animations/haptics'
import { colors, spacing } from '@theme'
import { useDiaryStore } from '@store/diaryStore'

import { styles } from './styles'
import type { DiaryViewScreenProps } from './types'

const htmlEntityMap: Record<string, string> = {
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
}

const decodeHtmlEntities = (value: string) =>
  value.replace(/&(lt|gt|amp|quot);|&#39;/g, entity => htmlEntityMap[entity] ?? entity)

const normalizeLegacyToolbarMarkup = (value: string) => {
  let normalized = value
    .replace(
      /<span\s+style="font-size:\s*1\.2em;">([\s\S]*?)<\/span>/g,
      (_match, inlineText) => `**${decodeHtmlEntities(inlineText)}**`,
    )
    .replace(
      /<span\s+style="font-size:\s*0\.9em;">([\s\S]*?)<\/span>/g,
      (_match, inlineText) => `_${decodeHtmlEntities(inlineText)}_`,
    )
    .replace(/<u>([\s\S]*?)<\/u>/g, (_match, inlineText) => `++${decodeHtmlEntities(inlineText)}++`)
    .replace(
      /<div\s+align="center">\n?([\s\S]*?)\n?<\/div>/g,
      (_match, blockText) => `::: center\n${decodeHtmlEntities(blockText).trim()}\n:::`,
    )

  normalized = normalized.replace(/<\/?[^>]+>/g, '')
  return normalized
}

type InlineRule = {
  pattern: RegExp
  style: object
}

const isMarkdownBlockStart = (line: string) =>
  /^#{1,6}\s+/.test(line) ||
  /^>\s?/.test(line) ||
  /^\d+\.\s+/.test(line) ||
  /^[-*]\s+/.test(line) ||
  /^:::\s*center\s*$/.test(line.trim()) ||
  /^---+$/.test(line.trim())

const renderInlineMarkdown = (text: string, keyPrefix: string): ReactNode[] => {
  const rules: InlineRule[] = [
    { pattern: /\*\*([^*]+)\*\*/, style: styles.markdownBold },
    { pattern: /~~([^~]+)~~/, style: styles.markdownStrike },
    { pattern: /\+\+([^+]+)\+\+/, style: styles.markdownUnderline },
    { pattern: /\*([^*]+)\*/, style: styles.markdownItalic },
    { pattern: /\[([^\]]+)\]\(([^)]+)\)/, style: styles.markdownLink },
  ]

  const nodes: ReactNode[] = []
  let rest = text
  let nodeIndex = 0

  while (rest.length > 0) {
    let bestMatch: RegExpExecArray | null = null
    let bestRule: InlineRule | null = null

    for (const rule of rules) {
      const match = rule.pattern.exec(rest)
      if (match && (!bestMatch || match.index < bestMatch.index)) {
        bestMatch = match
        bestRule = rule
      }
    }

    if (!bestMatch || !bestRule) {
      nodes.push(rest)
      break
    }

    if (bestMatch.index > 0) {
      nodes.push(rest.slice(0, bestMatch.index))
    }

    const displayText = bestMatch[1]
    nodes.push(
      <Text key={`${keyPrefix}-inline-${nodeIndex++}`} style={bestRule.style}>
        {renderInlineMarkdown(displayText, `${keyPrefix}-${nodeIndex}`)}
      </Text>,
    )
    rest = rest.slice(bestMatch.index + bestMatch[0].length)
  }

  return nodes
}

const renderMarkdownBlocks = (markdown: string) => {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()
    const key = `md-${index}`

    if (!trimmed) {
      index += 1
      continue
    }

    if (/^---+$/.test(trimmed)) {
      blocks.push(<View key={key} style={styles.markdownDivider} />)
      index += 1
      continue
    }

    if (/^:::\s*center\s*$/.test(trimmed)) {
      const centeredLines: string[] = []
      index += 1
      while (index < lines.length && lines[index].trim() !== ':::') {
        centeredLines.push(lines[index])
        index += 1
      }
      blocks.push(
        <Text key={key} style={[styles.content, styles.markdownCenter]}>
          {renderInlineMarkdown(centeredLines.join('\n'), key)}
        </Text>,
      )
      index += 1
      continue
    }

    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line)
    if (headingMatch) {
      const headingStyle =
        headingMatch[1].length === 1
          ? styles.markdownHeading1
          : headingMatch[1].length === 2
            ? styles.markdownHeading2
            : styles.markdownHeading3
      blocks.push(
        <Text key={key} style={[styles.content, headingStyle]}>
          {renderInlineMarkdown(headingMatch[2], key)}
        </Text>,
      )
      index += 1
      continue
    }

    const quoteMatch = /^>\s?(.*)$/.exec(line)
    if (quoteMatch) {
      const quoteLines: string[] = [quoteMatch[1]]
      index += 1
      while (index < lines.length) {
        const nextQuote = /^>\s?(.*)$/.exec(lines[index])
        if (!nextQuote) {
          break
        }
        quoteLines.push(nextQuote[1])
        index += 1
      }
      blocks.push(
        <View key={key} style={styles.markdownQuote}>
          <Text style={styles.content}>{renderInlineMarkdown(quoteLines.join('\n'), key)}</Text>
        </View>,
      )
      continue
    }

    const listMatch = /^(\d+\.|[-*])\s+(.*)$/.exec(line)
    if (listMatch) {
      const listItems: Array<{ marker: string; text: string }> = []
      while (index < lines.length) {
        const currentMatch = /^(\d+\.|[-*])\s+(.*)$/.exec(lines[index])
        if (!currentMatch) {
          break
        }
        listItems.push({
          marker: currentMatch[1] === '-' || currentMatch[1] === '*' ? '\u2022' : currentMatch[1],
          text: currentMatch[2],
        })
        index += 1
      }
      blocks.push(
        <View key={key} style={styles.markdownList}>
          {listItems.map((item, itemIndex) => (
            <View key={`${key}-item-${itemIndex}`} style={styles.markdownListItem}>
              <Text style={[styles.content, styles.markdownListMarker]}>{item.marker}</Text>
              <Text style={[styles.content, styles.markdownListText]}>
                {renderInlineMarkdown(item.text, `${key}-item-${itemIndex}`)}
              </Text>
            </View>
          ))}
        </View>,
      )
      continue
    }

    const paragraphLines = [line]
    index += 1
    while (index < lines.length && lines[index].trim() && !isMarkdownBlockStart(lines[index])) {
      paragraphLines.push(lines[index])
      index += 1
    }
    blocks.push(
      <Text key={key} style={styles.content}>
        {renderInlineMarkdown(paragraphLines.join('\n'), key)}
      </Text>,
    )
  }

  return blocks
}

export const DiaryViewScreen: React.FC<DiaryViewScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets()
  const { id } = route.params
  const diary = useDiaryStore(s => s.diaries.find(d => d.id === id))
  const initialized = useDiaryStore(s => s.initialized)
  const init = useDiaryStore(s => s.init)
  const togglePin = useDiaryStore(s => s.togglePin)
  const removeDiary = useDiaryStore(s => s.removeDiary)
  const [unlocked, setUnlocked] = useState(false)
  const [actionSheetVisible, setActionSheetVisible] = useState(false)

  useEffect(() => {
    if (!initialized) {
      init()
    }
  }, [initialized, init])

  const handleBack = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const handleEdit = useCallback(() => {
    navigation.replace(ROUTES.DIARY_EDIT, { id })
  }, [id, navigation])

  const handleTogglePin = useCallback(async () => {
    await togglePin(id)
    haptic('toggle')
    toast.success(diary?.isPinned ? '已取消置顶' : '已置顶')
    setActionSheetVisible(false)
  }, [id, diary?.isPinned, togglePin])

  const handleDelete = useCallback(async () => {
    setActionSheetVisible(false)
    haptic('delete')
    await removeDiary(id)
    toast.success('已删除')
    setTimeout(() => navigation.goBack(), 400)
  }, [id, removeDiary, navigation])

  const handleUnlock = useCallback(() => {
    setUnlocked(true)
    haptic('complete')
    toast.success('已解锁')
  }, [])

  if (!initialized || !diary) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <TopBar showBack onBackPress={handleBack} />
        <Loading variant="full" visible={true} />
      </View>
    )
  }

  const showFullContent = !diary.isEncrypted || unlocked

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TopBar
        showBack
        onBackPress={handleBack}
        right={
          <Pressable
            hitSlop={12}
            onPress={() => setActionSheetVisible(true)}
            style={{ padding: spacing.sm }}
          >
            <Icon name="more" size={22} color={colors.semantic.icon.primary} />
          </Pressable>
        }
      />

      <ScrollView style={styles.body} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.date}>
            {diary.monthYear} {diary.timestamp}
          </Text>
          {(diary.isPinned || diary.isEncrypted) && (
            <View style={styles.badges}>
              {diary.isPinned && (
                <View style={styles.badge}>
                  <Icon name="bookmark" size={12} color={colors.semantic.text.secondary} />
                  <Text style={styles.badgeText}>已置顶</Text>
                </View>
              )}
              {diary.isEncrypted && (
                <View style={styles.badge}>
                  <Icon name="moon" size={12} color={colors.semantic.text.secondary} />
                  <Text style={styles.badgeText}>已加密</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {!!diary.title && <Text style={styles.title}>{diary.title}</Text>}

        {showFullContent ? (
          <View>{renderMarkdownBlocks(normalizeLegacyToolbarMarkup(diary.content))}</View>
        ) : (
          <View style={styles.encryptedMask}>
            <View style={styles.encryptedIcon}>
              <Icon name="moon" size={48} color={colors.semantic.icon.tertiary} />
            </View>
            <Text style={styles.encryptedTitle}>这篇日记已加密</Text>
            <Text style={styles.encryptedHint}>请解锁后查看完整内容</Text>
            <PrimaryButton
              title="解锁"
              onPress={handleUnlock}
              variant="primary"
              size="medium"
              fullWidth={false}
            />
          </View>
        )}

        <View style={styles.meta}>
          {!!diary.weather && (
            <View style={styles.metaItem}>
              <Icon name="weather" size={16} color={colors.semantic.icon.secondary} />
              <Text style={styles.metaText}>{diary.weather}</Text>
            </View>
          )}
          {!!diary.location && (
            <View style={styles.metaItem}>
              <Icon name="location" size={16} color={colors.semantic.icon.secondary} />
              <Text style={styles.metaText}>{diary.location}</Text>
            </View>
          )}
          {!!diary.mood && (
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>{diary.mood}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <ActionSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        items={[
          { key: 'edit', label: '编辑', icon: 'edit', onPress: handleEdit },
          {
            key: 'pin',
            label: diary.isPinned ? '取消置顶' : '置顶',
            icon: 'bookmark',
            onPress: handleTogglePin,
          },
          { key: 'delete', label: '删除', icon: 'trash', destructive: true, onPress: handleDelete },
        ]}
      />
    </View>
  )
}

export default DiaryViewScreen
