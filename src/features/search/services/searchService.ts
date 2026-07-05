/**
 * Search Service - 搜索聚合
 *
 * 纯函数 service,以 diaryStore 已缓存的 diaries 为入参派生搜索结果,
 * **不直接访问 Repository/DAO/SQLite**(经 diaryStore 已有的全量缓存)。
 * 满足 Task12 性能要求"避免重复查询"——零新增 DB 查询。
 *
 * 调用方:useSearch hook,不注册到全局 registry(非跨 feature 服务)。
 * 与 calendarService 同范式(DECISIONS 030/032)。
 */

import type { Diary } from '@types'
import { search, findHighlightRanges, makeSnippet, score } from '../utils/searchEngine'
import type { SearchSort, SearchResult } from '../types'

/** 执行搜索(内存匹配,跳过软删,排序)。空 query 返回空数组。 */
export function searchDiaries(
  diaries: Diary[],
  query: string,
  sort: SearchSort = 'relevance',
): SearchResult[] {
  return search(diaries, query, sort)
}

/** 仅检测是否存在命中(用于清空态文案)。 */
export function hasAnyMatch(diaries: Diary[], query: string): boolean {
  return searchDiaries(diaries, query).length > 0
}

/** 求标题/摘要高亮范围(供非列表场景按需使用)。 */
export function highlightFor(text: string, query: string) {
  return findHighlightRanges(text, query)
}

/** 单条相关度分数(调试/排序切换用)。 */
export function scoreOf(diary: Diary, query: string): number {
  return score(diary, query)
}

/** snippet 单独求(供结果项按需)。 */
export function snippetOf(content: string, query: string) {
  return makeSnippet(content, query)
}

export const searchService = {
  searchDiaries,
  hasAnyMatch,
  highlightFor,
  scoreOf,
  snippetOf,
}
