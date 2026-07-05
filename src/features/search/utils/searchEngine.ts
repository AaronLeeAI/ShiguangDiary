/**
 * Search Engine - 搜索纯函数
 *
 * 全部纯函数,可单测;不依赖任何 IO。
 * 范式:以 diaryStore.diaries 为入参,内存匹配/打分/排序/求高亮范围,零 DB 查询。
 *
 * 匹配字段:title / summary / content / location / weather;不区分大小写;
 * 跳过已软删(deletedAt !== null)。
 */

import type { Diary } from '@types'
import type { HighlightRange, SearchResult, SearchSort } from '../types'

/** 归一化:小写(中文无影响,英文/拼音受益)。保持长度,便于范围映射。 */
const normalize = (s: string): string => (s ?? '').toLowerCase()

/** 多词拆分:空白分隔;过滤空 token。 */
export function tokenize(query: string): string[] {
  return query
    .trim()
    .split(/\s+/)
    .map(t => normalize(t))
    .filter(Boolean)
}

/** 单字段命中检测(归一化后 includes)。 */
const fieldHit = (field: string | null | undefined, token: string): boolean =>
  field != null && normalize(field).includes(token)

/** 多 token AND 关系:每个 token 都需在某可搜索字段命中。 */
export function match(diary: Diary, tokens: string[]): boolean {
  if (tokens.length === 0) {
    return false
  }
  return tokens.every(
    t =>
      fieldHit(diary.title, t) ||
      fieldHit(diary.summary, t) ||
      fieldHit(diary.content, t) ||
      fieldHit(diary.location, t) ||
      fieldHit(diary.weather, t),
  )
}

/** 字段命中权重。 */
const W = { title: 3, summary: 2, content: 1, location: 0.5, weather: 0.5 } as const

/**
 * 相关度分数:各字段命中加权求和;标题命中位置越前权重越高(常见词/早期出现更相关)。
 */
export function score(diary: Diary, query: string): number {
  const tokens = tokenize(query)
  if (tokens.length === 0) {
    return 0
  }
  let total = 0
  for (const t of tokens) {
    const titleLow = normalize(diary.title)
    const idx = titleLow.indexOf(t)
    if (idx >= 0) {
      // 标题命中:固定权重 + 位置越前加成(权重最多再 +1)。
      total += W.title + Math.max(0, 1 - idx / Math.max(1, titleLow.length))
      continue
    }
    if (fieldHit(diary.summary, t)) {
      total += W.summary
      continue
    }
    if (fieldHit(diary.content, t)) {
      total += W.content
      continue
    }
    if (fieldHit(diary.location, t)) {
      total += W.location
      continue
    }
    if (fieldHit(diary.weather, t)) {
      total += W.weather
    }
  }
  return total
}

/** 上下文片段长度(围绕首个命中处)。 */
const SNIPPET_RADIUS = 60

/**
 * 在原文(haystack)中求 query 各 token 出现处的高亮范围(不区分大小写,长度保真)。
 * 多 token 高亮各自命中处。
 */
export function findHighlightRanges(haystack: string, query: string): HighlightRange[] {
  const ranges: HighlightRange[] = []
  if (!haystack) {
    return ranges
  }
  const hayLow = normalize(haystack)
  for (const t of tokenize(query)) {
    let from = 0
    while (from <= hayLow.length) {
      const idx = hayLow.indexOf(t, from)
      if (idx < 0) {
        break
      }
      ranges.push({ start: idx, length: t.length })
      from = idx + t.length
    }
  }
  return dedupRanges(ranges)
}

/**
 * 求首个命中位置用于 snippet 截取。
 * 用归一化定位,返回原文索引。
 */
function firstHitIndex(haystack: string, tokens: string[]): number {
  if (tokens.length === 0) {
    return -1
  }
  const hayLow = normalize(haystack)
  let best = -1
  for (const t of tokens) {
    const idx = hayLow.indexOf(t)
    if (idx >= 0 && (best < 0 || idx < best)) {
      best = idx
    }
  }
  return best
}

/**
 * 构造正文 snippet:围绕首个命中处截取 ±SNIPPET_RADIUS;
 * 返回 snippet 文本 + 该文本内的高亮范围(原文范围已平移)。
 */
export function makeSnippet(
  content: string,
  query: string,
): { snippet: string; ranges: HighlightRange[] } {
  const tokens = tokenize(query)
  if (tokens.length === 0 || !content) {
    return { snippet: content.slice(0, SNIPPET_RADIUS * 2), ranges: [] }
  }
  const hit = firstHitIndex(content, tokens)
  if (hit < 0) {
    // 正文未命中(可能在标题/位置命中):取正文头部。
    return { snippet: content.slice(0, SNIPPET_RADIUS * 2), ranges: [] }
  }
  const start = Math.max(0, hit - SNIPPET_RADIUS)
  const end = Math.min(content.length, hit + SNIPPET_RADIUS)
  const snippet =
    (start > 0 ? '…' : '') + content.slice(start, end) + (end < content.length ? '…' : '')
  // 高亮范围相对 snippet:对每个 token 在 snippet 内求范围。
  const snippetLow = normalize(snippet)
  const ranges: HighlightRange[] = []
  for (const t of tokens) {
    let from = 0
    while (from <= snippetLow.length) {
      const idx = snippetLow.indexOf(t, from)
      if (idx < 0) {
        break
      }
      ranges.push({ start: idx, length: t.length })
      from = idx + t.length
    }
  }
  // 去重并按 start 排序(便于 HighlightText 渲染)。
  return {
    snippet,
    ranges: dedupRanges(ranges),
  }
}

const dedupRanges = (ranges: HighlightRange[]): HighlightRange[] => {
  const map = new Map<string, HighlightRange>()
  for (const r of ranges) {
    map.set(`${r.start}:${r.length}`, r)
  }
  return Array.from(map.values()).sort((a, b) => a.start - b.start)
}

/**
 * 完整搜索:过滤 + 打分 + 排序 + 摘要 + 高亮范围。
 * sort='relevance'(默认):score 降序;sort='time':createdAt 降序。
 */
export function search(
  diaries: Diary[],
  query: string,
  sort: SearchSort = 'relevance',
): SearchResult[] {
  const tokens = tokenize(query)
  if (tokens.length === 0) {
    return []
  }
  const matched = diaries.filter(d => d.deletedAt === null && match(d, tokens))
  const results: SearchResult[] = matched.map(d => {
    const { snippet, ranges: snippetRanges } = makeSnippet(d.content, query)
    const titleRanges = dedupRanges(findHighlightRanges(d.title, query))
    return {
      item: d,
      score: score(d, query),
      snippet,
      titleRanges,
      snippetRanges,
    }
  })
  if (sort === 'time') {
    results.sort((a, b) => b.item.createdAt - a.item.createdAt)
  } else {
    results.sort((a, b) => b.score - a.score || b.item.createdAt - a.item.createdAt)
  }
  return results
}
