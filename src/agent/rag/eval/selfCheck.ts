/**
 * 真机检索体检（label-free self-check）
 *
 * 问题：黄金集需要人工标注"这条查询应该命中哪篇日记"，而真实日记库在设备上，
 * 没法让 CI 拿到，也很难让用户手动标 50 条。
 *
 * 做法：用"日记标题当查询"，看能不能把这篇日记自己检回来（leave-one-out 的思路）。
 * 标题就是这篇日记最凝练的主题描述，检索不到自己说明索引/模型有问题。
 * 这不能完全等价于真实问法的效果，但：
 * - 零标注成本，随时可跑
 * - 能横向对比 dense / hybrid，验证融合是否真的在起作用
 * - 能发现"索引没建全""模型输出退化"这类硬故障
 *
 * 真实问法的效果仍然要人工标注小样本，两者互补。
 */
import type { DiaryRecord } from '../../tools/context'
import type { SemanticRagAdapter } from '../types'
import { aggregateScores } from './metrics'
import type { RankedResult, RetrievalScore } from './metrics'

export interface SelfCheckQuery {
  query: string
  expected: string
}

export interface SelfCheckProgress {
  completed: number
  total: number
}

export interface SelfCheckReport {
  k: number
  /** 实际参与体检的查询数 */
  queries: number
  /** 被跳过的日记数（加密 / 标题过短 / 标题重复） */
  skipped: number
  dense: RetrievalScore
  hybrid: RetrievalScore
  /** hybrid 把正确答案顶到第 1 位、而 dense 没做到的题数 */
  hybridTop1Wins: number
  /** 平均单次检索耗时（毫秒），含 embedding */
  denseMs: number
  hybridMs: number
}

export interface SelfCheckOptions {
  k?: number
  /** 最多体检多少篇，控制耗时 */
  maxQueries?: number
  onProgress?: (progress: SelfCheckProgress) => void
}

/** 标题太短没有检索价值（"周末"这种），单字标题更容易造成假阴性。 */
const MIN_TITLE_LENGTH = 2

export function buildSelfCheckQueries(diaries: readonly DiaryRecord[]): {
  queries: SelfCheckQuery[]
  skipped: number
} {
  const seenTitles = new Set<string>()
  const queries: SelfCheckQuery[] = []
  let skipped = 0

  for (const diary of diaries) {
    if (diary.isEncrypted) {
      skipped++
      continue
    }
    const title = (diary.title ?? '').trim()
    // 正文也没有的日记同样没有检索价值
    if (title.length < MIN_TITLE_LENGTH || !(diary.content ?? '').trim()) {
      skipped++
      continue
    }
    const fingerprint = title.replace(/\s+/g, '').toLowerCase()
    if (seenTitles.has(fingerprint)) {
      // 同名日记无法判断召回的是不是"自己"，跳过避免假阴性
      skipped++
      continue
    }
    seenTitles.add(fingerprint)
    queries.push({ query: title, expected: diary.id })
  }

  return { queries, skipped }
}

export async function runSelfCheck(
  rag: SemanticRagAdapter,
  diaries: readonly DiaryRecord[],
  options: SelfCheckOptions = {},
): Promise<SelfCheckReport> {
  const k = Math.max(1, Math.min(10, Math.floor(options.k ?? 5)))
  const maxQueries = Math.max(1, Math.floor(options.maxQueries ?? 40))
  const { queries: allQueries, skipped } = buildSelfCheckQueries(diaries)
  const queries = allQueries.slice(0, maxQueries)

  const denseResults: RankedResult[] = []
  const hybridResults: RankedResult[] = []
  let denseMs = 0
  let hybridMs = 0
  let hybridTop1Wins = 0

  for (let index = 0; index < queries.length; index++) {
    const item = queries[index]
    const relevant = [item.expected]

    const denseStart = Date.now()
    const denseResponse = await rag.search(item.query, diaries, {
      limit: k,
      retrievalMode: 'dense',
    })
    denseMs += Date.now() - denseStart

    const hybridStart = Date.now()
    const hybridResponse = await rag.search(item.query, diaries, {
      limit: k,
      retrievalMode: 'hybrid',
    })
    hybridMs += Date.now() - hybridStart

    const denseRanked = denseResponse.diaries.map(hit => hit.id)
    const hybridRanked = hybridResponse.diaries.map(hit => hit.id)
    denseResults.push({ ranked: denseRanked, relevant })
    hybridResults.push({ ranked: hybridRanked, relevant })

    if (hybridRanked[0] === item.expected && denseRanked[0] !== item.expected) {
      hybridTop1Wins++
    }

    options.onProgress?.({ completed: index + 1, total: queries.length })
  }

  const divisor = Math.max(1, queries.length)
  return {
    k,
    queries: queries.length,
    skipped,
    dense: aggregateScores(denseResults, k),
    hybrid: aggregateScores(hybridResults, k),
    hybridTop1Wins,
    denseMs: Math.round(denseMs / divisor),
    hybridMs: Math.round(hybridMs / divisor),
  }
}

/** 给 Alert 用的一段可读结果。 */
export function formatSelfCheckReport(report: SelfCheckReport): string {
  if (report.queries === 0) {
    return '暂时没有可体检的日记（需要至少 2 篇有标题和正文的未加密日记）。'
  }
  const lines = [
    `样本：${report.queries} 篇日记的标题作查询${report.skipped > 0 ? `（跳过 ${report.skipped} 篇）` : ''}`,
    `混合召回：recall@${report.k} ${report.hybrid.recall.toFixed(2)} · MRR ${report.hybrid.mrr.toFixed(2)}`,
    `纯向量：recall@${report.k} ${report.dense.recall.toFixed(2)} · MRR ${report.dense.mrr.toFixed(2)}`,
    `混合把 ${report.hybridTop1Wins} 条查询的正确答案顶到第 1 位`,
    `平均耗时：混合 ${report.hybridMs}ms / 纯向量 ${report.denseMs}ms`,
    '',
    '说明：标题自询只能反映索引与召回的稳定性，真实问法的效果请用黄金集评测。',
  ]
  return lines.join('\n')
}
