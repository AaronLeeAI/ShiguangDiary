/**
 * 检索结果融合与多样性选择。
 *
 * 1. RRF（Reciprocal Rank Fusion）：把多路召回（向量、BM25、多种问法）按名次合并。
 *    只看名次、不看绝对分数，所以不需要把余弦相似度和 BM25 分数对齐到同一量纲——
 *    这正是它比"加权求和"更稳的原因（各类检索的分数分布随语料变化很大）。
 * 2. MMR（Maximal Marginal Relevance）：在相关性之外惩罚"和已选结果太像"的候选，
 *    避免一次检索里 5 条都是同一篇日记的相邻段落。
 */

/** RRF 的平滑常数，Cormack et al. 2009 的默认值。 */
export const DEFAULT_RRF_K = 60

export interface MmrOptions<T> {
  limit: number
  /** 相关性打分，需返回 >= 0 的数值（内部做 min-max 归一） */
  relevanceOf: (item: T) => number
  /** 相似度，需返回 0..1 */
  similarity: (a: T, b: T) => number
  /** 0 = 只看多样性，1 = 只看相关性；0.7~0.8 是常用区间 */
  lambda?: number
}

/**
 * 多路名次融合。
 * @param rankedLists 每一路已按相关性降序排好的 id 列表
 * @returns id -> RRF 分数（出现在多路中会累加）
 */
export function reciprocalRankFusion(
  rankedLists: readonly (readonly string[])[],
  rankConstant: number = DEFAULT_RRF_K,
): Map<string, number> {
  const fused = new Map<string, number>()
  for (const list of rankedLists) {
    for (let rank = 0; rank < list.length; rank++) {
      const id = list[rank]
      if (!id) {
        continue
      }
      const contribution = 1 / (rankConstant + rank + 1)
      fused.set(id, (fused.get(id) ?? 0) + contribution)
    }
  }
  return fused
}

/** 归一化到 0..1，全等时统一给 1，避免除零。 */
function normalize(values: readonly number[]): number[] {
  if (values.length === 0) {
    return []
  }
  let min = values[0] ?? 0
  let max = values[0] ?? 0
  for (const value of values) {
    if (value < min) {
      min = value
    }
    if (value > max) {
      max = value
    }
  }
  const span = max - min
  if (span <= 0) {
    return values.map(() => 1)
  }
  return values.map(value => (value - min) / span)
}

/**
 * MMR 贪心选择：每轮挑 `lambda * 相关性 - (1-lambda) * 与已选集合的最大相似度` 最高的候选。
 * 返回顺序即挑选顺序（相关性最高的通常在前面）。
 */
export function mmrSelect<T>(candidates: readonly T[], options: MmrOptions<T>): T[] {
  const limit = Math.max(0, Math.floor(options.limit))
  if (limit === 0 || candidates.length === 0) {
    return []
  }
  if (candidates.length <= limit) {
    return [...candidates]
  }

  const lambda = Math.max(0, Math.min(1, options.lambda ?? 0.75))
  const relevance = normalize(candidates.map(options.relevanceOf))

  const selected: T[] = []
  const selectedIndices: number[] = []
  const remaining = candidates.map((_, index) => index)

  while (selected.length < limit && remaining.length > 0) {
    let bestPosition = 0
    let bestScore = -Infinity

    for (let position = 0; position < remaining.length; position++) {
      const candidateIndex = remaining[position] as number
      const candidate = candidates[candidateIndex] as T
      let maxSimilarity = 0
      for (const chosenIndex of selectedIndices) {
        const similarity = options.similarity(candidate, candidates[chosenIndex] as T)
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity
        }
      }
      const score = lambda * (relevance[candidateIndex] ?? 0) - (1 - lambda) * maxSimilarity
      if (score > bestScore) {
        bestScore = score
        bestPosition = position
      }
    }

    const chosenIndex = remaining.splice(bestPosition, 1)[0] as number
    selected.push(candidates[chosenIndex] as T)
    selectedIndices.push(chosenIndex)
  }

  return selected
}

/**
 * 时间新鲜度权重（指数衰减）。
 * 日记场景里"上周"和"三年前"的同等相关内容，用户通常更关心最近的，
 * 但相关性仍然优先，所以只作为很小的加分项使用。
 */
export function recencyWeight(
  createdAt: number,
  now: number = Date.now(),
  halfLifeDays = 180,
): number {
  if (!Number.isFinite(createdAt) || createdAt <= 0) {
    return 0
  }
  const ageDays = Math.max(0, (now - createdAt) / 86400000)
  const halfLife = Math.max(1, halfLifeDays)
  return Math.pow(0.5, ageDays / halfLife)
}
