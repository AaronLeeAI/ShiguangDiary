/**
 * 检索质量指标
 *
 * RAG 的问题八成出在检索，不在模型。所以评测必须把"检索"和"生成"分开打分：
 * 这里只做检索侧（recall@k / MRR / nDCG@k），生成侧的忠实度需要人工或 LLM 裁判，
 * 端上不做。
 *
 * 指标口径（二值相关性）：
 * - recall@k：前 k 条里命中了几成"应有的日记"
 * - MRR：第一条正确结果的排名倒数（越接近 1 越好，衡量"榜首准不准"）
 * - nDCG@k：考虑位置折扣的排序质量，理想排序为 1
 */

export interface RankedResult {
  ranked: readonly string[]
  relevant: readonly string[]
}

export interface RetrievalScore {
  recall: number
  mrr: number
  ndcg: number
}

export function recallAtK(
  ranked: readonly string[],
  relevant: readonly string[],
  k: number,
): number {
  if (relevant.length === 0) {
    return 1
  }
  const top = new Set(ranked.slice(0, Math.max(0, k)))
  let hit = 0
  for (const id of relevant) {
    if (top.has(id)) {
      hit++
    }
  }
  return hit / relevant.length
}

export function reciprocalRank(ranked: readonly string[], relevant: readonly string[]): number {
  const wanted = new Set(relevant)
  for (let index = 0; index < ranked.length; index++) {
    if (wanted.has(ranked[index] as string)) {
      return 1 / (index + 1)
    }
  }
  return 0
}

export function ndcgAtK(ranked: readonly string[], relevant: readonly string[], k: number): number {
  if (relevant.length === 0) {
    return 1
  }
  const wanted = new Set(relevant)
  const limit = Math.max(0, k)

  let dcg = 0
  for (let index = 0; index < Math.min(limit, ranked.length); index++) {
    if (wanted.has(ranked[index] as string)) {
      dcg += 1 / Math.log2(index + 2)
    }
  }

  let idcg = 0
  for (let index = 0; index < Math.min(limit, relevant.length); index++) {
    idcg += 1 / Math.log2(index + 2)
  }
  return idcg === 0 ? 0 : dcg / idcg
}

export function scoreRanking(result: RankedResult, k: number): RetrievalScore {
  return {
    recall: recallAtK(result.ranked, result.relevant, k),
    mrr: reciprocalRank(result.ranked, result.relevant),
    ndcg: ndcgAtK(result.ranked, result.relevant, k),
  }
}

/** 对多组查询求平均。 */
export function aggregateScores(results: readonly RankedResult[], k: number): RetrievalScore {
  if (results.length === 0) {
    return { recall: 0, mrr: 0, ndcg: 0 }
  }
  const totals = results.reduce(
    (sum, result) => {
      const score = scoreRanking(result, k)
      return {
        recall: sum.recall + score.recall,
        mrr: sum.mrr + score.mrr,
        ndcg: sum.ndcg + score.ndcg,
      }
    },
    { recall: 0, mrr: 0, ndcg: 0 },
  )
  return {
    recall: totals.recall / results.length,
    mrr: totals.mrr / results.length,
    ndcg: totals.ndcg / results.length,
  }
}

/** 固定三位小数，写进测试输出便于人工比对。 */
export function formatScore(score: RetrievalScore): string {
  return `recall=${score.recall.toFixed(3)} mrr=${score.mrr.toFixed(3)} ndcg=${score.ndcg.toFixed(3)}`
}
