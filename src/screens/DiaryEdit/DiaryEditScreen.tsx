/**
 * DiaryEdit Screen - 日记编辑器
 *
 * 数据流：EditorScreen → useEditor → editorStore + diaryStore → diaryService → repository
 * 页面只做展示与交互，编辑逻辑（dirty / 自动保存 / 校验 / 草稿）由编辑引擎负责。
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  Modal,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
  type TextInputScrollEventData,
  type TextInputSelectionChangeEventData,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Geolocation, {
  type GeolocationError,
  type GeolocationOptions,
  type GeolocationResponse,
} from '@react-native-community/geolocation'
import { launchImageLibrary, type Asset } from 'react-native-image-picker'
import ImageViewer from 'react-native-image-zoom-viewer'

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
const DEFAULT_WEATHER = '获取当前天气'
const LOCATING_LOCATION = '正在获取当前位置...'
const FETCHING_WEATHER = '正在获取当前天气...'
const CAIYUN_TOKEN = '4cqwCAHZQHmYFrzy'
const CAIYUN_API_BASE = `https://api.caiyunapp.com/v2.6/${CAIYUN_TOKEN}`
const IP_LOCATION_TIMEOUT_MS = 6000
const REVERSE_GEOCODE_TIMEOUT_MS = 8000
const WEATHER_TIMEOUT_MS = 10000
const DEFAULT_SELECTION = { start: 0, end: 0 }
const INDENT_PREFIX = '\u3000\u3000'

type TextSelection = { start: number; end: number }
type Coordinates = { latitude: number; longitude: number; accuracy?: number | null }
type LocationSource = 'gps' | 'network' | 'ip'
type ResolvedLocation = { coords: Coordinates; label: string; source: LocationSource }

type FormatTool = Exclude<DiaryTool, 'image' | 'divider' | 'time' | 'mic' | 'link'>
type FormatState = Partial<Record<FormatTool, boolean>>
type FormatRange = { start: number; end: number; formats: FormatTool[] }
type RichDocument = { text: string; ranges: FormatRange[] }
type EditorSnapshot = RichDocument & { selection: TextSelection }
type ImagePreviewRequest = { uris: string[]; index: number }
type ImagePreviewState = ImagePreviewRequest & { openedAt: number }
type ImageActionTarget = { lineStart: number; previewState: ImagePreviewRequest }
type ImageActionItem = {
  key: string
  label: string
  icon?: IconName
  destructive?: boolean
  onPress: () => void | Promise<void>
}

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
const IMAGE_EDITOR_LINE = /^@@image:([a-z0-9-]+)@@$/
const IMAGE_EDITOR_TOKEN_LIKE_LINE = /^@@image:[a-z0-9-]*@*$/
const IMAGE_EDITOR_RECOVERABLE_LINE = /^@@image:([a-z0-9-]+)@*$/
const IMAGE_LAYOUT_SPACER_LINE = '\u200B'
const IMAGE_LAYOUT_SPACER_LINES = 7
const PROTECTED_SELECTION_SHIELD_MS = 240
const PROGRAMMATIC_SELECTION_LOCK_MS = 1200
type FocusContentOptions = { forceKeyboard?: boolean; targetTextLength?: number }
const IMAGE_LAYOUT_SPACER_BLOCK = Array.from(
  { length: IMAGE_LAYOUT_SPACER_LINES },
  () => IMAGE_LAYOUT_SPACER_LINE,
).join('\n')

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

const editorImageUriMap = new Map<string, string>()

const createImageId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const registerEditorImageUri = (uri: string) => {
  const imageId = createImageId()
  editorImageUriMap.set(imageId, uri)
  return imageId
}

const createImageEditorLineFromUri = (uri: string) => `@@image:${registerEditorImageUri(uri)}@@`

const getImageUriFromEditorLine = (line: string) => {
  const markdownUri = getImageUriFromMarkdownLine(line)
  if (markdownUri) {
    return markdownUri
  }
  const imageId = IMAGE_EDITOR_RECOVERABLE_LINE.exec(line.trim())?.[1]
  return imageId ? editorImageUriMap.get(imageId) : undefined
}

const createImageEditorBlock = (asset: Asset) => {
  if (!asset.uri) {
    return ''
  }
  return `${createImageEditorLineFromUri(asset.uri)}\n${IMAGE_LAYOUT_SPACER_BLOCK}`
}

const serializeEditorImageLine = (line: string) => {
  const imageUri = getImageUriFromEditorLine(line)
  if (!imageUri) {
    return line
  }
  const markdownLine = getImageUriFromMarkdownLine(line) ? line : `![图片](${imageUri})`
  return markdownLine
}

const isImageLayoutSpacerLine = (line: string) => line === IMAGE_LAYOUT_SPACER_LINE

const isImageEditorTokenLikeLine = (line: string) => IMAGE_EDITOR_TOKEN_LIKE_LINE.test(line.trim())

const isCompleteImageEditorLine = (line: string) => IMAGE_EDITOR_LINE.test(line.trim())

const isUnsafeImageEditorLine = (line: string) =>
  isImageEditorTokenLikeLine(line) &&
  (!isCompleteImageEditorLine(line) || !getImageUriFromEditorLine(line))

const LiveMarkdownImageBlock = React.memo(({ uri }: { uri: string }) => {
  const source = useMemo(() => ({ uri }), [uri])

  return (
    <View style={styles.liveMarkdownImageBlock} collapsable={false}>
      <Image source={source} style={styles.liveMarkdownImage} resizeMode="cover" fadeDuration={0} />
    </View>
  )
})
LiveMarkdownImageBlock.displayName = 'LiveMarkdownImageBlock'

const normalizeSelection = (selection: TextSelection, max: number): TextSelection => {
  const start = Math.max(0, Math.min(selection.start, max))
  const end = Math.max(0, Math.min(selection.end, max))
  return start <= end ? { start, end } : { start: end, end: start }
}

const areTextSelectionsEqual = (left: TextSelection, right: TextSelection) =>
  left.start === right.start && left.end === right.end

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

const getNextLineRange = (text: string, lineRange: TextSelection): TextSelection | null => {
  if (lineRange.end >= text.length || text[lineRange.end] !== '\n') {
    return null
  }
  const nextStart = lineRange.end + 1
  const nextNewline = text.indexOf('\n', nextStart)
  return { start: nextStart, end: nextNewline === -1 ? text.length : nextNewline }
}

const getPreviousLineRange = (text: string, lineRange: TextSelection): TextSelection | null => {
  if (lineRange.start <= 0 || text[lineRange.start - 1] !== '\n') {
    return null
  }
  const previousEnd = lineRange.start - 1
  const previousStart = text.lastIndexOf('\n', Math.max(0, previousEnd - 1)) + 1
  return { start: previousStart, end: previousEnd }
}

const getImageLayoutBlockStartLine = (text: string, lineRange: TextSelection) => {
  const lineText = getLineText(text, lineRange)
  if (getImageUriFromEditorLine(lineText) || isImageEditorTokenLikeLine(lineText)) {
    return lineRange
  }
  if (!isImageLayoutSpacerLine(lineText)) {
    return null
  }

  let current: TextSelection | null = lineRange
  while (current) {
    const previous = getPreviousLineRange(text, current)
    if (!previous) {
      return null
    }
    const previousText = getLineText(text, previous)
    if (getImageUriFromEditorLine(previousText) || isImageEditorTokenLikeLine(previousText)) {
      return previous
    }
    if (!isImageLayoutSpacerLine(previousText)) {
      return null
    }
    current = previous
  }
  return null
}

const getImageLayoutBlockEndLine = (text: string, imageLineRange: TextSelection) => {
  let current = imageLineRange
  let next = getNextLineRange(text, current)
  while (next && isImageLayoutSpacerLine(getLineText(text, next))) {
    current = next
    next = getNextLineRange(text, current)
  }
  return current
}

const getCursorAfterImageLayoutBlock = (text: string, imageLineRange: TextSelection) => {
  const blockEndLine = getImageLayoutBlockEndLine(text, imageLineRange)
  const next = getNextLineRange(text, blockEndLine)
  return next ? next.start : blockEndLine.end
}

const getProtectedLayoutRange = (text: string, lineRange: TextSelection) => {
  const imageLineRange = getImageLayoutBlockStartLine(text, lineRange)
  if (imageLineRange) {
    return {
      start: imageLineRange.start,
      end: getCursorAfterImageLayoutBlock(text, imageLineRange),
    }
  }

  if (getLineText(text, lineRange) === DIVIDER_TEXT) {
    return {
      start: lineRange.start,
      end:
        lineRange.end < text.length && text[lineRange.end] === '\n'
          ? lineRange.end + 1
          : lineRange.end,
    }
  }

  return null
}

const findProtectedLayoutRangeInSelection = (text: string, selection: TextSelection) => {
  if (selection.start === selection.end) {
    return null
  }

  let position = 0
  while (position <= text.length) {
    const lineRange = getCurrentLineRange(text, position)
    const protectedRange = getProtectedLayoutRange(text, lineRange)
    if (
      protectedRange &&
      protectedRange.end > selection.start &&
      protectedRange.start < selection.end
    ) {
      return protectedRange
    }

    const nextPosition = protectedRange
      ? protectedRange.end
      : lineRange.end < text.length && text[lineRange.end] === '\n'
      ? lineRange.end + 1
      : text.length + 1
    if (nextPosition <= position) {
      position += 1
    } else {
      position = nextPosition
    }
  }

  return null
}

const snapExpandedSelectionAwayFromProtectedLayout = (selection: TextSelection, text: string) => {
  let snapped = selection

  for (let guard = 0; guard < 16; guard += 1) {
    const protectedRange = findProtectedLayoutRangeInSelection(text, snapped)
    if (!protectedRange) {
      return snapped
    }

    const hasEditableTextBefore = snapped.start < protectedRange.start
    const hasEditableTextAfter = snapped.end > protectedRange.end
    let nextSelection: TextSelection

    if (hasEditableTextBefore && !hasEditableTextAfter) {
      nextSelection = { start: snapped.start, end: protectedRange.start }
    } else if (!hasEditableTextBefore && hasEditableTextAfter) {
      nextSelection = { start: protectedRange.end, end: snapped.end }
    } else if (hasEditableTextBefore && hasEditableTextAfter) {
      const beforeLength = protectedRange.start - snapped.start
      const afterLength = snapped.end - protectedRange.end
      nextSelection =
        beforeLength >= afterLength
          ? { start: snapped.start, end: protectedRange.start }
          : { start: protectedRange.end, end: snapped.end }
    } else {
      nextSelection = { start: protectedRange.end, end: protectedRange.end }
    }

    if (nextSelection.start === snapped.start && nextSelection.end === snapped.end) {
      return nextSelection
    }
    snapped = nextSelection
  }

  return { start: snapped.start, end: snapped.start }
}

const isSelectionTouchingProtectedLayout = (text: string, selection: TextSelection) => {
  const normalized = normalizeSelection(selection, text.length)
  if (normalized.start !== normalized.end) {
    return !!findProtectedLayoutRangeInSelection(text, normalized)
  }

  return !!getProtectedLayoutRange(text, getCurrentLineRange(text, normalized.start))
}

const isProtectedLayoutBoundaryLine = (line: string) =>
  isImageLayoutSpacerLine(line) ||
  !!getImageUriFromEditorLine(line) ||
  isImageEditorTokenLikeLine(line) ||
  line === DIVIDER_TEXT

const getEditableBoundaryBeforeProtectedLine = (text: string, lineRange: TextSelection) => {
  if (lineRange.start <= 0) {
    return null
  }

  const previousLineRange = getPreviousLineRange(text, lineRange)
  if (!previousLineRange) {
    return null
  }

  const previousLine = getLineText(text, previousLineRange)
  if (isProtectedLayoutBoundaryLine(previousLine)) {
    return null
  }

  if (previousLineRange.start === previousLineRange.end) {
    return { start: previousLineRange.start, end: previousLineRange.start }
  }

  return { start: lineRange.start, end: lineRange.start }
}

const snapSelectionAwayFromProtectedLayout = (
  selection: TextSelection,
  text: string,
  options?: { forceProtectedSnap?: boolean },
) => {
  const normalized = normalizeSelection(selection, text.length)
  if (normalized.start !== normalized.end) {
    return snapExpandedSelectionAwayFromProtectedLayout(normalized, text)
  }
  const lineRange = getCurrentLineRange(text, normalized.start)
  const imageLineRange = getImageLayoutBlockStartLine(text, lineRange)
  if (imageLineRange) {
    if (!options?.forceProtectedSnap && normalized.start === lineRange.start) {
      const boundarySelection = getEditableBoundaryBeforeProtectedLine(text, lineRange)
      if (boundarySelection) {
        return boundarySelection
      }
    }

    const cursor = getCursorAfterImageLayoutBlock(text, imageLineRange)
    return { start: cursor, end: cursor }
  }
  if (getLineText(text, lineRange) === DIVIDER_TEXT) {
    if (!options?.forceProtectedSnap && normalized.start === lineRange.start) {
      const boundarySelection = getEditableBoundaryBeforeProtectedLine(text, lineRange)
      if (boundarySelection) {
        return boundarySelection
      }
    }

    const cursor =
      lineRange.end < text.length && text[lineRange.end] === '\n'
        ? lineRange.end + 1
        : lineRange.end
    return { start: cursor, end: cursor }
  }
  return normalized
}

const isProtectedLayoutLineBeforeCaret = (line: string) =>
  isImageLayoutSpacerLine(line) || line === DIVIDER_TEXT

const shouldRenderProtectedLayoutSafeCaret = (text: string, selection: TextSelection) => {
  const normalized = normalizeSelection(selection, text.length)
  if (normalized.start !== normalized.end) {
    return false
  }
  const lineRange = getCurrentLineRange(text, normalized.start)
  if (lineRange.start !== lineRange.end || lineRange.start !== normalized.start) {
    return false
  }
  const previous = getPreviousLineRange(text, lineRange)
  return !!previous && isProtectedLayoutLineBeforeCaret(getLineText(text, previous))
}

const findImageLineAtPositions = (text: string, positions: number[]): TextSelection | null => {
  for (const position of positions) {
    const lineRange = getCurrentLineRange(text, position)
    const imageLineRange = getImageLayoutBlockStartLine(text, lineRange)
    if (imageLineRange) {
      return imageLineRange
    }
  }
  return null
}

const findImageLineInDeletedRange = (
  text: string,
  start: number,
  end: number,
): TextSelection | null => {
  let position = Math.max(0, Math.min(start, text.length))
  const safeEnd = Math.max(position, Math.min(end, text.length))
  while (position < safeEnd) {
    const lineRange = getCurrentLineRange(text, position)
    const imageLineRange = getImageLayoutBlockStartLine(text, lineRange)
    if (imageLineRange) {
      return imageLineRange
    }
    position = Math.max(position + 1, lineRange.end + 1)
  }
  return null
}

const findUnsafeImageEditorLine = (text: string): TextSelection | null => {
  const lines = text.split('\n')
  let offset = 0
  for (const line of lines) {
    if (isUnsafeImageEditorLine(line)) {
      return { start: offset, end: offset + line.length }
    }
    offset += line.length + 1
  }
  return null
}

const getPreviousImageLineAtLineStart = (text: string, lineRange: TextSelection) => {
  const previous = getPreviousLineRange(text, lineRange)
  return previous ? getImageLayoutBlockStartLine(text, previous) : null
}

const getImageLineForBackspace = (text: string, selection: TextSelection) => {
  const normalized = normalizeSelection(selection, text.length)
  if (normalized.start !== normalized.end) {
    return findImageLineAtPositions(text, [normalized.start, normalized.end])
  }
  const lineRange = getCurrentLineRange(text, normalized.start)
  return (
    getImageLayoutBlockStartLine(text, lineRange) ??
    (lineRange.start === normalized.start ? getPreviousImageLineAtLineStart(text, lineRange) : null)
  )
}

const getImageLayoutBlockRemovalRange = (text: string, imageLineRange: TextSelection) => {
  const blockEndLine = getImageLayoutBlockEndLine(text, imageLineRange)
  if (blockEndLine.end < text.length && text[blockEndLine.end] === '\n') {
    return { start: imageLineRange.start, end: blockEndLine.end + 1, cursor: imageLineRange.start }
  }
  if (imageLineRange.start > 0 && text[imageLineRange.start - 1] === '\n') {
    return {
      start: imageLineRange.start - 1,
      end: blockEndLine.end,
      cursor: imageLineRange.start - 1,
    }
  }
  return { start: imageLineRange.start, end: blockEndLine.end, cursor: imageLineRange.start }
}

const getImagePreviewStateForLine = (text: string, targetImageLine: TextSelection) => {
  const imageUris: string[] = []
  let targetIndex = -1
  let offset = 0

  text.split('\n').forEach(line => {
    const imageUri = getImageUriFromEditorLine(line)
    if (imageUri) {
      if (offset === targetImageLine.start) {
        targetIndex = imageUris.length
      }
      imageUris.push(imageUri)
    }
    offset += line.length + 1
  })

  if (targetIndex < 0 || imageUris.length <= 0) {
    return null
  }

  return { uris: imageUris, index: targetIndex }
}

const findDividerLineInDeletedRange = (
  text: string,
  start: number,
  end: number,
): TextSelection | null => {
  let position = Math.max(0, Math.min(start, text.length))
  const safeEnd = Math.max(position, Math.min(end, text.length))
  while (position < safeEnd) {
    const lineRange = getCurrentLineRange(text, position)
    if (getLineText(text, lineRange) === DIVIDER_TEXT) {
      return lineRange
    }
    position = Math.max(position + 1, lineRange.end + 1)
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
  const lines = normalizeLegacyToolbarMarkup(markdown).replace(/\n/g, '\n').split('\n')
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
    const imageUri = getImageUriFromEditorLine(line)
    if (imageUri) {
      textParts.push(createImageEditorLineFromUri(imageUri))
      if (IMAGE_LAYOUT_SPACER_BLOCK) {
        textParts.push('\n', IMAGE_LAYOUT_SPACER_BLOCK)
      }
      if (lineIndex < lines.length - 1) {
        textParts.push('\n')
      }
      continue
    }
    if (isImageLayoutSpacerLine(line)) {
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
  const outputLines: string[] = []
  let offset = 0
  let orderedIndex = 1

  lines.forEach(line => {
    const lineStart = offset
    const lineEnd = lineStart + line.length
    const effectiveEnd = Math.max(lineEnd, lineStart + 1)
    offset = lineEnd + 1

    if (isImageLayoutSpacerLine(line)) {
      return
    }

    const imageUri = getImageUriFromEditorLine(line)
    if (imageUri) {
      outputLines.push(serializeEditorImageLine(line))
      return
    }
    if (isImageEditorTokenLikeLine(line)) {
      return
    }

    let output =
      line === DIVIDER_TEXT
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
    outputLines.push(output)
  })

  return outputLines.join('\n')
}

const countContentChars = (text: string) =>
  text
    .split('\n')
    .filter(
      line =>
        !isImageLayoutSpacerLine(line) &&
        !getImageUriFromEditorLine(line) &&
        !isImageEditorTokenLikeLine(line),
    )
    .join('\n')
    .replace(/\s/g, '').length

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const getRecord = (value: unknown, key: string) => {
  if (!isRecord(value)) {
    return null
  }
  const nested = value[key]
  return isRecord(nested) ? nested : null
}

const getString = (value: unknown, key: string) => {
  if (!isRecord(value)) {
    return ''
  }
  const nested = value[key]
  return typeof nested === 'string' ? nested.trim() : ''
}

const getNumber = (value: unknown, key: string) => {
  if (!isRecord(value)) {
    return null
  }
  const nested = value[key]
  if (typeof nested === 'number' && Number.isFinite(nested)) {
    return nested
  }
  if (typeof nested === 'string') {
    const parsed = Number(nested)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const buildQuery = (params: Record<string, string | number>) =>
  Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')

const fetchJsonWithTimeout = async (url: string, timeoutMs: number, init?: RequestInit) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('请求超时，请稍后重试')), timeoutMs)
  })

  try {
    const response = await Promise.race([fetch(url, init), timeoutPromise])
    if (!response.ok) {
      throw new Error(`请求失败：${response.status}`)
    }
    return (await response.json()) as unknown
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

const normalizeLocationPart = (part: string) => {
  const trimmed = part.trim()
  if (trimmed === '中国') {
    return ''
  }
  return trimmed.startsWith('中国') ? trimmed.slice(2) : trimmed
}

const uniqueLocationParts = (parts: string[]) => {
  const result: string[] = []
  parts.forEach(part => {
    const trimmed = normalizeLocationPart(part)
    if (!trimmed || result.includes(trimmed)) {
      return
    }
    result.push(trimmed)
  })
  return result
}

const formatAddressLabel = (parts: string[], nearbyParts: string[] = []) => {
  const core = uniqueLocationParts(parts).join('')
  const nearby = uniqueLocationParts(nearbyParts).join('')
  if (core && nearby && !core.includes(nearby)) {
    return `${core} 靠近${nearby}`
  }
  return core || nearby
}

const transformLatitude = (x: number, y: number) => {
  let ret = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
  ret += ((20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2) / 3
  ret += ((20 * Math.sin(y * Math.PI) + 40 * Math.sin((y / 3) * Math.PI)) * 2) / 3
  ret += ((160 * Math.sin((y / 12) * Math.PI) + 320 * Math.sin((y * Math.PI) / 30)) * 2) / 3
  return ret
}

const transformLongitude = (x: number, y: number) => {
  let ret = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
  ret += ((20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2) / 3
  ret += ((20 * Math.sin(x * Math.PI) + 40 * Math.sin((x / 3) * Math.PI)) * 2) / 3
  ret += ((150 * Math.sin((x / 12) * Math.PI) + 300 * Math.sin((x / 30) * Math.PI)) * 2) / 3
  return ret
}

const isInMainlandChina = ({ latitude, longitude }: Coordinates) =>
  longitude >= 72.004 && longitude <= 137.8347 && latitude >= 0.8293 && latitude <= 55.8271

const toCaiyunCoordinates = (coords: Coordinates): Coordinates => {
  if (!isInMainlandChina(coords)) {
    return coords
  }

  const x = coords.longitude - 105
  const y = coords.latitude - 35
  const a = 6378245.0
  const ee = 0.006693421622965943
  let dLat = transformLatitude(x, y)
  let dLon = transformLongitude(x, y)
  const radLat = (coords.latitude / 180) * Math.PI
  let magic = Math.sin(radLat)
  magic = 1 - ee * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  dLat = (dLat * 180) / (((a * (1 - ee)) / (magic * sqrtMagic)) * Math.PI)
  dLon = (dLon * 180) / ((a / sqrtMagic) * Math.cos(radLat) * Math.PI)
  return {
    ...coords,
    latitude: coords.latitude + dLat,
    longitude: coords.longitude + dLon,
  }
}

const parseBigDataCloudAddress = (payload: unknown) => {
  const label = formatAddressLabel(
    [
      getString(payload, 'principalSubdivision'),
      getString(payload, 'city'),
      getString(payload, 'locality'),
    ],
    [getString(payload, 'localityName')],
  )
  if (label) {
    return label
  }

  const localityInfo = getRecord(payload, 'localityInfo')
  const administrative = isRecord(localityInfo) ? localityInfo.administrative : null
  if (!Array.isArray(administrative)) {
    return ''
  }

  return formatAddressLabel(
    administrative
      .map(item => getString(item, 'name'))
      .filter(Boolean)
      .slice(-4),
  )
}

const parseNominatimAddress = (payload: unknown) => {
  const address = getRecord(payload, 'address')
  if (address) {
    const label = formatAddressLabel(
      [
        getString(address, 'state'),
        getString(address, 'city') || getString(address, 'town') || getString(address, 'county'),
        getString(address, 'city_district') || getString(address, 'district'),
        getString(address, 'suburb') || getString(address, 'neighbourhood'),
        getString(address, 'road'),
      ],
      [
        getString(address, 'amenity'),
        getString(address, 'building'),
        getString(address, 'house_number'),
      ],
    )
    if (label) {
      return label
    }
  }
  return getString(payload, 'display_name')
}

const reverseGeocodeAddress = async (coords: Coordinates) => {
  const providers = [
    async () => {
      const payload = await fetchJsonWithTimeout(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?${buildQuery({
          latitude: coords.latitude,
          longitude: coords.longitude,
          localityLanguage: 'zh',
        })}`,
        REVERSE_GEOCODE_TIMEOUT_MS,
      )
      return parseBigDataCloudAddress(payload)
    },
    async () => {
      const payload = await fetchJsonWithTimeout(
        `https://nominatim.openstreetmap.org/reverse?${buildQuery({
          format: 'jsonv2',
          lat: coords.latitude,
          lon: coords.longitude,
          'accept-language': 'zh-CN',
        })}`,
        REVERSE_GEOCODE_TIMEOUT_MS,
        {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'ShiguangDiary/1.0',
          },
        },
      )
      return parseNominatimAddress(payload)
    },
  ]

  for (const provider of providers) {
    try {
      const label = await provider()
      if (label) {
        return label
      }
    } catch (_err) {}
  }

  return '当前位置已获取，地址解析失败'
}

const getIpLocation = async (): Promise<ResolvedLocation> => {
  const providers = [
    async () => {
      const payload = await fetchJsonWithTimeout(
        'https://ipwho.is/?lang=zh-CN',
        IP_LOCATION_TIMEOUT_MS,
      )
      if (isRecord(payload) && payload.success === false) {
        throw new Error(getString(payload, 'message') || 'IP 定位失败')
      }
      const latitude = getNumber(payload, 'latitude')
      const longitude = getNumber(payload, 'longitude')
      if (latitude === null || longitude === null) {
        throw new Error('IP 定位结果无效')
      }
      return {
        coords: { latitude, longitude },
        label: formatAddressLabel([
          getString(payload, 'country'),
          getString(payload, 'region'),
          getString(payload, 'city'),
        ]),
      }
    },
    async () => {
      const payload = await fetchJsonWithTimeout('https://ipapi.co/json/', IP_LOCATION_TIMEOUT_MS)
      const latitude = getNumber(payload, 'latitude')
      const longitude = getNumber(payload, 'longitude')
      if (latitude === null || longitude === null) {
        throw new Error('IP 定位结果无效')
      }
      return {
        coords: { latitude, longitude },
        label: formatAddressLabel([
          getString(payload, 'country_name'),
          getString(payload, 'region'),
          getString(payload, 'city'),
        ]),
      }
    },
  ]

  let lastError: unknown = null
  for (const provider of providers) {
    try {
      const result = await provider()
      const reverseLabel = await reverseGeocodeAddress(result.coords)
      return {
        coords: result.coords,
        label: reverseLabel || result.label || '网络位置已获取',
        source: 'ip',
      }
    } catch (err) {
      lastError = err
    }
  }

  throw lastError instanceof Error ? lastError : new Error('IP 定位失败')
}

const SKYCON_LABELS: Record<string, string> = {
  CLEAR_DAY: '晴',
  CLEAR_NIGHT: '晴',
  PARTLY_CLOUDY_DAY: '多云',
  PARTLY_CLOUDY_NIGHT: '多云',
  CLOUDY: '阴',
  LIGHT_HAZE: '轻度雾霾',
  MODERATE_HAZE: '中度雾霾',
  HEAVY_HAZE: '重度雾霾',
  LIGHT_RAIN: '小雨',
  MODERATE_RAIN: '中雨',
  HEAVY_RAIN: '大雨',
  STORM_RAIN: '暴雨',
  FOG: '雾',
  LIGHT_SNOW: '小雪',
  MODERATE_SNOW: '中雪',
  HEAVY_SNOW: '大雪',
  STORM_SNOW: '暴雪',
  DUST: '浮尘',
  SAND: '沙尘',
  WIND: '大风',
}

const formatCaiyunRealtimeWeather = (payload: unknown) => {
  const status = getString(payload, 'status').toLowerCase()
  if (status && status !== 'ok') {
    throw new Error('天气接口返回异常')
  }
  const result = getRecord(payload, 'result')
  const realtime = getRecord(result, 'realtime')
  if (!realtime) {
    throw new Error('天气数据为空')
  }

  const skycon = getString(realtime, 'skycon')
  const skyconLabel = SKYCON_LABELS[skycon] ?? '天气'
  const temperature = getNumber(realtime, 'temperature')
  const airQuality = getRecord(realtime, 'air_quality')
  const aqi = getRecord(airQuality, 'aqi')
  const aqiChn = getNumber(aqi, 'chn')
  const weatherText =
    temperature === null ? skyconLabel : `${skyconLabel} ${Math.round(temperature)}℃`
  return aqiChn === null ? weatherText : `${weatherText} AQI ${Math.round(aqiChn)}`
}

const fetchCaiyunRealtimeWeather = async (coords: Coordinates) => {
  const caiyunCoords = toCaiyunCoordinates(coords)
  const payload = await fetchJsonWithTimeout(
    `${CAIYUN_API_BASE}/${caiyunCoords.longitude},${caiyunCoords.latitude}/realtime`,
    WEATHER_TIMEOUT_MS,
  )
  return formatCaiyunRealtimeWeather(payload)
}

const getCurrentPositionAsync = (options: GeolocationOptions) =>
  new Promise<GeolocationResponse>((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, options)
  })

const isGeolocationError = (error: unknown): error is GeolocationError =>
  typeof error === 'object' && error !== null && 'code' in error && 'message' in error

const isPermissionDeniedLocationError = (error: unknown) =>
  isGeolocationError(error) && error.code === error.PERMISSION_DENIED

const getLocationErrorMessage = (error: unknown) => {
  if (isPermissionDeniedLocationError(error)) {
    return '定位权限未开启，请在系统设置中允许定位'
  }
  if (isGeolocationError(error)) {
    if (error.code === error.TIMEOUT) {
      return '定位超时，请确认 GPS 或网络定位已开启后重试'
    }
    if (error.code === error.POSITION_UNAVAILABLE) {
      return '暂时无法获取当前位置，请检查 GPS 或网络定位'
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }
  return '定位失败，请检查定位权限、GPS 或网络定位'
}

export const DiaryEditScreen: React.FC<DiaryEditScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets()
  const windowDimensions = useWindowDimensions()
  const { id } = route.params
  const isNew = !id

  const editor = useEditor(id ?? null)
  const { title, content, hydrated, saving, error, setTitle, setContent, save, exit, discard } =
    editor

  const [plainText, setPlainText] = useState('')
  const [formatRanges, setFormatRanges] = useState<FormatRange[]>([])
  const [activeFormatState, setActiveFormatState] = useState<FormatState>({})
  const [contentSelection, setContentSelection] = useState<TextSelection>(DEFAULT_SELECTION)
  const [imagePreview, setImagePreview] = useState<ImagePreviewState | null>(null)
  const [imageActionTarget, setImageActionTarget] = useState<ImageActionTarget | null>(null)
  const [imageActionSheetVisible, setImageActionSheetVisible] = useState(false)
  const [contentSelectionShielded, setContentSelectionShielded] = useState(false)
  const previewScrollRef = useRef<ScrollView>(null)
  const imageInteractionTranslateYRef = useRef(new Animated.Value(0))
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
  const [fakeCaretVisible, setFakeCaretVisible] = useState(true)
  const keyboardVisibleRef = useRef(false)
  const plainTextLengthRef = useRef(0)
  const pendingContentFocusRef = useRef<{
    selection: TextSelection
    options?: FocusContentOptions
  } | null>(null)
  const [exitSheetVisible, setExitSheetVisible] = useState(false)
  const [locationLabel, setLocationLabel] = useState(DEFAULT_LOCATION)
  const [weatherLabel, setWeatherLabel] = useState(DEFAULT_WEATHER)
  const [locating, setLocating] = useState(false)
  const [weatherLoading, setWeatherLoading] = useState(false)
  plainTextLengthRef.current = plainText.length
  const lastLocationRef = useRef<Coordinates | null>(null)
  const allowLeaveRef = useRef(false)
  const contentPressInAtRef = useRef(0)
  const suppressNextEditorFocusRef = useRef(false)
  const programmaticContentSelectionRef = useRef<{
    selection: TextSelection
    until: number
  } | null>(null)
  const contentSelectionShieldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const imagePreviewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const imagePreviewKeyboardHideRef = useRef<ReturnType<typeof Keyboard.addListener> | null>(null)
  const headerTime = useMemo(() => formatHeaderTime(new Date()), [])
  const hasEditableContent = useCallback(() => {
    if (!hydrated) {
      return true
    }
    const textWithoutLayoutSpacers = plainText
      .split('\n')
      .filter(line => !isImageLayoutSpacerLine(line) && !isImageEditorTokenLikeLine(line))
      .join('\n')
    return (
      title.trim().length > 0 ||
      textWithoutLayoutSpacers.trim().length > 0 ||
      plainText.split('\n').some(line => !!getImageUriFromEditorLine(line))
    )
  }, [hydrated, plainText, title])

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      keyboardVisibleRef.current = true
      setKeyboardVisible(true)
    })
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      keyboardVisibleRef.current = false
      setKeyboardVisible(false)
    })
    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  useEffect(() => {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
      locationProvider: 'auto',
    })
  }, [])

  useEffect(
    () => () => {
      if (imagePreviewTimerRef.current) {
        clearTimeout(imagePreviewTimerRef.current)
      }
      imagePreviewKeyboardHideRef.current?.remove()
      if (contentSelectionShieldTimerRef.current) {
        clearTimeout(contentSelectionShieldTimerRef.current)
      }
      programmaticContentSelectionRef.current = null
    },
    [],
  )

  useEffect(
    () =>
      navigation.addListener('beforeRemove', event => {
        if (allowLeaveRef.current) {
          return
        }
        if (!hasEditableContent()) {
          allowLeaveRef.current = true
          discard()
          return
        }
        event.preventDefault()
        Keyboard.dismiss()
        setExitSheetVisible(true)
      }),
    [discard, hasEditableContent, navigation],
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
    if (!hasEditableContent()) {
      allowLeaveRef.current = true
      discard()
      navigation.goBack()
      return
    }
    setExitSheetVisible(true)
  }, [discard, hasEditableContent, navigation])

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

    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ])
    return (
      granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED ||
      granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED
    )
  }, [])

  const resolveCurrentLocation = useCallback(async (): Promise<ResolvedLocation> => {
    let nativeLocationError: unknown = null
    const hasPermission = await requestLocationPermission()

    if (hasPermission) {
      try {
        const position = await getCurrentPositionAsync({
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 60000,
        })
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }
        return {
          coords,
          label: await reverseGeocodeAddress(coords),
          source: 'gps',
        }
      } catch (primaryError) {
        nativeLocationError = primaryError
        if (!isPermissionDeniedLocationError(primaryError)) {
          try {
            const position = await getCurrentPositionAsync({
              enableHighAccuracy: false,
              timeout: 20000,
              maximumAge: 300000,
            })
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            }
            return {
              coords,
              label: await reverseGeocodeAddress(coords),
              source: 'network',
            }
          } catch (secondaryError) {
            nativeLocationError = secondaryError
          }
        }
      }
    }

    try {
      return await getIpLocation()
    } catch (ipError) {
      if (nativeLocationError) {
        throw nativeLocationError
      }
      if (!hasPermission) {
        throw new Error('未授予定位权限，且暂时无法通过 IP 获取位置')
      }
      throw ipError
    }
  }, [requestLocationPermission])

  const handleFetchLocation = useCallback(async () => {
    if (locating) {
      return
    }

    setLocating(true)
    setLocationLabel(LOCATING_LOCATION)

    try {
      const location = await resolveCurrentLocation()
      lastLocationRef.current = location.coords
      setLocationLabel(location.label)
      toast.success(location.source === 'ip' ? '已通过网络获取当前位置' : '已获取当前位置')
    } catch (err) {
      setLocationLabel(DEFAULT_LOCATION)
      toast.error(getLocationErrorMessage(err))
    } finally {
      setLocating(false)
    }
  }, [locating, resolveCurrentLocation])

  const handleFetchWeather = useCallback(async () => {
    if (weatherLoading || locating) {
      return
    }

    setWeatherLoading(true)
    setWeatherLabel(FETCHING_WEATHER)

    try {
      let coords = lastLocationRef.current
      if (!coords) {
        setLocating(true)
        setLocationLabel(LOCATING_LOCATION)
        const location = await resolveCurrentLocation()
        coords = location.coords
        lastLocationRef.current = location.coords
        setLocationLabel(location.label)
      }

      const weather = await fetchCaiyunRealtimeWeather(coords)
      setWeatherLabel(weather)
      toast.success('已获取当前天气')
    } catch (err) {
      setWeatherLabel(current => (current === FETCHING_WEATHER ? DEFAULT_WEATHER : current))
      toast.error(
        err instanceof Error && err.message.trim() ? err.message : '获取天气失败，请稍后重试',
      )
    } finally {
      setLocating(false)
      setWeatherLoading(false)
    }
  }, [locating, resolveCurrentLocation, weatherLoading])

  const handleContentPressIn = useCallback(() => {
    contentPressInAtRef.current = Date.now()
  }, [])

  const shieldContentSelectionHighlight = useCallback(() => {
    if (contentSelectionShieldTimerRef.current) {
      clearTimeout(contentSelectionShieldTimerRef.current)
    }
    setContentSelectionShielded(true)
    contentSelectionShieldTimerRef.current = setTimeout(() => {
      contentSelectionShieldTimerRef.current = null
      setContentSelectionShielded(false)
    }, PROTECTED_SELECTION_SHIELD_MS)
  }, [])

  const revealContentSelectionHighlight = useCallback(() => {
    if (contentSelectionShieldTimerRef.current) {
      clearTimeout(contentSelectionShieldTimerRef.current)
      contentSelectionShieldTimerRef.current = null
    }
    setContentSelectionShielded(false)
  }, [])

  const openImagePreview = useCallback((previewState: ImagePreviewRequest) => {
    if (imagePreviewTimerRef.current) {
      clearTimeout(imagePreviewTimerRef.current)
      imagePreviewTimerRef.current = null
    }
    imagePreviewKeyboardHideRef.current?.remove()
    imagePreviewKeyboardHideRef.current = null

    const wasKeyboardVisible = keyboardVisibleRef.current
    contentInputRef.current?.blur()
    Keyboard.dismiss()

    const showPreview = () => {
      if (imagePreviewTimerRef.current) {
        clearTimeout(imagePreviewTimerRef.current)
        imagePreviewTimerRef.current = null
      }
      imagePreviewKeyboardHideRef.current?.remove()
      imagePreviewKeyboardHideRef.current = null
      requestAnimationFrame(() => {
        setImagePreview({ ...previewState, openedAt: Date.now() })
      })
    }

    if (wasKeyboardVisible) {
      imagePreviewKeyboardHideRef.current = Keyboard.addListener('keyboardDidHide', () => {
        keyboardVisibleRef.current = false
        setKeyboardVisible(false)
        if (imagePreviewTimerRef.current) {
          clearTimeout(imagePreviewTimerRef.current)
        }
        imagePreviewTimerRef.current = setTimeout(showPreview, 80)
      })
      imagePreviewTimerRef.current = setTimeout(showPreview, 1100)
      return
    }

    imagePreviewTimerRef.current = setTimeout(showPreview, 120)
  }, [])

  const openImageActions = useCallback(
    (imageLineRange: TextSelection) => {
      const previewState = getImagePreviewStateForLine(plainText, imageLineRange)
      if (!previewState) {
        return
      }

      suppressNextEditorFocusRef.current = true
      contentPressInAtRef.current = 0
      contentInputRef.current?.blur()
      Keyboard.dismiss()
      setImageActionTarget({ lineStart: imageLineRange.start, previewState })
      setImageActionSheetVisible(true)
    },
    [plainText],
  )

  const handleContentSelectionChange = useCallback(
    (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      const rawSelection = normalizeSelection(event.nativeEvent.selection, plainText.length)
      const pendingProgrammaticSelection = programmaticContentSelectionRef.current
      if (pendingProgrammaticSelection) {
        if (Date.now() <= pendingProgrammaticSelection.until) {
          if (!areTextSelectionsEqual(rawSelection, pendingProgrammaticSelection.selection)) {
            contentInputRef.current?.setNativeProps({
              selection: pendingProgrammaticSelection.selection,
            })
            return
          }
        } else {
          programmaticContentSelectionRef.current = null
        }
      }

      if (isSelectionTouchingProtectedLayout(plainText, rawSelection)) {
        shieldContentSelectionHighlight()
      } else {
        revealContentSelectionHighlight()
      }
      const imageLineRange =
        rawSelection.start === rawSelection.end && Date.now() - contentPressInAtRef.current < 800
          ? getImageLayoutBlockStartLine(
              plainText,
              getCurrentLineRange(plainText, rawSelection.start),
            )
          : null

      if (imageLineRange) {
        openImageActions(imageLineRange)
        const selection = snapSelectionAwayFromProtectedLayout(rawSelection, plainText, {
          forceProtectedSnap: true,
        })
        contentInputRef.current?.setNativeProps({ selection })
        setContentSelection(selection)
        requestAnimationFrame(() => {
          contentInputRef.current?.setNativeProps({ selection })
        })
        return
      }

      const selection = snapSelectionAwayFromProtectedLayout(rawSelection, plainText)
      const snapped = selection.start !== rawSelection.start || selection.end !== rawSelection.end
      if (snapped) {
        contentInputRef.current?.setNativeProps({ selection })
      }
      setContentSelection(selection)
      if (snapped) {
        requestAnimationFrame(() => {
          contentInputRef.current?.setNativeProps({ selection })
          requestAnimationFrame(() => {
            contentInputRef.current?.setNativeProps({ selection })
          })
        })
      }
    },
    [openImageActions, plainText, revealContentSelectionHighlight, shieldContentSelectionHighlight],
  )

  const handleContentScroll = useCallback(
    (event: NativeSyntheticEvent<TextInputScrollEventData>) => {
      const y = event.nativeEvent.contentOffset.y
      previewScrollRef.current?.scrollTo({
        y,
        animated: false,
      })
      imageInteractionTranslateYRef.current.setValue(-y)
    },
    [],
  )

  const focusContentAtSelection = useCallback(
    (selection: TextSelection, options?: FocusContentOptions) => {
      const lockedSelection = { ...selection }
      const targetTextLength = options?.targetTextLength
      const shouldWaitForTextCommit =
        typeof targetTextLength === 'number' && plainTextLengthRef.current < targetTextLength
      const shouldResetAndroidFocus =
        Platform.OS === 'android' && options?.forceKeyboard && !keyboardVisibleRef.current
      suppressNextEditorFocusRef.current = false
      contentPressInAtRef.current = 0
      programmaticContentSelectionRef.current = {
        selection: lockedSelection,
        until: Date.now() + PROGRAMMATIC_SELECTION_LOCK_MS,
      }
      setContentSelection(lockedSelection)

      if (shouldWaitForTextCommit) {
        pendingContentFocusRef.current = {
          selection: lockedSelection,
          options: { ...options, targetTextLength: undefined },
        }
        return
      }

      const applySelection = () => {
        contentInputRef.current?.focus()
        contentInputRef.current?.setNativeProps({ selection: lockedSelection })
      }

      if (shouldResetAndroidFocus) {
        contentInputRef.current?.setNativeProps({ selection: lockedSelection })
        contentInputRef.current?.blur()
        Keyboard.dismiss()
      } else {
        applySelection()
      }

      requestAnimationFrame(() => {
        if (!shouldResetAndroidFocus) {
          applySelection()
        }
        requestAnimationFrame(applySelection)
      })
      const delayedSelectionRetries = shouldResetAndroidFocus
        ? [90, 180, 320, 520, 760, 1040]
        : [80, 180, 320, 520, 760]
      delayedSelectionRetries.forEach(delay => {
        setTimeout(applySelection, delay)
      })
      setTimeout(() => {
        if (
          programmaticContentSelectionRef.current &&
          areTextSelectionsEqual(programmaticContentSelectionRef.current.selection, lockedSelection)
        ) {
          programmaticContentSelectionRef.current = null
        }
      }, PROGRAMMATIC_SELECTION_LOCK_MS + 80)
    },
    [],
  )

  useEffect(() => {
    const pendingFocus = pendingContentFocusRef.current
    if (!pendingFocus) {
      return
    }
    const targetTextLength = pendingFocus.options?.targetTextLength
    if (typeof targetTextLength === 'number' && plainText.length < targetTextLength) {
      return
    }
    pendingContentFocusRef.current = null
    focusContentAtSelection(pendingFocus.selection, {
      ...pendingFocus.options,
      targetTextLength: undefined,
    })
  }, [focusContentAtSelection, plainText.length])

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
    (text: string, formats?: FormatTool[], focusOptions?: FocusContentOptions) => {
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
      const nextSelection = { start: cursor, end: cursor }
      syncRichDocument(nextText, nextRanges, nextSelection)
      focusContentAtSelection(nextSelection, { ...focusOptions, targetTextLength: nextText.length })
    },
    [
      activeFormatState,
      contentSelection,
      focusContentAtSelection,
      formatRanges,
      plainText,
      syncRichDocument,
    ],
  )

  const applyPlainTextEdit = useCallback(
    (
      start: number,
      end: number,
      insertedText: string,
      cursor: number,
      shouldFocus = true,
      focusOptions?: FocusContentOptions,
    ) => {
      const safeStart = Math.max(0, Math.min(start, plainText.length))
      const safeEnd = Math.max(safeStart, Math.min(end, plainText.length))
      const nextText = `${plainText.slice(0, safeStart)}${insertedText}${plainText.slice(safeEnd)}`
      const diff = {
        start: safeStart,
        previousEnd: safeEnd,
        nextEnd: safeStart + insertedText.length,
        insertedLength: insertedText.length,
      }
      const nextRanges = updateRangesForTextChange(formatRanges, diff, [], nextText.length)
      const safeCursor = Math.max(0, Math.min(cursor, nextText.length))
      const nextSelection = { start: safeCursor, end: safeCursor }
      syncRichDocument(nextText, nextRanges, nextSelection)

      if (shouldFocus) {
        focusContentAtSelection(nextSelection, {
          ...focusOptions,
          targetTextLength: nextText.length,
        })
      }
    },
    [focusContentAtSelection, formatRanges, plainText, syncRichDocument],
  )

  const getCurrentImageActionLine = useCallback(() => {
    if (!imageActionTarget) {
      return null
    }
    const lineRange = getCurrentLineRange(
      plainText,
      Math.max(0, Math.min(imageActionTarget.lineStart, plainText.length)),
    )
    const imageLineRange = getImageLayoutBlockStartLine(plainText, lineRange)
    if (!imageLineRange || imageLineRange.start !== imageActionTarget.lineStart) {
      return null
    }
    return getImageUriFromEditorLine(getLineText(plainText, imageLineRange)) ? imageLineRange : null
  }, [imageActionTarget, plainText])

  const handleCloseImageActions = useCallback(() => {
    setImageActionSheetVisible(false)
    setImageActionTarget(null)
  }, [])

  const handleViewActionImage = useCallback(() => {
    if (imageActionTarget) {
      openImagePreview(imageActionTarget.previewState)
    }
  }, [imageActionTarget, openImagePreview])

  const handleReplaceActionImage = useCallback(async () => {
    const imageLineRange = getCurrentImageActionLine()
    if (!imageLineRange) {
      toast.error('图片不存在或已被删除')
      return
    }

    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: false,
      })
      if (response.didCancel) {
        return
      }
      if (response.errorCode) {
        toast.error(response.errorMessage ?? '图片选择失败')
        return
      }

      const asset = response.assets?.find(item => !!item.uri)
      if (!asset?.uri) {
        toast.info('未选择图片')
        return
      }

      const blockEndLine = getImageLayoutBlockEndLine(plainText, imageLineRange)
      const hasFollowingNewline =
        blockEndLine.end < plainText.length && plainText[blockEndLine.end] === '\n'
      const replacement = createImageEditorBlock(asset)
      const replacementText = hasFollowingNewline ? replacement : `${replacement}\n`
      const cursor = imageLineRange.start + replacement.length + 1
      applyPlainTextEdit(imageLineRange.start, blockEndLine.end, replacementText, cursor)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '图片选择失败')
    }
  }, [applyPlainTextEdit, getCurrentImageActionLine, plainText])

  const handleDeleteActionImage = useCallback(() => {
    const imageLineRange = getCurrentImageActionLine()
    if (!imageLineRange) {
      toast.error('图片不存在或已被删除')
      return
    }

    const removalRange = getImageLayoutBlockRemovalRange(plainText, imageLineRange)
    applyPlainTextEdit(removalRange.start, removalRange.end, '', removalRange.cursor)
  }, [applyPlainTextEdit, getCurrentImageActionLine, plainText])

  const handleInsertParagraphBeforeImage = useCallback(() => {
    const imageLineRange = getCurrentImageActionLine()
    if (!imageLineRange) {
      toast.error('图片不存在或已被删除')
      return
    }

    applyPlainTextEdit(imageLineRange.start, imageLineRange.start, '\n', imageLineRange.start)
  }, [applyPlainTextEdit, getCurrentImageActionLine])

  const handleInsertParagraphAfterImage = useCallback(() => {
    const imageLineRange = getCurrentImageActionLine()
    if (!imageLineRange) {
      toast.error('图片不存在或已被删除')
      return
    }

    const blockEndLine = getImageLayoutBlockEndLine(plainText, imageLineRange)
    const nextLine = getNextLineRange(plainText, blockEndLine)
    if (nextLine && nextLine.start === nextLine.end) {
      const selection = { start: nextLine.start, end: nextLine.start }
      focusContentAtSelection(selection, { forceKeyboard: true })
      return
    }

    const hasFollowingNewline =
      blockEndLine.end < plainText.length && plainText[blockEndLine.end] === '\n'
    const insertAt = hasFollowingNewline ? blockEndLine.end + 1 : blockEndLine.end
    applyPlainTextEdit(
      insertAt,
      insertAt,
      '\n',
      hasFollowingNewline ? insertAt : insertAt + 1,
      true,
      {
        forceKeyboard: true,
      },
    )
  }, [applyPlainTextEdit, focusContentAtSelection, getCurrentImageActionLine, plainText])

  const imageActionItems = useMemo<ImageActionItem[]>(
    () => [
      { key: 'view', label: '查看图片', icon: 'image', onPress: handleViewActionImage },
      { key: 'replace', label: '替换图片', icon: 'image', onPress: handleReplaceActionImage },
      {
        key: 'delete',
        label: '删除图片',
        destructive: true,
        onPress: handleDeleteActionImage,
      },
      {
        key: 'insert-before',
        label: '图片前插入段落',
        onPress: handleInsertParagraphBeforeImage,
      },
      {
        key: 'insert-after',
        label: '图片后插入段落',
        onPress: handleInsertParagraphAfterImage,
      },
    ],
    [
      handleDeleteActionImage,
      handleInsertParagraphAfterImage,
      handleInsertParagraphBeforeImage,
      handleReplaceActionImage,
      handleViewActionImage,
    ],
  )

  const handleImageActionItemPress = useCallback((item: ImageActionItem) => {
    haptic(item.destructive ? 'delete' : 'tap')
    setImageActionSheetVisible(false)
    setTimeout(
      () => {
        Promise.resolve(item.onPress()).finally(() => {
          setImageActionTarget(null)
        })
      },
      Platform.OS === 'android' ? 80 : 0,
    )
  }, [])

  const handleImageActionBackdropPress = useCallback(() => {
    haptic('tap')
    handleCloseImageActions()
  }, [handleCloseImageActions])

  const handleInsertImages = useCallback(async () => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 0,
        includeBase64: false,
      })

      if (response.didCancel) {
        focusContentAtSelection(contentSelection, { forceKeyboard: true })
        return
      }
      if (response.errorCode) {
        toast.error(response.errorMessage ?? '图片选择失败')
        focusContentAtSelection(contentSelection, { forceKeyboard: true })
        return
      }

      const assets = (response.assets ?? []).filter(asset => !!asset.uri)
      if (assets.length <= 0) {
        toast.info('未选择图片')
        focusContentAtSelection(contentSelection, { forceKeyboard: true })
        return
      }

      const selection = normalizeSelection(contentSelection, plainText.length)
      const prefix = selection.start > 0 && plainText[selection.start - 1] !== '\n' ? '\n' : ''
      const suffix = '\n'
      const markdown = assets.map(createImageEditorBlock).join('\n')
      insertPlainText(`${prefix}${markdown}${suffix}`, [], { forceKeyboard: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '图片选择失败')
      focusContentAtSelection(contentSelection, { forceKeyboard: true })
    }
  }, [contentSelection, focusContentAtSelection, insertPlainText, plainText])

  const handleContentChange = useCallback(
    (nextText: string) => {
      if (nextText !== plainText) {
        programmaticContentSelectionRef.current = null
        pendingContentFocusRef.current = null
      }
      const diff = getTextDiff(plainText, nextText)
      const deletedText = plainText.slice(diff.start, diff.previousEnd)
      const deletedLength = diff.previousEnd - diff.start
      const deletedOnlyPreviousNewline = diff.insertedLength === 0 && deletedText === '\n'
      const insertedText = nextText.slice(diff.start, diff.nextEnd)

      if (diff.insertedLength > 0 && diff.previousEnd === diff.start && insertedText !== '\n') {
        const insertionLineRange = getCurrentLineRange(plainText, diff.start)
        const insertionImageLineRange = getImageLayoutBlockStartLine(plainText, insertionLineRange)
        const editableBoundary =
          insertionImageLineRange?.start === insertionLineRange.start &&
          insertionLineRange.start === diff.start
            ? getEditableBoundaryBeforeProtectedLine(plainText, insertionLineRange)
            : null

        if (editableBoundary) {
          const insertAt = editableBoundary.start
          const usesExistingLineBreak = insertAt < diff.start
          const boundaryText =
            usesExistingLineBreak || insertedText.endsWith('\n')
              ? insertedText
              : `${insertedText}\n`
          const redirectedText = `${plainText.slice(0, insertAt)}${boundaryText}${plainText.slice(
            insertAt,
          )}`
          const redirectedDiff = {
            start: insertAt,
            previousEnd: insertAt,
            nextEnd: insertAt + boundaryText.length,
            insertedLength: boundaryText.length,
          }
          const insertionFormats = insertionFormatsFromState(
            activeFormatState,
            formatRanges,
            diff.start,
            plainText.length,
          )
          const appliedInsertionFormats = insertionFormats.filter(isInlineFormatTool)
          const nextRanges = updateRangesForTextChange(
            formatRanges,
            redirectedDiff,
            appliedInsertionFormats,
            redirectedText.length,
          )
          const cursor = insertAt + insertedText.length
          const selection = { start: cursor, end: cursor }
          syncRichDocument(redirectedText, nextRanges, selection)
          requestAnimationFrame(() => {
            contentInputRef.current?.setNativeProps({ selection })
          })
          return
        }
      }

      if (diff.insertedLength === 0 && deletedLength > 0) {
        const imageLineRange =
          findImageLineInDeletedRange(plainText, diff.start, diff.previousEnd) ??
          (deletedText === '\n' ? getImageLineForBackspace(plainText, contentSelection) : null)
        if (imageLineRange) {
          const removalRange = getImageLayoutBlockRemovalRange(plainText, imageLineRange)
          const imageDiff = {
            start: removalRange.start,
            previousEnd: removalRange.end,
            nextEnd: removalRange.start,
            insertedLength: 0,
          }
          const textWithoutImage = `${plainText.slice(0, removalRange.start)}${plainText.slice(
            removalRange.end,
          )}`
          const nextRanges = updateRangesForTextChange(
            formatRanges,
            imageDiff,
            [],
            textWithoutImage.length,
          )
          const selection = { start: removalRange.cursor, end: removalRange.cursor }
          syncRichDocument(textWithoutImage, nextRanges, selection)
          requestAnimationFrame(() => {
            contentInputRef.current?.setNativeProps({ selection })
          })
          return
        }

        const unsafeImageLineRange = findUnsafeImageEditorLine(nextText)
        if (unsafeImageLineRange) {
          const removalRange = getImageLayoutBlockRemovalRange(nextText, unsafeImageLineRange)
          const textWithoutUnsafeImage = `${nextText.slice(0, removalRange.start)}${nextText.slice(
            removalRange.end,
          )}`
          const cleanupDiff = getTextDiff(plainText, textWithoutUnsafeImage)
          const nextRanges = updateRangesForTextChange(
            formatRanges,
            cleanupDiff,
            [],
            textWithoutUnsafeImage.length,
          )
          const cursor = Math.max(0, Math.min(removalRange.cursor, textWithoutUnsafeImage.length))
          const selection = { start: cursor, end: cursor }
          syncRichDocument(textWithoutUnsafeImage, nextRanges, selection)
          requestAnimationFrame(() => {
            contentInputRef.current?.setNativeProps({ selection })
          })
          return
        }
      }

      if (
        diff.insertedLength === 0 &&
        deletedLength > 0 &&
        deletedLength <= DIVIDER_TEXT.length + 2
      ) {
        const dividerLineRange = findDividerLineInDeletedRange(
          plainText,
          diff.start,
          diff.previousEnd,
        )
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
    [
      activeFormatState,
      clearBlockFormatState,
      contentSelection,
      formatRanges,
      plainText,
      syncRichDocument,
    ],
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
        const selection = normalizeSelection(contentSelection, plainText.length)
        const prefix = selection.start > 0 && plainText[selection.start - 1] !== '\n' ? '\n' : ''
        insertPlainText(`${prefix}${DIVIDER_TEXT}\n`, [])
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
  const protectedLayoutSafeCaretVisible = useMemo(
    () => shouldRenderProtectedLayoutSafeCaret(plainText, contentSelection),
    [contentSelection, plainText],
  )

  useEffect(() => {
    if (!protectedLayoutSafeCaretVisible) {
      setFakeCaretVisible(false)
      return undefined
    }

    setFakeCaretVisible(true)
    const interval = setInterval(() => {
      setFakeCaretVisible(visible => !visible)
    }, 530)

    return () => clearInterval(interval)
  }, [protectedLayoutSafeCaretVisible])

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

  const handlePreviewImagePress = useCallback(
    (lineStart: number) => {
      const imageLineRange = getImageLayoutBlockStartLine(
        plainText,
        getCurrentLineRange(plainText, lineStart),
      )
      if (!imageLineRange) {
        return
      }

      openImageActions(imageLineRange)
    },
    [openImageActions, plainText],
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
      const imageUri = getImageUriFromEditorLine(line)

      if (isImageLayoutSpacerLine(line) || (isImageEditorTokenLikeLine(line) && !imageUri)) {
        return null
      }

      const previousLineRange = getPreviousLineRange(plainText, {
        start: lineStart,
        end: lineEnd,
      })
      if (
        protectedLayoutSafeCaretVisible &&
        !line &&
        contentSelection.start === lineStart &&
        previousLineRange &&
        isProtectedLayoutLineBeforeCaret(getLineText(plainText, previousLineRange))
      ) {
        return (
          <View key={`rich-line-${index}`} style={styles.liveMarkdownImageCaretLine}>
            <View
              style={[
                styles.liveMarkdownFakeCaret,
                !fakeCaretVisible && styles.liveMarkdownFakeCaretHidden,
              ]}
            />
          </View>
        )
      }

      if (imageUri) {
        const imageKey = IMAGE_EDITOR_RECOVERABLE_LINE.exec(line.trim())?.[1] ?? imageUri
        return (
          <View
            key={`rich-image-placeholder-${imageKey}`}
            pointerEvents="none"
            style={[styles.liveMarkdownImageBlock, styles.liveMarkdownImagePreviewPlaceholder]}
          />
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
  }, [
    contentSelection.start,
    fakeCaretVisible,
    formatRanges,
    protectedLayoutSafeCaretVisible,
    plainText,
    renderRichInline,
  ])

  const renderImageInteractionBlocks = useCallback(() => {
    const lines = plainText.split('\n')
    let offset = 0
    let orderedIndex = 1
    const blocks = lines.map((line, index) => {
      const lineStart = offset
      const lineEnd = lineStart + line.length
      const effectiveEnd = Math.max(lineEnd, lineStart + 1)
      offset = lineEnd + 1
      const imageUri = getImageUriFromEditorLine(line)

      if (isImageLayoutSpacerLine(line) || (isImageEditorTokenLikeLine(line) && !imageUri)) {
        return null
      }

      if (imageUri) {
        const imageKey = IMAGE_EDITOR_RECOVERABLE_LINE.exec(line.trim())?.[1] ?? imageUri
        return (
          <Pressable
            key={`image-touch-${imageKey}`}
            accessibilityRole="button"
            accessibilityLabel="打开图片操作"
            onPressIn={() => {
              suppressNextEditorFocusRef.current = true
              contentPressInAtRef.current = 0
              contentInputRef.current?.blur()
              Keyboard.dismiss()
            }}
            onPress={() => handlePreviewImagePress(lineStart)}
            onLongPress={() => handlePreviewImagePress(lineStart)}
            style={({ pressed }) => [
              styles.liveMarkdownImageTouchBlock,
              pressed && styles.liveMarkdownImageTouchBlockPressed,
            ]}
          >
            <LiveMarkdownImageBlock uri={imageUri} />
          </Pressable>
        )
      }

      const isQuote = lineHasFormat(formatRanges, lineStart, effectiveEnd, 'quote')
      const isOrdered = lineHasFormat(formatRanges, lineStart, effectiveEnd, 'orderedList')
      const isUnordered = lineHasFormat(formatRanges, lineStart, effectiveEnd, 'unorderedList')
      const isCenter = lineHasFormat(formatRanges, lineStart, effectiveEnd, 'alignCenter')
      const lineStyles = [
        styles.liveMarkdownParagraph,
        styles.liveMarkdownInteractionPlaceholder,
        isCenter && styles.liveMarkdownCenter,
        lineHasFormat(formatRanges, lineStart, effectiveEnd, 'indent') &&
          styles.liveMarkdownIndented,
      ]
      const contentNode = line ? renderRichInline(line, lineStart) : '\n'
      const previousLineRange = getPreviousLineRange(plainText, {
        start: lineStart,
        end: lineEnd,
      })

      if (
        !line &&
        previousLineRange &&
        isProtectedLayoutLineBeforeCaret(getLineText(plainText, previousLineRange))
      ) {
        return (
          <Pressable
            key={`image-touch-empty-after-${index}`}
            accessibilityRole="button"
            accessibilityLabel="在图片后继续输入"
            onPress={() =>
              focusContentAtSelection({ start: lineStart, end: lineStart }, { forceKeyboard: true })
            }
            style={styles.liveMarkdownImageTouchBlock}
          >
            <View
              pointerEvents="none"
              style={[styles.liveMarkdownImageCaretLine, styles.liveMarkdownInteractionPlaceholder]}
            />
          </Pressable>
        )
      }

      if (line === DIVIDER_TEXT) {
        return (
          <View
            key={`image-touch-placeholder-${index}`}
            pointerEvents="none"
            style={[styles.liveMarkdownDividerRow, styles.liveMarkdownInteractionPlaceholder]}
          >
            <View style={styles.liveMarkdownDivider} />
          </View>
        )
      }

      if (isOrdered || isUnordered) {
        const marker = isOrdered ? `${pad2(orderedIndex++)}.` : '\u2022'
        return (
          <View
            key={`image-touch-placeholder-${index}`}
            pointerEvents="none"
            style={[styles.liveMarkdownListItem, styles.liveMarkdownInteractionPlaceholder]}
          >
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
          <View
            key={`image-touch-placeholder-${index}`}
            pointerEvents="none"
            style={[styles.liveMarkdownQuote, styles.liveMarkdownInteractionPlaceholder]}
          >
            <Text style={lineStyles}>{contentNode}</Text>
          </View>
        )
      }

      return (
        <View key={`image-touch-placeholder-${index}`} pointerEvents="none">
          <Text style={lineStyles}>{contentNode}</Text>
        </View>
      )
    })

    const tailLineRange = getCurrentLineRange(plainText, plainText.length)
    const previousTailLineRange = getPreviousLineRange(plainText, tailLineRange)
    const shouldRenderTailFocusTarget =
      tailLineRange.start === tailLineRange.end &&
      previousTailLineRange &&
      isProtectedLayoutLineBeforeCaret(getLineText(plainText, previousTailLineRange))

    if (shouldRenderTailFocusTarget) {
      blocks.push(
        <Pressable
          key="image-touch-tail-after"
          accessibilityRole="button"
          accessibilityLabel="在图片后继续输入"
          onPress={() =>
            focusContentAtSelection(
              { start: plainText.length, end: plainText.length },
              { forceKeyboard: true },
            )
          }
          style={styles.liveMarkdownImageTailTouchBlock}
        />,
      )
    }

    return blocks
  }, [focusContentAtSelection, formatRanges, handlePreviewImagePress, plainText, renderRichInline])

  const imagePreviewUrls = useMemo(
    () => imagePreview?.uris.map(uri => ({ url: uri })) ?? [],
    [imagePreview],
  )

  const imagePreviewFullscreenSize = useMemo(() => {
    const screen = Dimensions.get('screen')
    return {
      width: Math.max(windowDimensions.width, screen.width),
      height: Math.max(windowDimensions.height, screen.height),
    }
  }, [windowDimensions.height, windowDimensions.width])
  const imagePreviewModalStyle = useMemo(
    () => [styles.imagePreviewModal, imagePreviewFullscreenSize],
    [imagePreviewFullscreenSize],
  )
  const imagePreviewViewerStyle = useMemo(
    () => ({
      ...styles.imagePreviewViewer,
      ...imagePreviewFullscreenSize,
    }),
    [imagePreviewFullscreenSize],
  )

  const closeImagePreview = useCallback(() => {
    if (imagePreviewTimerRef.current) {
      clearTimeout(imagePreviewTimerRef.current)
      imagePreviewTimerRef.current = null
    }
    imagePreviewKeyboardHideRef.current?.remove()
    imagePreviewKeyboardHideRef.current = null
    setImagePreview(null)
  }, [])

  const renderImagePreviewHeader = useCallback(
    (currentIndex?: number) => (
      <View style={[styles.imagePreviewHeader, { paddingTop: Math.max(insets.top, 24) + 18 }]}>
        <Text style={styles.imagePreviewIndicator}>
          {`${(currentIndex ?? imagePreview?.index ?? 0) + 1}/${imagePreview?.uris.length ?? 1}`}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close image preview"
          hitSlop={{ top: 18, right: 18, bottom: 18, left: 18 }}
          onPress={closeImagePreview}
          style={[styles.imagePreviewCloseButton, { top: Math.max(insets.top, 24) + 10 }]}
        >
          <Text style={styles.imagePreviewCloseText}>{'\u00D7'}</Text>
        </Pressable>
      </View>
    ),
    [closeImagePreview, imagePreview?.index, imagePreview?.uris.length, insets.top],
  )

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

      <Modal
        visible={!!imagePreview}
        animationType="fade"
        presentationStyle="fullScreen"
        transparent={false}
        statusBarTranslucent
        hardwareAccelerated
        onRequestClose={closeImagePreview}
      >
        <View style={imagePreviewModalStyle}>
          {imagePreview ? (
            <ImageViewer
              key={imagePreview.openedAt}
              imageUrls={imagePreviewUrls}
              index={imagePreview.index}
              enableSwipeDown
              enableImageZoom
              onSwipeDown={closeImagePreview}
              onCancel={closeImagePreview}
              saveToLocalByLongPress={false}
              backgroundColor={colors.neutral.black}
              renderHeader={renderImagePreviewHeader}
              renderIndicator={() => <View />}
              style={imagePreviewViewerStyle}
            />
          ) : null}
        </View>
      </Modal>

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

          <View style={styles.liveEditor}>
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
              selectionColor={contentSelectionShielded ? 'transparent' : colors.brand.primary}
              selectionHandleColor={contentSelectionShielded ? 'transparent' : colors.brand.primary}
              cursorColor={colors.brand.primary}
              caretHidden={protectedLayoutSafeCaretVisible}
              onSelectionChange={handleContentSelectionChange}
              onPressIn={handleContentPressIn}
              onKeyPress={handleContentKeyPress}
              onScroll={handleContentScroll}
              showSoftInputOnFocus
              textAlignVertical="top"
              style={contentInputStyles}
              maxLength={EDITOR_LIMITS.CONTENT_MAX}
            />
            <View
              pointerEvents="box-none"
              style={styles.liveImageInteractionScroller}
              importantForAccessibility="no-hide-descendants"
            >
              <Animated.View
                pointerEvents="box-none"
                style={[
                  styles.livePreviewContent,
                  { transform: [{ translateY: imageInteractionTranslateYRef.current }] },
                ]}
              >
                {renderImageInteractionBlocks()}
              </Animated.View>
            </View>
          </View>
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
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="获取当前天气"
                disabled={weatherLoading || locating}
                onPress={handleFetchWeather}
                style={({ pressed }) => [
                  styles.infoRow,
                  pressed && styles.infoRowPressed,
                  (weatherLoading || locating) && styles.infoRowDisabled,
                ]}
              >
                <Icon name="weather" size={15} color={colors.neutral.gray50} />
                <Text style={styles.infoText} numberOfLines={1}>
                  {weatherLabel}
                </Text>
              </Pressable>
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
      <Modal
        visible={imageActionSheetVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleCloseImageActions}
      >
        <Pressable
          accessibilityLabel="关闭图片操作弹窗"
          style={styles.imageActionDialogBackdrop}
          onPress={handleImageActionBackdropPress}
        >
          <Pressable onPress={() => {}} style={styles.imageActionDialogCard}>
            <Text style={styles.imageActionDialogTitle}>图片操作</Text>
            {imageActionItems.map((item, index) => (
              <View key={item.key}>
                {index > 0 && <View style={styles.imageActionDialogDivider} />}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => handleImageActionItemPress(item)}
                  style={({ pressed }) => [
                    styles.imageActionDialogItem,
                    pressed && styles.imageActionDialogItemPressed,
                  ]}
                >
                  <View style={styles.imageActionDialogIconSlot}>
                    {item.icon ? (
                      <Icon
                        name={item.icon}
                        size={21}
                        color={item.destructive ? colors.func.danger : colors.semantic.icon.primary}
                      />
                    ) : null}
                  </View>
                  <Text
                    style={[
                      styles.imageActionDialogLabel,
                      item.destructive && styles.imageActionDialogLabelDestructive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              </View>
            ))}
            <View style={styles.imageActionDialogCancelSeparator} />
            <Pressable
              accessibilityRole="button"
              onPress={handleImageActionBackdropPress}
              style={({ pressed }) => [
                styles.imageActionDialogCancelButton,
                pressed && styles.imageActionDialogItemPressed,
              ]}
            >
              <Text style={styles.imageActionDialogCancelLabel}>取消</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
