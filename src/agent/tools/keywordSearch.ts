/**
 * 关键词检索（`search_diaries` 工具的实现）
 *
 * 改造前是 `content.includes(keyword)`：中文里只要用户少打一个字或换个说法就查不到，
 * 也无法处理「火锅 老王」这种多词查询的排序。
 *
 * 现在用 BM25 排序，和语义检索共用同一套分词/打分：
 * - 中文 2-gram，天然支持「咖啡」命中「咖啡店」
 * - 多词查询按相关性排序，而不是只按时间倒序
 * - 保留子串兜底：单字符、emoji、特殊符号这类分词切不出来的查询，退回包含匹配，
 *   保证「以前能查到的，现在还能查到」
 */
import { Bm25Index } from '../rag/bm25'
import { tokenizeQuery } from '../rag/tokenize'
import type { DiaryRecord } from './context'
import { toMillis } from './context'

export interface KeywordSearchOptions {
  keyword?: string
  mood?: string
  startDate?: string
  endDate?: string
  limit: number
}

export interface KeywordSearchResult {
  /** 已按相关性（或时间）排序的日记 */
  diaries: DiaryRecord[]
  /** 排序方式，便于排查「为什么结果是这个顺序」 */
  mode: 'recent' | 'ranked'
  /** 关键词命中的候选数量（截断前），0 表示没命中 */
  matched: number
}

function filterByAttributes(
  diaries: readonly DiaryRecord[],
  options: KeywordSearchOptions,
): DiaryRecord[] {
  const mood = options.mood?.trim().toLowerCase()
  const start = options.startDate ? new Date(options.startDate).getTime() : -Infinity
  const end = options.endDate ? new Date(options.endDate).getTime() + 86400000 : Infinity

  return diaries.filter(diary => {
    const createdAt = toMillis(diary.createdAt)
    if (!Number.isFinite(createdAt) || createdAt < start || createdAt > end) {
      return false
    }
    if (mood && (diary.mood ?? '').toLowerCase() !== mood) {
      return false
    }
    return true
  })
}

export function keywordSearchDiaries(
  diaries: readonly DiaryRecord[],
  options: KeywordSearchOptions,
): KeywordSearchResult {
  const limit = Math.max(1, Math.floor(options.limit))
  const keyword = (options.keyword ?? '').trim()
  const filtered = filterByAttributes(diaries, options)

  // 没有关键词就是「最近写了什么」，按时间倒序
  if (!keyword) {
    const recent = [...filtered]
      .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))
      .slice(0, limit)
    return { diaries: recent, mode: 'recent', matched: filtered.length }
  }

  // 单字查询（"猫""海"）切出来只有 unigram，而索引里存的是 2-gram，
  // 直接走 BM25 会漏召回，这里退回子串匹配。
  const compact = keyword.replace(/\s+/g, '')
  if (compact.length < 2) {
    return substringFallback(filtered, keyword, limit)
  }

  const queryTokens = tokenizeQuery(keyword)
  if (queryTokens.length === 0) {
    // 纯符号/emoji 这类分词切不出来的查询
    return substringFallback(filtered, keyword, limit)
  }

  const index = new Bm25Index(
    filtered.map(diary => ({
      id: diary.id,
      // 标题权重更高：标题通常就是主题
      text: `${diary.title} ${diary.title} ${diary.content}`,
    })),
  )
  const hits = index.search(queryTokens, filtered.length)
  if (hits.length === 0) {
    return { diaries: [], mode: 'ranked', matched: 0 }
  }

  const byId = new Map(filtered.map(diary => [diary.id, diary]))
  const ranked = hits
    .map(hit => byId.get(hit.id))
    .filter((diary): diary is DiaryRecord => Boolean(diary))
    .slice(0, limit)

  return { diaries: ranked, mode: 'ranked', matched: hits.length }
}

function substringFallback(
  diaries: readonly DiaryRecord[],
  keyword: string,
  limit: number,
): KeywordSearchResult {
  const needle = keyword.toLowerCase()
  const hits = diaries.filter(diary =>
    `${diary.title}${diary.content}`.toLowerCase().includes(needle),
  )
  return {
    diaries: hits.slice(0, limit),
    mode: 'ranked',
    matched: hits.length,
  }
}
