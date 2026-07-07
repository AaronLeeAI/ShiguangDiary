/**
 * DiaryEdit Screen - 日记编辑器
 *
 * 数据流：EditorScreen → useEditor → editorStore + diaryStore → diaryService → repository
 * 页面只做展示与交互，编辑逻辑（dirty / 自动保存 / 校验 / 草稿）由编辑引擎负责。
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputScrollEventData,
  type TextInputSelectionChangeEventData,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Icon, type IconName } from '@/components/Icon'
import { Loading } from '@/components/Loading'
import { toast } from '@/components/Toast'
import { EDITOR_LIMITS, useEditor } from '@features/editor'
import { haptic } from '@animations/haptics'
import { colors } from '@theme'

import { styles } from './styles'
import type { DiaryEditScreenProps } from './types'

const TITLE_MAX_LENGTH = 32
const DEFAULT_LOCATION = '陕西省西安市长安区东三街268号靠近万科城润园'
const DEFAULT_WEATHER = '多云 30°C'
const DEFAULT_SELECTION = { start: 0, end: 0 }
const INDENT_PREFIX = '\u3000\u3000'

type TextSelection = { start: number; end: number }

type FormatTool = Exclude<DiaryTool, 'image' | 'divider' | 'time' | 'mic' | 'link'>
type FormatState = Partial<Record<FormatTool, boolean>>
type FormatRange = { start: number; end: number; formats: FormatTool[] }
type RichDocument = { text: string; ranges: FormatRange[] }

type DiaryTool =
  | 'image'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'indent'
  | 'alignCenter'
  | 'orderedList'
  | 'unorderedList'
  | 'quote'
  | 'divider'
  | 'time'
  | 'mic'
  | 'link'

type ToolbarItem =
  | {
      key: DiaryTool
      label: string
      type: 'icon'
      icon: IconName
    }
  | {
      key: DiaryTool
      label: string
      type: 'text'
      text: string
      textStyle?: 'bold' | 'italic' | 'underline' | 'strike'
    }

const TOOLBAR_ITEMS: ToolbarItem[] = [
  { key: 'image', label: '插入图片', type: 'icon', icon: 'image' },
  { key: 'bold', label: '加粗', type: 'text', text: 'B', textStyle: 'bold' },
  { key: 'italic', label: '斜体', type: 'text', text: 'I', textStyle: 'italic' },
  { key: 'underline', label: '下划线', type: 'text', text: 'U', textStyle: 'underline' },
  { key: 'strikethrough', label: '删除线', type: 'text', text: 'T', textStyle: 'strike' },

  { key: 'indent', label: '缩进两字', type: 'text', text: '↦' },
  { key: 'alignCenter', label: '居中对齐', type: 'text', text: '☰' },
  { key: 'orderedList', label: '有序列表', type: 'text', text: '1.' },
  { key: 'unorderedList', label: '无序列表', type: 'text', text: '•' },
  { key: 'quote', label: '引用', type: 'text', text: '>' },
  { key: 'divider', label: '分隔符', type: 'text', text: '—' },
  { key: 'time', label: '插入当前时间', type: 'icon', icon: 'clock' },
  { key: 'mic', label: '语音转文本', type: 'icon', icon: 'mic' },
  { key: 'link', label: '插入超链接', type: 'icon', icon: 'link' },
]

const FORMAT_TOOLS: FormatTool[] = [
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'indent',
  'alignCenter',
  'orderedList',
  'unorderedList',
  'quote',
]
const INLINE_FORMAT_TOOLS: FormatTool[] = ['bold', 'italic', 'underline', 'strikethrough']
const DIVIDER_TEXT = '---'

const pad2 = (n: number) => `${n}`.padStart(2, '0')

const formatHeaderTime = (date: Date) =>
  `${pad2(date.getMonth() + 1)}月${pad2(date.getDate())}日 ${pad2(date.getHours())}:${pad2(
    date.getMinutes(),
  )}`

const formatInsertTime = (date: Date) =>
  `${date.getFullYear()}年${pad2(date.getMonth() + 1)}月${pad2(date.getDate())}日 ${pad2(
    date.getHours(),
  )}:${pad2(date.getMinutes())}`

const normalizeSelection = (selection: TextSelection, max: number): TextSelection => {
  const start = Math.max(0, Math.min(selection.start, max))
  const end = Math.max(0, Math.min(selection.end, max))
  return start <= end ? { start, end } : { start: end, end: start }
}

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
      (_match, text) => `**${decodeHtmlEntities(text)}**`,
    )
    .replace(
      /<span\s+style="font-size:\s*0\.9em;">([\s\S]*?)<\/span>/g,
      (_match, text) => `_${decodeHtmlEntities(text)}_`,
    )
    .replace(/<u>([\s\S]*?)<\/u>/g, (_match, text) => `++${decodeHtmlEntities(text)}++`)
    .replace(
      /<div\s+align="center">\n?([\s\S]*?)\n?<\/div>/g,
      (_match, text) => `::: center\n${decodeHtmlEntities(text).trim()}\n:::`,
    )

  normalized = normalized.replace(/<\/?[^>]+>/g, '')
  return normalized
}

const isFormatTool = (tool: DiaryTool): tool is FormatTool =>
  FORMAT_TOOLS.includes(tool as FormatTool)

const isInlineFormatTool = (tool: FormatTool) => INLINE_FORMAT_TOOLS.includes(tool)

const uniqueFormats = (formats: FormatTool[]) => FORMAT_TOOLS.filter(tool => formats.includes(tool))

const sameFormats = (left: FormatTool[], right: FormatTool[]) => {
  const l = uniqueFormats(left)
  const r = uniqueFormats(right)
  return l.length === r.length && l.every((tool, index) => tool === r[index])
}

const mergeRanges = (ranges: FormatRange[]) => {
  const sorted = ranges
    .filter(range => range.end > range.start && range.formats.length > 0)
    .map(range => ({ ...range, formats: uniqueFormats(range.formats) }))
    .sort((a, b) => a.start - b.start || a.end - b.end)
  const merged: FormatRange[] = []
  for (const range of sorted) {
    const previous = merged[merged.length - 1]
    if (previous && previous.end === range.start && sameFormats(previous.formats, range.formats)) {
      previous.end = range.end
    } else {
      merged.push({ ...range })
    }
  }
  return merged
}

const clampRanges = (ranges: FormatRange[], max: number) =>
  mergeRanges(
    ranges
      .map(range => ({
        start: Math.max(0, Math.min(range.start, max)),
        end: Math.max(0, Math.min(range.end, max)),
        formats: range.formats,
      }))
      .filter(range => range.end > range.start),
  )

const rangeContainsFormat = (
  ranges: FormatRange[],
  selection: TextSelection,
  format: FormatTool,
  textLength: number,
) => {
  const normalized = normalizeSelection(selection, textLength)
  const end =
    normalized.end > normalized.start ? normalized.end : Math.min(textLength, normalized.start + 1)
  if (end <= normalized.start) {
    return false
  }
  for (let index = normalized.start; index < end; index += 1) {
    if (
      !ranges.some(
        range => range.start <= index && range.end > index && range.formats.includes(format),
      )
    ) {
      return false
    }
  }
  return true
}

const getFormatsForSpan = (ranges: FormatRange[], start: number, end: number) =>
  uniqueFormats(
    ranges.filter(range => range.start < end && range.end > start).flatMap(range => range.formats),
  )

const formatsAtPosition = (ranges: FormatRange[], position: number, textLength: number) => {
  if (textLength <= 0) {
    return []
  }
  const index = Math.max(0, Math.min(textLength - 1, position > 0 ? position - 1 : 0))
  return getFormatsForSpan(ranges, index, index + 1)
}

const lineHasFormat = (ranges: FormatRange[], start: number, end: number, format: FormatTool) =>
  ranges.some(range => range.start < end && range.end > start && range.formats.includes(format))

const getCurrentLineRange = (text: string, position: number): TextSelection => {
  const safePosition = Math.max(0, Math.min(position, text.length))
  const lineStart = text.lastIndexOf('\n', Math.max(0, safePosition - 1)) + 1
  const newlineIndex = text.indexOf('\n', safePosition)
  const lineEnd = newlineIndex === -1 ? text.length : newlineIndex
  return { start: lineStart, end: lineEnd }
}

const removeFormatFromSelection = (
  ranges: FormatRange[],
  selection: TextSelection,
  format: FormatTool,
  textLength: number,
) => {
  const normalized = normalizeSelection(selection, textLength)
  if (normalized.end <= normalized.start) {
    return ranges
  }
  const nextRanges: FormatRange[] = []
  for (const range of ranges) {
    if (range.end <= normalized.start || range.start >= normalized.end) {
      nextRanges.push(range)
      continue
    }
    if (range.start < normalized.start) {
      nextRanges.push({ ...range, end: normalized.start })
    }
    const overlapStart = Math.max(range.start, normalized.start)
    const overlapEnd = Math.min(range.end, normalized.end)
    const formats = range.formats.filter(item => item !== format)
    if (formats.length > 0) {
      nextRanges.push({ start: overlapStart, end: overlapEnd, formats })
    }
    if (range.end > normalized.end) {
      nextRanges.push({ ...range, start: normalized.end })
    }
  }
  return clampRanges(nextRanges, textLength)
}

const toggleFormatForSelection = (
  ranges: FormatRange[],
  selection: TextSelection,
  format: FormatTool,
  textLength: number,
) => {
  const normalized = normalizeSelection(selection, textLength)
  if (normalized.end <= normalized.start) {
    return ranges
  }
  const remove = rangeContainsFormat(ranges, normalized, format, textLength)
  const nextRanges: FormatRange[] = []
  for (const range of ranges) {
    if (range.end <= normalized.start || range.start >= normalized.end) {
      nextRanges.push(range)
      continue
    }
    if (range.start < normalized.start) {
      nextRanges.push({ ...range, end: normalized.start })
    }
    const overlapStart = Math.max(range.start, normalized.start)
    const overlapEnd = Math.min(range.end, normalized.end)
    const formats = remove
      ? range.formats.filter(item => item !== format)
      : uniqueFormats([...range.formats, format])
    if (formats.length > 0) {
      nextRanges.push({ start: overlapStart, end: overlapEnd, formats })
    }
    if (range.end > normalized.end) {
      nextRanges.push({ ...range, start: normalized.end })
    }
  }
  if (!remove) {
    nextRanges.push({ start: normalized.start, end: normalized.end, formats: [format] })
  }
  return clampRanges(nextRanges, textLength)
}

const getTextDiff = (previous: string, next: string) => {
  let start = 0
  while (start < previous.length && start < next.length && previous[start] === next[start]) {
    start += 1
  }
  let previousEnd = previous.length
  let nextEnd = next.length
  while (
    previousEnd > start &&
    nextEnd > start &&
    previous[previousEnd - 1] === next[nextEnd - 1]
  ) {
    previousEnd -= 1
    nextEnd -= 1
  }
  return { start, previousEnd, nextEnd, insertedLength: nextEnd - start }
}

const insertionFormatsFromState = (
  state: FormatState,
  ranges: FormatRange[],
  position: number,
  textLength: number,
) => {
  const inherited = formatsAtPosition(ranges, position, textLength)
  return FORMAT_TOOLS.filter(tool => state[tool] ?? inherited.includes(tool))
}

const updateRangesForTextChange = (
  ranges: FormatRange[],
  diff: ReturnType<typeof getTextDiff>,
  activeFormats: FormatTool[],
  nextTextLength: number,
) => {
  const delta = diff.insertedLength - (diff.previousEnd - diff.start)
  const nextRanges: FormatRange[] = []
  for (const range of ranges) {
    if (range.end <= diff.start) {
      nextRanges.push(range)
    } else if (range.start >= diff.previousEnd) {
      nextRanges.push({ ...range, start: range.start + delta, end: range.end + delta })
    } else {
      if (range.start < diff.start) {
        nextRanges.push({ ...range, end: diff.start })
      }
      if (range.end > diff.previousEnd) {
        nextRanges.push({
          ...range,
          start: diff.start + diff.insertedLength,
          end: range.end + delta,
        })
      }
    }
  }
  if (diff.insertedLength > 0 && activeFormats.length > 0) {
    nextRanges.push({
      start: diff.start,
      end: diff.start + diff.insertedLength,
      formats: activeFormats,
    })
  }
  return clampRanges(nextRanges, nextTextLength)
}

const appendPlain = (
  textParts: string[],
  ranges: FormatRange[],
  value: string,
  formats: FormatTool[],
) => {
  const start = textParts.join('').length
  textParts.push(value)
  if (value.length > 0 && formats.length > 0) {
    ranges.push({ start, end: start + value.length, formats: uniqueFormats(formats) })
  }
}

const parseInlineMarkdownToRich = (line: string, inheritedFormats: FormatTool[]): RichDocument => {
  const textParts: string[] = []
  const ranges: FormatRange[] = []
  const active = new Set<FormatTool>()
  let index = 0
  const append = (value: string) =>
    appendPlain(textParts, ranges, value, [...inheritedFormats, ...active])
  while (index < line.length) {
    const imageMatch = /^!\[([^\]]*)\]\(([^)]*)\)/.exec(line.slice(index))
    if (imageMatch) {
      append(`[image] ${imageMatch[1] || 'image'}`)
      index += imageMatch[0].length
      continue
    }
    const linkMatch = /^\[([^\]]+)\]\(([^)]*)\)/.exec(line.slice(index))
    if (linkMatch) {
      append(linkMatch[1])
      index += linkMatch[0].length
      continue
    }
    const token = line.startsWith('**', index)
      ? { raw: '**', format: 'bold' as FormatTool }
      : line.startsWith('~~', index)
      ? { raw: '~~', format: 'strikethrough' as FormatTool }
      : line.startsWith('++', index)
      ? { raw: '++', format: 'underline' as FormatTool }
      : line[index] === '*'
      ? { raw: '*', format: 'italic' as FormatTool }
      : null
    if (
      token &&
      (active.has(token.format) || line.indexOf(token.raw, index + token.raw.length) !== -1)
    ) {
      active.has(token.format) ? active.delete(token.format) : active.add(token.format)
      index += token.raw.length
      continue
    }
    append(line[index])
    index += 1
  }
  return { text: textParts.join(''), ranges: mergeRanges(ranges) }
}

const parseMarkdownToRichDocument = (markdown: string): RichDocument => {
  const lines = normalizeLegacyToolbarMarkup(markdown).replace(/\r\n/g, '\n').split('\n')
  const textParts: string[] = []
  const ranges: FormatRange[] = []
  let centerMode = false
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const trimmed = lines[lineIndex].trim()
    if (/^:::\s*center\s*$/.test(trimmed)) {
      centerMode = true
      continue
    }
    if (centerMode && trimmed === ':::') {
      centerMode = false
      continue
    }
    const lineStart = textParts.join('').length
    let line = lines[lineIndex]
    const blockFormats: FormatTool[] = centerMode ? ['alignCenter'] : []
    if (/^---+$/.test(trimmed)) {
      line = DIVIDER_TEXT
    }
    if (line.startsWith(INDENT_PREFIX)) {
      blockFormats.push('indent')
      line = line.slice(INDENT_PREFIX.length)
    }
    const quoteMatch = /^>\s?(.*)$/.exec(line)
    if (quoteMatch) {
      blockFormats.push('quote')
      line = quoteMatch[1]
    }
    const orderedListMatch = /^\d+\.\s+(.*)$/.exec(line)
    if (orderedListMatch) {
      blockFormats.push('orderedList')
      line = orderedListMatch[1]
    }
    const unorderedListMatch = /^[-*]\s+(.*)$/.exec(line)
    if (unorderedListMatch) {
      blockFormats.push('unorderedList')
      line = unorderedListMatch[1]
    }
    const parsed = parseInlineMarkdownToRich(line, blockFormats)
    textParts.push(parsed.text)
    ranges.push(
      ...parsed.ranges.map(range => ({
        start: lineStart + range.start,
        end: lineStart + range.end,
        formats: range.formats,
      })),
    )
    if (lineIndex < lines.length - 1) {
      textParts.push('\n')
    }
  }
  const text = textParts.join('')
  return { text, ranges: clampRanges(ranges, text.length) }
}

const applyInlineMarkdown = (text: string, formats: FormatTool[]) => {
  let output = text
  if (formats.includes('italic')) {
    output = `*${output}*`
  }
  if (formats.includes('underline')) {
    output = `++${output}++`
  }
  if (formats.includes('strikethrough')) {
    output = `~~${output}~~`
  }
  if (formats.includes('bold')) {
    output = `**${output}**`
  }
  return output
}

const serializeInline = (text: string, ranges: FormatRange[], start: number, end: number) => {
  if (end <= start) {
    return ''
  }
  const boundaries = new Set<number>([start, end])
  ranges.forEach(range => {
    if (range.start > start && range.start < end) {
      boundaries.add(range.start)
    }
    if (range.end > start && range.end < end) {
      boundaries.add(range.end)
    }
  })
  const points = [...boundaries].sort((a, b) => a - b)
  return points
    .slice(0, -1)
    .map((point, index) => {
      const next = points[index + 1]
      const formats = getFormatsForSpan(ranges, point, next).filter(isInlineFormatTool)
      return applyInlineMarkdown(text.slice(point, next), formats)
    })
    .join('')
}

const serializeRichDocumentToMarkdown = (doc: RichDocument) => {
  const lines = doc.text.split('\n')
  let offset = 0
  let orderedIndex = 1
  return lines
    .map(line => {
      const lineStart = offset
      const lineEnd = lineStart + line.length
      const effectiveEnd = Math.max(lineEnd, lineStart + 1)
      offset = lineEnd + 1
      let output =
        line === DIVIDER_TEXT
          ? '---'
          : serializeInline(doc.text, doc.ranges, lineStart, lineEnd) || line
      if (lineHasFormat(doc.ranges, lineStart, effectiveEnd, 'unorderedList')) {
        output = `- ${output}`
      }
      if (lineHasFormat(doc.ranges, lineStart, effectiveEnd, 'orderedList')) {
        output = `${pad2(orderedIndex++)}. ${output}`
      }
      if (lineHasFormat(doc.ranges, lineStart, effectiveEnd, 'quote')) {
        output = `> ${output}`
      }
      if (lineHasFormat(doc.ranges, lineStart, effectiveEnd, 'indent')) {
        output = `${INDENT_PREFIX}${output}`
      }
      if (lineHasFormat(doc.ranges, lineStart, effectiveEnd, 'alignCenter')) {
        output = `::: center\n${output}\n:::`
      }
      return output
    })
    .join('\n')
}

const countContentChars = (text: string) => text.replace(/\s/g, '').length

export const DiaryEditScreen: React.FC<DiaryEditScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets()
  const { id } = route.params
  const isNew = !id

  const editor = useEditor(id ?? null)
  const { title, content, hydrated, saving, error, setTitle, setContent, save, exit } = editor

  const [plainText, setPlainText] = useState('')
  const [formatRanges, setFormatRanges] = useState<FormatRange[]>([])
  const [activeFormatState, setActiveFormatState] = useState<FormatState>({})
  const [contentSelection, setContentSelection] = useState<TextSelection>(DEFAULT_SELECTION)
  const previewScrollRef = useRef<ScrollView>(null)
  const contentInputRef = useRef<TextInput>(null)
  const lastSerializedContentRef = useRef<string | null>(null)
  const headerTime = useMemo(() => formatHeaderTime(new Date()), [])

  useEffect(() => {
    if (!hydrated || lastSerializedContentRef.current === content) {
      return
    }

    const doc = parseMarkdownToRichDocument(content)
    const serialized = serializeRichDocumentToMarkdown(doc)
    lastSerializedContentRef.current = serialized
    setPlainText(doc.text)
    setFormatRanges(doc.ranges)
    setContentSelection(current => normalizeSelection(current, doc.text.length))
    if (serialized !== content) {
      setContent(serialized)
    }
  }, [content, hydrated, setContent])

  const syncRichDocument = useCallback(
    (nextText: string, nextRanges: FormatRange[], nextSelection: TextSelection) => {
      const doc = { text: nextText, ranges: clampRanges(nextRanges, nextText.length) }
      const serialized = serializeRichDocumentToMarkdown(doc)
      lastSerializedContentRef.current = serialized
      setPlainText(nextText)
      setFormatRanges(doc.ranges)
      setContentSelection(normalizeSelection(nextSelection, nextText.length))
      setContent(serialized)
    },
    [setContent],
  )

  // 退出时统一走 editor.exit（处理草稿）
  const handleBack = useCallback(() => {
    exit()
    navigation.goBack()
  }, [exit, navigation])

  const handleSave = useCallback(async () => {
    const ok = await save()
    if (ok) {
      haptic('saveSuccess')
      toast.success(isNew ? '日记已创建' : '已保存')
      setTimeout(() => navigation.goBack(), 300)
    } else if (error) {
      haptic('error')
      toast.error(error)
    } else {
      haptic('error')
      toast.error('内容不能为空')
    }
  }, [save, isNew, error, navigation])

  const handleContentSelectionChange = useCallback(
    (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      setContentSelection(event.nativeEvent.selection)
    },
    [],
  )

  const handleContentScroll = useCallback(
    (event: NativeSyntheticEvent<TextInputScrollEventData>) => {
      previewScrollRef.current?.scrollTo({
        y: event.nativeEvent.contentOffset.y,
        animated: false,
      })
    },
    [],
  )

  const insertPlainText = useCallback(
    (text: string, formats?: FormatTool[]) => {
      const selection = normalizeSelection(contentSelection, plainText.length)
      const insertionFormats =
        formats ??
        insertionFormatsFromState(
          activeFormatState,
          formatRanges,
          selection.start,
          plainText.length,
        )
      const nextText = `${plainText.slice(0, selection.start)}${text}${plainText.slice(
        selection.end,
      )}`
      const diff = {
        start: selection.start,
        previousEnd: selection.end,
        nextEnd: selection.start + text.length,
        insertedLength: text.length,
      }
      const nextRanges = updateRangesForTextChange(
        formatRanges,
        diff,
        insertionFormats,
        nextText.length,
      )
      const cursor = selection.start + text.length
      syncRichDocument(nextText, nextRanges, { start: cursor, end: cursor })
      requestAnimationFrame(() => contentInputRef.current?.focus())
    },
    [activeFormatState, contentSelection, formatRanges, plainText, syncRichDocument],
  )

  const handleContentChange = useCallback(
    (nextText: string) => {
      const diff = getTextDiff(plainText, nextText)
      const insertionFormats = insertionFormatsFromState(
        activeFormatState,
        formatRanges,
        diff.start,
        plainText.length,
      )
      const nextRanges = updateRangesForTextChange(
        formatRanges,
        diff,
        insertionFormats,
        nextText.length,
      )
      syncRichDocument(nextText, nextRanges, { start: diff.nextEnd, end: diff.nextEnd })
    },
    [activeFormatState, formatRanges, plainText, syncRichDocument],
  )

  const applyFormatToSelectedText = useCallback(
    (format: FormatTool) => {
      const selection = normalizeSelection(contentSelection, plainText.length)
      const nextActive = !rangeContainsFormat(formatRanges, selection, format, plainText.length)
      const nextRanges = toggleFormatForSelection(formatRanges, selection, format, plainText.length)
      setActiveFormatState(current => ({ ...current, [format]: nextActive }))
      syncRichDocument(plainText, nextRanges, selection)
      requestAnimationFrame(() => contentInputRef.current?.focus())
    },
    [contentSelection, formatRanges, plainText, syncRichDocument],
  )

  const toggleFormatMode = useCallback((format: FormatTool, activeNow: boolean) => {
    setActiveFormatState(current => ({ ...current, [format]: !activeNow }))
    requestAnimationFrame(() => contentInputRef.current?.focus())
  }, [])

  const toggleCurrentLineFormat = useCallback(
    (format: FormatTool) => {
      const selection = normalizeSelection(contentSelection, plainText.length)
      const lineRange = getCurrentLineRange(plainText, selection.start)
      if (lineRange.end <= lineRange.start) {
        requestAnimationFrame(() => contentInputRef.current?.focus())
        return
      }

      const currentlyApplied = lineHasFormat(formatRanges, lineRange.start, lineRange.end, format)
      let nextRanges = currentlyApplied
        ? removeFormatFromSelection(formatRanges, lineRange, format, plainText.length)
        : formatRanges

      if (!currentlyApplied) {
        if (format === 'orderedList') {
          nextRanges = removeFormatFromSelection(
            nextRanges,
            lineRange,
            'unorderedList',
            plainText.length,
          )
        } else if (format === 'unorderedList') {
          nextRanges = removeFormatFromSelection(
            nextRanges,
            lineRange,
            'orderedList',
            plainText.length,
          )
        }
        nextRanges = toggleFormatForSelection(nextRanges, lineRange, format, plainText.length)
      }

      syncRichDocument(plainText, nextRanges, selection)
      requestAnimationFrame(() => contentInputRef.current?.focus())
    },
    [contentSelection, formatRanges, plainText, syncRichDocument],
  )

  const handleToolPress = useCallback(
    (tool: DiaryTool) => {
      if (tool === 'indent' || tool === 'orderedList' || tool === 'unorderedList') {
        toggleCurrentLineFormat(tool)
        return
      }

      if (isFormatTool(tool)) {
        const selection = normalizeSelection(contentSelection, plainText.length)
        if (selection.end > selection.start) {
          applyFormatToSelectedText(tool)
        } else {
          const activeNow =
            activeFormatState[tool] ??
            formatsAtPosition(formatRanges, selection.start, plainText.length).includes(tool)
          toggleFormatMode(tool, activeNow)
        }
        return
      }

      if (tool === 'divider') {
        insertPlainText(`${plainText ? '\n' : ''}${DIVIDER_TEXT}\n`, [])
        return
      }

      if (tool === 'time') {
        insertPlainText(formatInsertTime(new Date()))
        return
      }

      if (tool === 'image') {
        toast.info('图片选择器待接入，当前不插入占位文本')
        requestAnimationFrame(() => contentInputRef.current?.focus())
        return
      }

      if (tool === 'link') {
        const selection = normalizeSelection(contentSelection, plainText.length)
        toast.info(
          selection.end > selection.start
            ? '链接地址输入框待接入，当前不插入占位文本'
            : '请先选择要添加链接的文字',
        )
        requestAnimationFrame(() => contentInputRef.current?.focus())
        return
      }

      if (tool === 'mic') {
        toast.info('语音转文本需要接入原生语音识别能力')
        requestAnimationFrame(() => contentInputRef.current?.focus())
      }
    },
    [
      activeFormatState,
      applyFormatToSelectedText,
      contentSelection,
      formatRanges,
      insertPlainText,
      plainText,
      toggleCurrentLineFormat,
      toggleFormatMode,
    ],
  )

  const selectionFormats = useMemo(
    () => formatsAtPosition(formatRanges, contentSelection.start, plainText.length),
    [contentSelection.start, formatRanges, plainText.length],
  )

  const isToolbarActive = useCallback(
    (tool: DiaryTool) =>
      isFormatTool(tool) && (activeFormatState[tool] ?? selectionFormats.includes(tool)),
    [activeFormatState, selectionFormats],
  )

  const contentInputStyles = useMemo(() => {
    const activeFormats = FORMAT_TOOLS.filter(
      tool => activeFormatState[tool] ?? selectionFormats.includes(tool),
    )
    return [
      styles.contentInput,
      activeFormats.includes('bold') && styles.contentInputBold,
      activeFormats.includes('italic') && styles.contentInputItalic,
      activeFormats.includes('alignCenter') && styles.contentInputCenter,
      activeFormats.includes('quote') && styles.contentInputQuoteOffset,
      activeFormats.includes('indent') &&
        !activeFormats.includes('orderedList') &&
        !activeFormats.includes('unorderedList') &&
        styles.contentInputIndentOffset,
      (activeFormats.includes('orderedList') || activeFormats.includes('unorderedList')) &&
        (activeFormats.includes('indent')
          ? styles.contentInputListIndentOffset
          : styles.contentInputListOffset),
    ]
  }, [activeFormatState, selectionFormats])

  const contentCharCount = useMemo(() => countContentChars(plainText), [plainText])

  const renderRichInline = useCallback(
    (line: string, lineStart: number) => {
      if (!line) {
        return null
      }
      const lineEnd = lineStart + line.length
      const boundaries = new Set<number>([lineStart, lineEnd])
      formatRanges.forEach(range => {
        if (range.start > lineStart && range.start < lineEnd) {
          boundaries.add(range.start)
        }
        if (range.end > lineStart && range.end < lineEnd) {
          boundaries.add(range.end)
        }
      })
      const points = [...boundaries].sort((a, b) => a - b)
      return points.slice(0, -1).map((point, index) => {
        const next = points[index + 1]
        const segment = plainText.slice(point, next)
        const formats = getFormatsForSpan(formatRanges, point, next)
        return (
          <Text
            key={`rich-inline-${lineStart}-${index}`}
            style={[
              formats.includes('bold') && styles.liveMarkdownBold,
              formats.includes('italic') && styles.liveMarkdownItalic,
              formats.includes('underline') && styles.liveMarkdownUnderline,
              formats.includes('strikethrough') && styles.liveMarkdownStrike,
            ]}
          >
            {segment}
          </Text>
        )
      })
    },
    [formatRanges, plainText],
  )

  const renderRichTextBlocks = useCallback(() => {
    const lines = plainText.split('\n')
    let offset = 0
    let orderedIndex = 1
    return lines.map((line, index) => {
      const lineStart = offset
      const lineEnd = lineStart + line.length
      const effectiveEnd = Math.max(lineEnd, lineStart + 1)
      offset = lineEnd + 1
      const isQuote = lineHasFormat(formatRanges, lineStart, effectiveEnd, 'quote')
      const isOrdered = lineHasFormat(formatRanges, lineStart, effectiveEnd, 'orderedList')
      const isUnordered = lineHasFormat(formatRanges, lineStart, effectiveEnd, 'unorderedList')
      const isCenter = lineHasFormat(formatRanges, lineStart, effectiveEnd, 'alignCenter')
      const lineStyles = [
        styles.liveMarkdownParagraph,
        isCenter && styles.liveMarkdownCenter,
        lineHasFormat(formatRanges, lineStart, effectiveEnd, 'indent') &&
          styles.liveMarkdownIndented,
      ]
      const contentNode = line ? renderRichInline(line, lineStart) : '\n'

      if (line === DIVIDER_TEXT) {
        return <View key={`rich-line-${index}`} style={styles.liveMarkdownDivider} />
      }
      if (isOrdered || isUnordered) {
        const marker = isOrdered ? `${pad2(orderedIndex++)}.` : '\u2022'
        return (
          <View key={`rich-line-${index}`} style={styles.liveMarkdownListItem}>
            <Text style={[styles.liveMarkdownParagraph, styles.liveMarkdownListMarker]}>
              {marker}
            </Text>
            <Text style={[lineStyles, styles.liveMarkdownListText]}>{contentNode}</Text>
          </View>
        )
      }
      if (isQuote) {
        return (
          <View key={`rich-line-${index}`} style={styles.liveMarkdownQuote}>
            <Text style={lineStyles}>{contentNode}</Text>
          </View>
        )
      }
      return (
        <Text key={`rich-line-${index}`} style={lineStyles}>
          {contentNode}
        </Text>
      )
    })
  }, [formatRanges, plainText, renderRichInline])

  const renderHeader = () => (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" onPress={handleBack} hitSlop={12}>
        <Text style={styles.headerDate}>{headerTime}</Text>
      </Pressable>
      <View style={styles.headerActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="日历事件提醒"
          hitSlop={10}
          style={styles.headerIconButton}
        >
          <Icon name="bell" size={22} color={colors.neutral.black} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="选择日记本"
          hitSlop={10}
          style={styles.headerIconButton}
        >
          <Icon name="tag" size={22} color={colors.neutral.black} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saving ? '保存中' : '保存日记'}
          hitSlop={10}
          onPress={handleSave}
          disabled={saving}
          style={styles.headerIconButton}
        >
          <Icon
            name="check"
            size={24}
            color={saving ? colors.semantic.icon.tertiary : colors.neutral.black}
          />
        </Pressable>
      </View>
    </View>
  )

  const renderToolbarItem = (item: ToolbarItem) => {
    const active = isToolbarActive(item.key)
    const textDecorations = [
      styles.toolbarText,
      item.type === 'text' && item.textStyle === 'bold' && styles.toolbarTextBold,
      item.type === 'text' && item.textStyle === 'italic' && styles.toolbarTextItalic,
      item.type === 'text' && item.textStyle === 'underline' && styles.toolbarTextUnderline,
      item.type === 'text' && item.textStyle === 'strike' && styles.toolbarTextStrike,
      active && styles.toolbarTextActive,
    ]

    return (
      <Pressable
        key={item.key}
        accessibilityRole="button"
        accessibilityLabel={item.label}
        accessibilityState={{ selected: active }}
        hitSlop={4}
        onPress={() => handleToolPress(item.key)}
        style={({ pressed }) => [
          styles.toolbarButton,
          active && styles.toolbarButtonActive,
          pressed && styles.toolbarButtonPressed,
        ]}
      >
        {item.type === 'icon' ? (
          <Icon
            name={item.icon}
            size={20}
            color={active ? colors.brand.primary : colors.neutral.gray50}
          />
        ) : (
          <Text style={textDecorations}>{item.text}</Text>
        )}
      </Pressable>
    )
  }

  if (!hydrated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {renderHeader()}
        <Loading variant="full" visible={true} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {renderHeader()}

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        <View style={styles.editorArea}>
          <View style={styles.titleRow}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="标题（可选）"
              placeholderTextColor={colors.semantic.text.tertiary}
              style={styles.titleInput}
              maxLength={TITLE_MAX_LENGTH}
            />
            <Text style={styles.titleCount}>
              {title.length}/{TITLE_MAX_LENGTH}
            </Text>
          </View>

          <Pressable
            style={styles.liveEditor}
            onPress={() => contentInputRef.current?.focus()}
            accessible={false}
          >
            <ScrollView
              ref={previewScrollRef}
              pointerEvents="none"
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              style={styles.livePreviewScroller}
              contentContainerStyle={styles.livePreviewContent}
              importantForAccessibility="no-hide-descendants"
            >
              {plainText ? (
                renderRichTextBlocks()
              ) : (
                <Text style={styles.livePlaceholder}>请输入...</Text>
              )}
            </ScrollView>
            <TextInput
              ref={contentInputRef}
              value={plainText}
              onChangeText={handleContentChange}
              placeholder=""
              multiline
              selection={contentSelection}
              onSelectionChange={handleContentSelectionChange}
              onScroll={handleContentScroll}
              textAlignVertical="top"
              style={contentInputStyles}
              maxLength={EDITOR_LIMITS.CONTENT_MAX}
              selectionColor={colors.brand.primary}
              cursorColor={colors.brand.primary}
            />
          </Pressable>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.infoBlock}>
            <View style={styles.infoRow}>
              <Icon name="location" size={15} color={colors.neutral.gray50} />
              <Text style={styles.infoText} numberOfLines={1}>
                {DEFAULT_LOCATION}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="weather" size={15} color={colors.neutral.gray50} />
              <Text style={styles.infoText}>{DEFAULT_WEATHER}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="chart" size={15} color={colors.neutral.gray50} />
              <Text style={styles.infoText}>
                {contentCharCount > 0 ? `${contentCharCount} 字` : '字数统计'}
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toolbarContent}
            style={styles.toolbar}
            keyboardShouldPersistTaps="handled"
          >
            {TOOLBAR_ITEMS.map(renderToolbarItem)}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

export default DiaryEditScreen
