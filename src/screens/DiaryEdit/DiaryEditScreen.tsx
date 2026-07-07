/**
 * DiaryEdit Screen - 日记编辑器
 *
 * 数据流：EditorScreen → useEditor → editorStore + diaryStore → diaryService → repository
 * 页面只做展示与交互，编辑逻辑（dirty / 自动保存 / 校验 / 草稿）由编辑引擎负责。
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
  type TextInputScrollEventData,
  type TextInputSelectionChangeEventData,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Geolocation from '@react-native-community/geolocation'
import { launchImageLibrary, type Asset } from 'react-native-image-picker'

import { ActionSheet } from '@/components/ActionSheet'
import { Icon, type IconName } from '@/components/Icon'
import { Loading } from '@/components/Loading'
import { toast } from '@/components/Toast'
import { EDITOR_LIMITS, useEditor } from '@features/editor'
import { haptic } from '@animations/haptics'
import { colors } from '@theme'

import { styles } from './styles'
import type { DiaryEditScreenProps } from './types'

const TITLE_MAX_LENGTH = 32
const DEFAULT_LOCATION = '未获取当前位置'
const DEFAULT_WEATHER = '未获取当前天气'
const LOCATING_LOCATION = '正在获取当前位置...'
const DEFAULT_SELECTION = { start: 0, end: 0 }
const INDENT_PREFIX = '\u3000\u3000'

type TextSelection = { start: number; end: number }

type FormatTool = Exclude<DiaryTool, 'image' | 'divider' | 'time' | 'mic' | 'link'>
type FormatState = Partial<Record<FormatTool, boolean>>
type FormatRange = { start: number; end: number; formats: FormatTool[] }
type RichDocument = { text: string; ranges: FormatRange[] }
type EditorSnapshot = RichDocument & { selection: TextSelection }

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
const BLOCK_FORMAT_TOOLS: FormatTool[] = [
  'indent',
  'alignCenter',
  'orderedList',
  'unorderedList',
  'quote',
]
const LIST_FORMAT_TOOLS: FormatTool[] = ['orderedList', 'unorderedList']
const EMPTY_LINE_CANCEL_FORMATS: FormatTool[] = [
  'orderedList',
  'unorderedList',
  'indent',
  'alignCenter',
  'quote',
]
const CONTINUED_EMPTY_LINE_FORMATS: FormatTool[] = ['orderedList', 'unorderedList', 'indent']
const DIVIDER_TEXT = '---'
const IMAGE_MARKDOWN_LINE = /^!\[([^\]]*)\]\(([^)]+)\)$/

const pad2 = (n: number) => `${n}`.padStart(2, '0')

const formatHeaderTime = (date: Date) =>
  `${pad2(date.getMonth() + 1)}月${pad2(date.getDate())}日 ${pad2(date.getHours())}:${pad2(
    date.getMinutes(),
  )}`

const formatInsertTime = (date: Date) =>
  `${date.getFullYear()}年${pad2(date.getMonth() + 1)}月${pad2(date.getDate())}日 ${pad2(
    date.getHours(),
  )}:${pad2(date.getMinutes())}`

const getImageUriFromMarkdownLine = (line: string) => IMAGE_MARKDOWN_LINE.exec(line.trim())?.[2]

const createImageMarkdownLine = (asset: Asset, index: number) => `![图片${index + 1}](${asset.uri})`

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

const isBlockFormatTool = (tool: FormatTool) => BLOCK_FORMAT_TOOLS.includes(tool)

const hasBlockFormat = (formats: FormatTool[]) => formats.some(isBlockFormatTool)

const uniqueFormats = (formats: FormatTool[]) => FORMAT_TOOLS.filter(tool => formats.includes(tool))

const sameFormats = (left: FormatTool[], right: FormatTool[]) => {
  const l = uniqueFormats(left)
  const r = uniqueFormats(right)
  return l.length === r.length && l.every((tool, index) => tool === r[index])
}

const sameRanges = (left: FormatRange[], right: FormatRange[]) =>
  left.length === right.length &&
  left.every(
    (range, index) =>
      range.start === right[index].start &&
      range.end === right[index].end &&
      sameFormats(range.formats, right[index].formats),
  )

const sameDocument = (left: RichDocument, right: RichDocument) =>
  left.text === right.text && sameRanges(left.ranges, right.ranges)

const mergeRanges = (ranges: FormatRange[]) => {
  const sorted = ranges
    .map(range => ({ ...range, formats: uniqueFormats(range.formats) }))
    .filter(
      range =>
        range.formats.length > 0 && (range.end > range.start || hasBlockFormat(range.formats)),
    )
    .sort((a, b) => a.start - b.start || a.end - b.end)
  const merged: FormatRange[] = []
  for (const range of sorted) {
    const previous = merged[merged.length - 1]
    if (
      previous &&
      previous.end > previous.start &&
      range.end > range.start &&
      previous.end === range.start &&
      sameFormats(previous.formats, range.formats)
    ) {
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
      .filter(range => range.end > range.start || hasBlockFormat(range.formats)),
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

const zeroLengthFormatsAtPosition = (ranges: FormatRange[], position: number) =>
  ranges
    .filter(range => range.start === position && range.end === range.start)
    .flatMap(range => range.formats)

const formatsAtPosition = (ranges: FormatRange[], position: number, textLength: number) => {
  const safePosition = Math.max(0, Math.min(position, textLength))
  const zeroFormats = zeroLengthFormatsAtPosition(ranges, safePosition)
  if (textLength <= 0) {
    return uniqueFormats(zeroFormats)
  }
  const index = Math.max(
    0,
    Math.min(textLength - 1, safePosition < textLength ? safePosition : safePosition - 1),
  )
  return uniqueFormats([...getFormatsForSpan(ranges, index, index + 1), ...zeroFormats])
}

const lineHasFormat = (ranges: FormatRange[], start: number, end: number, format: FormatTool) =>
  ranges.some(
    range =>
      range.formats.includes(format) &&
      ((range.end > range.start && range.start < end && range.end > start) ||
        (range.end === range.start && range.start === start)),
  )

const getCurrentLineRange = (text: string, position: number): TextSelection => {
  const safePosition = Math.max(0, Math.min(position, text.length))
  const lineStart = text.lastIndexOf('\n', Math.max(0, safePosition - 1)) + 1
  const newlineIndex = text.indexOf('\n', safePosition)
  const lineEnd = newlineIndex === -1 ? text.length : newlineIndex
  return { start: lineStart, end: lineEnd }
}

const getLineEffectiveEnd = (lineRange: TextSelection) =>
  lineRange.end > lineRange.start ? lineRange.end : lineRange.start + 1

const getFirstLineFormat = (
  ranges: FormatRange[],
  lineRange: TextSelection,
  formats: FormatTool[],
) =>
  formats.find(format =>
    lineHasFormat(ranges, lineRange.start, getLineEffectiveEnd(lineRange), format),
  )

const getLineFormats = (ranges: FormatRange[], lineRange: TextSelection, formats: FormatTool[]) =>
  formats.filter(format =>
    lineHasFormat(ranges, lineRange.start, getLineEffectiveEnd(lineRange), format),
  )

const getLineCancelableFormat = (ranges: FormatRange[], lineRange: TextSelection) =>
  getFirstLineFormat(ranges, lineRange, EMPTY_LINE_CANCEL_FORMATS)

const getContinuedEmptyLineFormats = (ranges: FormatRange[], lineRange: TextSelection) =>
  getLineFormats(ranges, lineRange, CONTINUED_EMPTY_LINE_FORMATS)

const getLineText = (text: string, lineRange: TextSelection) =>
  text.slice(lineRange.start, lineRange.end)

const findDividerLineForDeletion = (
  text: string,
  start: number,
  end: number,
): TextSelection | null => {
  const positions = [start, end, Math.max(0, start - 1), Math.max(0, end - 1)]
  for (const position of positions) {
    const lineRange = getCurrentLineRange(text, position)
    if (getLineText(text, lineRange) === DIVIDER_TEXT) {
      return lineRange
    }
  }
  return null
}

const getWholeLineRemovalRange = (text: string, lineRange: TextSelection) => {
  if (lineRange.end < text.length && text[lineRange.end] === '\n') {
    return { start: lineRange.start, end: lineRange.end + 1, cursor: lineRange.start }
  }
  if (lineRange.start > 0 && text[lineRange.start - 1] === '\n') {
    return { start: lineRange.start - 1, end: lineRange.end, cursor: lineRange.start - 1 }
  }
  return { start: lineRange.start, end: lineRange.end, cursor: lineRange.start }
}

const removeFormatFromPreviousLineBreak = (
  ranges: FormatRange[],
  lineRange: TextSelection,
  format: FormatTool,
  textLength: number,
) =>
  lineRange.start > 0
    ? removeFormatFromSelection(
        ranges,
        { start: lineRange.start - 1, end: lineRange.start },
        format,
        textLength,
      )
    : ranges

const hasRenderableRichContent = (text: string, ranges: FormatRange[]) =>
  text.length > 0 ||
  ranges.some(range => range.end === range.start && hasBlockFormat(range.formats))

const removeFormatFromSelection = (
  ranges: FormatRange[],
  selection: TextSelection,
  format: FormatTool,
  textLength: number,
) => {
  const normalized = normalizeSelection(selection, textLength)
  const nextRanges: FormatRange[] = []
  for (const range of ranges) {
    if (range.end === range.start) {
      if (range.start === normalized.start) {
        const formats = range.formats.filter(item => item !== format)
        if (formats.length > 0) {
          nextRanges.push({ ...range, formats })
        }
      } else {
        nextRanges.push(range)
      }
      continue
    }
    if (normalized.end <= normalized.start) {
      nextRanges.push(range)
      continue
    }
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
  return FORMAT_TOOLS.filter(tool =>
    isBlockFormatTool(tool) ? inherited.includes(tool) : state[tool] ?? inherited.includes(tool),
  )
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
    if (range.end === range.start) {
      if (
        diff.previousEnd > diff.start &&
        range.start > diff.start &&
        range.start <= diff.previousEnd
      ) {
        continue
      }
      if (range.start > diff.start) {
        const nextPosition = range.start + delta
        nextRanges.push({ ...range, start: nextPosition, end: nextPosition })
      } else {
        nextRanges.push(range)
      }
    } else if (range.end <= diff.start) {
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
    const imageUri = getImageUriFromMarkdownLine(line)
    if (imageUri) {
      textParts.push(line)
      if (lineIndex < lines.length - 1) {
        textParts.push('\n')
      }
      continue
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
    if (parsed.text.length === 0 && blockFormats.length > 0) {
      ranges.push({ start: lineStart, end: lineStart, formats: blockFormats })
    }
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
        line === DIVIDER_TEXT || getImageUriFromMarkdownLine(line)
          ? line
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
  const { title, content, hydrated, saving, error, setTitle, setContent, save, exit, discard } =
    editor

  const [plainText, setPlainText] = useState('')
  const [formatRanges, setFormatRanges] = useState<FormatRange[]>([])
  const [activeFormatState, setActiveFormatState] = useState<FormatState>({})
  const [contentSelection, setContentSelection] = useState<TextSelection>(DEFAULT_SELECTION)
  const previewScrollRef = useRef<ScrollView>(null)
  const contentInputRef = useRef<TextInput>(null)
  const lastSerializedContentRef = useRef<string | null>(null)
  const latestSnapshotRef = useRef<EditorSnapshot>({
    text: '',
    ranges: [],
    selection: DEFAULT_SELECTION,
  })
  const undoStackRef = useRef<EditorSnapshot[]>([])
  const redoStackRef = useRef<EditorSnapshot[]>([])
  const [historyStatus, setHistoryStatus] = useState({ undo: 0, redo: 0 })
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [exitSheetVisible, setExitSheetVisible] = useState(false)
  const [locationLabel, setLocationLabel] = useState(DEFAULT_LOCATION)
  const [locating, setLocating] = useState(false)
  const allowLeaveRef = useRef(false)
  const headerTime = useMemo(() => formatHeaderTime(new Date()), [])

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true))
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    )
    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  useEffect(
    () =>
      navigation.addListener('beforeRemove', event => {
        if (allowLeaveRef.current) {
          return
        }
        event.preventDefault()
        Keyboard.dismiss()
        setExitSheetVisible(true)
      }),
    [navigation],
  )

  const refreshHistoryStatus = useCallback(() => {
    setHistoryStatus({ undo: undoStackRef.current.length, redo: redoStackRef.current.length })
  }, [])

  useEffect(() => {
    if (!hydrated || lastSerializedContentRef.current === content) {
      return
    }

    const doc = parseMarkdownToRichDocument(content)
    const serialized = serializeRichDocumentToMarkdown(doc)
    lastSerializedContentRef.current = serialized
    const selection = normalizeSelection(contentSelection, doc.text.length)
    latestSnapshotRef.current = { text: doc.text, ranges: doc.ranges, selection }
    undoStackRef.current = []
    redoStackRef.current = []
    refreshHistoryStatus()
    setPlainText(doc.text)
    setFormatRanges(doc.ranges)
    setContentSelection(selection)
    if (serialized !== content) {
      setContent(serialized)
    }
  }, [content, contentSelection, hydrated, refreshHistoryStatus, setContent])

  const syncRichDocument = useCallback(
    (
      nextText: string,
      nextRanges: FormatRange[],
      nextSelection: TextSelection,
      options?: { recordHistory?: boolean },
    ) => {
      const doc = { text: nextText, ranges: clampRanges(nextRanges, nextText.length) }
      const selection = normalizeSelection(nextSelection, nextText.length)
      const previous = latestSnapshotRef.current

      if (options?.recordHistory !== false && !sameDocument(previous, doc)) {
        undoStackRef.current = [...undoStackRef.current.slice(-99), previous]
        redoStackRef.current = []
      }

      const serialized = serializeRichDocumentToMarkdown(doc)
      latestSnapshotRef.current = { ...doc, selection }
      lastSerializedContentRef.current = serialized
      setPlainText(nextText)
      setFormatRanges(doc.ranges)
      setContentSelection(selection)
      refreshHistoryStatus()
      setContent(serialized)
    },
    [refreshHistoryStatus, setContent],
  )

  const clearBlockFormatState = useCallback((format?: FormatTool) => {
    setActiveFormatState(current => {
      const next: FormatState = { ...current }
      const formats = format
        ? LIST_FORMAT_TOOLS.includes(format)
          ? LIST_FORMAT_TOOLS
          : [format]
        : BLOCK_FORMAT_TOOLS
      formats.forEach(item => {
        delete next[item]
      })
      return next
    })
  }, [])

  const handleBack = useCallback(() => {
    Keyboard.dismiss()
    setExitSheetVisible(true)
  }, [])

  const handleSaveToDraft = useCallback(() => {
    allowLeaveRef.current = true
    exit()
    toast.success('已保存到草稿箱')
    requestAnimationFrame(() => navigation.goBack())
  }, [exit, navigation])

  const handleDiscardAndBack = useCallback(() => {
    allowLeaveRef.current = true
    discard()
    toast.info('已放弃保存')
    requestAnimationFrame(() => navigation.goBack())
  }, [discard, navigation])

  const handleSave = useCallback(async () => {
    const ok = await save()
    if (ok) {
      haptic('saveSuccess')
      toast.success(isNew ? '日记已创建' : '已保存')
      setTimeout(() => {
        allowLeaveRef.current = true
        navigation.goBack()
      }, 300)
    } else if (error) {
      haptic('error')
      toast.error(error)
    } else {
      haptic('error')
      toast.error('内容不能为空')
    }
  }, [save, isNew, error, navigation])

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return true
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: '定位权限',
        message: '需要获取当前位置用于日记定位',
        buttonPositive: '允许',
        buttonNegative: '取消',
      },
    )
    return granted === PermissionsAndroid.RESULTS.GRANTED
  }, [])

  const handleFetchLocation = useCallback(async () => {
    if (locating) {
      return
    }

    setLocating(true)
    setLocationLabel(LOCATING_LOCATION)

    try {
      const hasPermission = await requestLocationPermission()
      if (!hasPermission) {
        setLocationLabel(DEFAULT_LOCATION)
        toast.info('未授予定位权限')
        setLocating(false)
        return
      }

      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude, accuracy } = position.coords
          const accuracyText = Number.isFinite(accuracy) ? ` · ±${Math.round(accuracy)}m` : ''
          setLocationLabel(`GPS ${latitude.toFixed(6)}, ${longitude.toFixed(6)}${accuracyText}`)
          toast.success('已获取当前位置')
          setLocating(false)
        },
        errorInfo => {
          setLocationLabel(DEFAULT_LOCATION)
          toast.error(errorInfo.message || '定位失败，请检查定位权限或 GPS')
          setLocating(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      )
    } catch (err) {
      setLocationLabel(DEFAULT_LOCATION)
      toast.error(err instanceof Error ? err.message : '定位失败，请检查定位权限或 GPS')
      setLocating(false)
    }
  }, [locating, requestLocationPermission])

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

  const restoreSnapshot = useCallback(
    (snapshot: EditorSnapshot) => {
      syncRichDocument(snapshot.text, snapshot.ranges, snapshot.selection, { recordHistory: false })
      requestAnimationFrame(() => {
        contentInputRef.current?.focus()
        contentInputRef.current?.setNativeProps({ selection: snapshot.selection })
      })
    },
    [syncRichDocument],
  )

  const handleUndo = useCallback(() => {
    const snapshot = undoStackRef.current.pop()
    if (!snapshot) {
      return
    }
    redoStackRef.current.push(latestSnapshotRef.current)
    restoreSnapshot(snapshot)
  }, [restoreSnapshot])

  const handleRedo = useCallback(() => {
    const snapshot = redoStackRef.current.pop()
    if (!snapshot) {
      return
    }
    undoStackRef.current.push(latestSnapshotRef.current)
    restoreSnapshot(snapshot)
  }, [restoreSnapshot])

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

  const handleInsertImages = useCallback(async () => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 0,
        includeBase64: false,
      })

      if (response.didCancel) {
        requestAnimationFrame(() => contentInputRef.current?.focus())
        return
      }
      if (response.errorCode) {
        toast.error(response.errorMessage ?? '图片选择失败')
        requestAnimationFrame(() => contentInputRef.current?.focus())
        return
      }

      const assets = (response.assets ?? []).filter(asset => !!asset.uri)
      if (assets.length <= 0) {
        toast.info('未选择图片')
        requestAnimationFrame(() => contentInputRef.current?.focus())
        return
      }

      const selection = normalizeSelection(contentSelection, plainText.length)
      const prefix = selection.start > 0 && plainText[selection.start - 1] !== '\n' ? '\n' : ''
      const suffix = '\n'
      const markdown = assets.map(createImageMarkdownLine).join('\n')
      insertPlainText(`${prefix}${markdown}${suffix}`, [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '图片选择失败')
      requestAnimationFrame(() => contentInputRef.current?.focus())
    }
  }, [contentSelection, insertPlainText, plainText])

  const handleContentChange = useCallback(
    (nextText: string) => {
      const diff = getTextDiff(plainText, nextText)
      const deletedText = plainText.slice(diff.start, diff.previousEnd)
      const deletedLength = diff.previousEnd - diff.start
      const deletedOnlyPreviousNewline = diff.insertedLength === 0 && deletedText === '\n'

      if (
        diff.insertedLength === 0 &&
        deletedLength > 0 &&
        deletedLength <= DIVIDER_TEXT.length + 2
      ) {
        const dividerLineRange = findDividerLineForDeletion(plainText, diff.start, diff.previousEnd)
        if (dividerLineRange) {
          const removalRange = getWholeLineRemovalRange(plainText, dividerLineRange)
          const dividerDiff = {
            start: removalRange.start,
            previousEnd: removalRange.end,
            nextEnd: removalRange.start,
            insertedLength: 0,
          }
          const textWithoutDivider = `${plainText.slice(0, removalRange.start)}${plainText.slice(
            removalRange.end,
          )}`
          const nextRanges = updateRangesForTextChange(
            formatRanges,
            dividerDiff,
            [],
            textWithoutDivider.length,
          )
          const selection = { start: removalRange.cursor, end: removalRange.cursor }
          syncRichDocument(textWithoutDivider, nextRanges, selection)
          requestAnimationFrame(() => {
            contentInputRef.current?.setNativeProps({ selection })
          })
          return
        }
      }

      if (deletedOnlyPreviousNewline) {
        const emptyLineRange = getCurrentLineRange(plainText, diff.previousEnd)
        const isEmptyFormattedLine =
          emptyLineRange.start === diff.previousEnd && emptyLineRange.end === emptyLineRange.start
        const cancelFormat = isEmptyFormattedLine
          ? getLineCancelableFormat(formatRanges, emptyLineRange)
          : null
        if (cancelFormat) {
          const nextRanges = removeFormatFromPreviousLineBreak(
            removeFormatFromSelection(formatRanges, emptyLineRange, cancelFormat, plainText.length),
            emptyLineRange,
            cancelFormat,
            plainText.length,
          )
          clearBlockFormatState(cancelFormat)
          syncRichDocument(plainText, nextRanges, emptyLineRange)
          requestAnimationFrame(() => {
            contentInputRef.current?.setNativeProps({ selection: emptyLineRange })
          })
          return
        }
      }

      const insertedText = nextText.slice(diff.start, diff.nextEnd)
      const insertionFormats = insertionFormatsFromState(
        activeFormatState,
        formatRanges,
        diff.start,
        plainText.length,
      )
      const appliedInsertionFormats =
        insertedText === '\n' ? insertionFormats.filter(isInlineFormatTool) : insertionFormats
      let nextRanges = updateRangesForTextChange(
        formatRanges,
        diff,
        appliedInsertionFormats,
        nextText.length,
      )

      if (insertedText === '\n') {
        const previousLineRange = getCurrentLineRange(plainText, diff.start)
        const continuedFormats = getContinuedEmptyLineFormats(formatRanges, previousLineRange)
        if (continuedFormats.length > 0) {
          const newLineStart = diff.start + 1
          nextRanges = clampRanges(
            [...nextRanges, { start: newLineStart, end: newLineStart, formats: continuedFormats }],
            nextText.length,
          )
        }
      } else if (diff.insertedLength === 0 && diff.previousEnd > diff.start) {
        const previousLineRange = getCurrentLineRange(plainText, diff.start)
        const continuedFormats = getContinuedEmptyLineFormats(formatRanges, previousLineRange)
        const nextLineRange = getCurrentLineRange(nextText, diff.start)
        if (continuedFormats.length > 0 && nextLineRange.end <= nextLineRange.start) {
          nextRanges = clampRanges(
            [
              ...nextRanges,
              { start: nextLineRange.start, end: nextLineRange.start, formats: continuedFormats },
            ],
            nextText.length,
          )
        }
      }

      syncRichDocument(nextText, nextRanges, { start: diff.nextEnd, end: diff.nextEnd })
    },
    [activeFormatState, clearBlockFormatState, formatRanges, plainText, syncRichDocument],
  )

  const handleContentKeyPress = useCallback(
    (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (event.nativeEvent.key !== 'Backspace') {
        return
      }
      const selection = normalizeSelection(contentSelection, plainText.length)
      if (selection.start !== selection.end) {
        return
      }
      const lineRange = getCurrentLineRange(plainText, selection.start)
      if (lineRange.start !== 0 || lineRange.end > lineRange.start) {
        return
      }
      const cancelFormat = getLineCancelableFormat(formatRanges, lineRange)
      if (!cancelFormat) {
        return
      }
      const nextRanges = removeFormatFromSelection(
        formatRanges,
        lineRange,
        cancelFormat,
        plainText.length,
      )
      clearBlockFormatState(cancelFormat)
      syncRichDocument(plainText, nextRanges, selection)
      requestAnimationFrame(() => {
        contentInputRef.current?.setNativeProps({ selection })
      })
    },
    [clearBlockFormatState, contentSelection, formatRanges, plainText, syncRichDocument],
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
      const effectiveEnd = getLineEffectiveEnd(lineRange)
      const currentlyApplied = lineHasFormat(formatRanges, lineRange.start, effectiveEnd, format)
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

        nextRanges =
          lineRange.end > lineRange.start
            ? toggleFormatForSelection(nextRanges, lineRange, format, plainText.length)
            : clampRanges(
                [
                  ...nextRanges,
                  { start: lineRange.start, end: lineRange.start, formats: [format] },
                ],
                plainText.length,
              )
      }

      clearBlockFormatState(format)
      syncRichDocument(plainText, nextRanges, selection)
      requestAnimationFrame(() => {
        contentInputRef.current?.focus()
        requestAnimationFrame(() => {
          contentInputRef.current?.setNativeProps({ selection })
        })
      })
    },
    [clearBlockFormatState, contentSelection, formatRanges, plainText, syncRichDocument],
  )

  const handleToolPress = useCallback(
    (tool: DiaryTool) => {
      if (
        tool === 'indent' ||
        tool === 'alignCenter' ||
        tool === 'orderedList' ||
        tool === 'unorderedList' ||
        tool === 'quote'
      ) {
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
        handleInsertImages()
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
      handleInsertImages,
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
    (tool: DiaryTool) => {
      if (!isFormatTool(tool)) {
        return false
      }
      return isBlockFormatTool(tool)
        ? selectionFormats.includes(tool)
        : activeFormatState[tool] ?? selectionFormats.includes(tool)
    },
    [activeFormatState, selectionFormats],
  )

  const contentInputStyles = useMemo(() => {
    const activeFormats = FORMAT_TOOLS.filter(tool =>
      isBlockFormatTool(tool)
        ? selectionFormats.includes(tool)
        : activeFormatState[tool] ?? selectionFormats.includes(tool),
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
      const imageUri = getImageUriFromMarkdownLine(line)

      if (imageUri) {
        return (
          <View key={`rich-line-${index}`} style={styles.liveMarkdownImageBlock}>
            <Image source={{ uri: imageUri }} style={styles.liveMarkdownImage} resizeMode="cover" />
          </View>
        )
      }

      if (line === DIVIDER_TEXT) {
        return (
          <View key={`rich-line-${index}`} style={styles.liveMarkdownDividerRow}>
            <View style={styles.liveMarkdownDivider} />
          </View>
        )
      }
      if (isOrdered || isUnordered) {
        const marker = isOrdered ? `${pad2(orderedIndex++)}.` : '\u2022'
        return (
          <View key={`rich-line-${index}`} style={styles.liveMarkdownListItem}>
            <Text
              style={[
                styles.liveMarkdownParagraph,
                styles.liveMarkdownListMarker,
                isUnordered && styles.liveMarkdownUnorderedMarker,
              ]}
            >
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
              {hasRenderableRichContent(plainText, formatRanges) ? (
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
              onKeyPress={handleContentKeyPress}
              onScroll={handleContentScroll}
              textAlignVertical="top"
              style={contentInputStyles}
              maxLength={EDITOR_LIMITS.CONTENT_MAX}
            />
          </Pressable>
        </View>

        <View style={styles.bottomSection}>
          {keyboardVisible ? (
            <View style={[styles.infoBlock, styles.infoBlockCompact]}>
              <View style={styles.infoCompactLeft}>
                <Icon name="chart" size={15} color={colors.neutral.gray50} />
                <Text style={styles.infoCompactText}>{`${contentCharCount}字`}</Text>
              </View>
              <View style={styles.historyActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="撤销"
                  disabled={historyStatus.undo <= 0}
                  onPress={handleUndo}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.historyButton,
                    pressed && styles.historyButtonPressed,
                    historyStatus.undo <= 0 && styles.historyButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.historyButtonText,
                      historyStatus.undo <= 0 && styles.historyButtonTextDisabled,
                    ]}
                  >
                    ↶
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="反撤销"
                  disabled={historyStatus.redo <= 0}
                  onPress={handleRedo}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.historyButton,
                    pressed && styles.historyButtonPressed,
                    historyStatus.redo <= 0 && styles.historyButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.historyButtonText,
                      historyStatus.redo <= 0 && styles.historyButtonTextDisabled,
                    ]}
                  >
                    ↷
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.infoBlock}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="获取当前位置"
                disabled={locating}
                onPress={handleFetchLocation}
                style={({ pressed }) => [
                  styles.infoRow,
                  pressed && styles.infoRowPressed,
                  locating && styles.infoRowDisabled,
                ]}
              >
                <Icon name="location" size={15} color={colors.neutral.gray50} />
                <Text style={styles.infoText} numberOfLines={1}>
                  {locationLabel}
                </Text>
              </Pressable>
              <View style={styles.infoRow}>
                <Icon name="weather" size={15} color={colors.neutral.gray50} />
                <Text style={styles.infoText}>{DEFAULT_WEATHER}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="chart" size={15} color={colors.neutral.gray50} />
                <Text style={styles.infoText}>{`${contentCharCount}字`}</Text>
              </View>
            </View>
          )}

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
      <ActionSheet
        visible={exitSheetVisible}
        onClose={() => setExitSheetVisible(false)}
        title="保存选项"
        items={[
          {
            key: 'draft',
            label: '保存到草稿箱',
            onPress: handleSaveToDraft,
          },
          { key: 'save', label: '完成保存', onPress: handleSave, disabled: saving },
          {
            key: 'discard',
            label: '放弃保存',
            destructive: true,
            onPress: handleDiscardAndBack,
          },
        ]}
        cancelLabel="取消"
      />
    </View>
  )
}

export default DiaryEditScreen
