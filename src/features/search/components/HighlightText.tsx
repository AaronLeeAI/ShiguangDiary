/**
 * HighlightText - 按 HighlightRange 渲染高亮文本
 *
 * 不区分大小写的高亮结果由 searchEngine.findHighlightRanges 计算;
 * 本组件只负责分段渲染:命中段包高亮样式,其余普通色。
 *
 * 设计稿:命中关键字使用 inline 高亮(此处用 brand.primaryLight 背景 + brand.primary 文字)。
 */

import React from 'react'
import { Text } from 'react-native'

import { colors, typography } from '@theme'
import type { HighlightRange } from '../types'

export interface HighlightTextProps {
  text: string
  ranges: HighlightRange[]
  /** 基础文字色(未命中段)。 */
  color?: string
  /** 字号预设;默认 bodyM。 */
  variant?: keyof typeof typography
  numberOfLines?: number
  testID?: string
}

/**
 * 把 (text, ranges) 分段成命中/未命中片段数组。
 * ranges 必须按 start 升序且互不重叠(searchEngine 已 dedup+sort)。
 */
function segment(text: string, ranges: HighlightRange[]): Array<{ text: string; hl: boolean }> {
  if (!ranges.length) {
    return [{ text, hl: false }]
  }
  const out: Array<{ text: string; hl: boolean }> = []
  let cursor = 0
  for (const r of ranges) {
    if (r.start > cursor) {
      out.push({ text: text.slice(cursor, r.start), hl: false })
    }
    if (r.start < cursor) {
      continue // 防御:重叠跳过(不应发生)
    }
    out.push({ text: text.slice(r.start, r.start + r.length), hl: true })
    cursor = r.start + r.length
  }
  if (cursor < text.length) {
    out.push({ text: text.slice(cursor), hl: false })
  }
  return out
}

export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  ranges,
  color,
  variant = 'bodyM',
  numberOfLines,
  testID,
}) => {
  const base = typography[variant]
  const segs = segment(text ?? '', ranges)
  if (segs.length === 1 && !segs[0].hl) {
    return (
      <Text
        testID={testID}
        numberOfLines={numberOfLines}
        style={{ ...base, color: color ?? colors.semantic.text.primary }}
      >
        {text ?? ''}
      </Text>
    )
  }
  return (
    <Text
      testID={testID}
      numberOfLines={numberOfLines}
      style={{ ...base, color: color ?? colors.semantic.text.primary }}
    >
      {segs.map((s, i) =>
        s.hl ? (
          <Text
            key={i}
            style={{
              ...base,
              color: colors.brand.primary,
              backgroundColor: colors.brand.primaryLight,
            }}
          >
            {s.text}
          </Text>
        ) : (
          <Text key={i} style={{ ...base }}>
            {s.text}
          </Text>
        ),
      )}
    </Text>
  )
}

export default HighlightText
