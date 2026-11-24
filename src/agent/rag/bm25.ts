/**
 * 纯 JS 的 BM25 稀疏检索（Okapi BM25）
 *
 * 为什么端上也要一路 BM25：向量检索擅长"意思相近"，但对专有名词、人名、地名、
 * 数字编号这类"字面必须命中"的查询很不可靠——小模型的 embedding 对生僻词尤其差。
 * 两路结果用 RRF 融合，是 2026 年 RAG 的默认配置（见 docs/ai/RagRetrievalUpgrade.md）。
 *
 * 这类"同义不同词"和"精确命中"的需求在日记场景都很常见：
 * - "哪次去了环球影城" → 需要精确命中"环球影城"
 * - "那次让我特别放松的下午" → 需要语义理解
 */
import { tokenize } from './tokenize'

export interface Bm25Document {
  id: string
  text: string
}

export interface Bm25Hit {
  id: string
  score: number
}

export interface Bm25Options {
  /** 词频饱和参数，默认 1.5（越大越不容易被高频词垄断） */
  k1?: number
  /** 文档长度归一化强度，默认 0.75（0 = 不归一化） */
  b?: number
}

export class Bm25Index {
  private readonly k1: number
  private readonly b: number
  private readonly docIds: string[] = []
  private readonly docLengths: number[] = []
  /** token -> (文档下标 -> 词频) */
  private readonly postings = new Map<string, Map<number, number>>()
  private avgLength = 0

  constructor(documents: readonly Bm25Document[], options: Bm25Options = {}) {
    this.k1 = options.k1 ?? 1.5
    this.b = options.b ?? 0.75

    documents.forEach((document, docIndex) => {
      const tokens = tokenize(document.text)
      this.docIds.push(document.id)
      this.docLengths.push(tokens.length)
      for (const token of tokens) {
        let posting = this.postings.get(token)
        if (!posting) {
          posting = new Map<number, number>()
          this.postings.set(token, posting)
        }
        posting.set(docIndex, (posting.get(docIndex) ?? 0) + 1)
      }
    })

    const total = this.docLengths.reduce((sum, length) => sum + length, 0)
    this.avgLength = this.docLengths.length === 0 ? 0 : total / this.docLengths.length
  }

  get size(): number {
    return this.docIds.length
  }

  /**
   * 返回按 BM25 分数降序的命中结果。
   * @param queryTokens 已分词、已去重的查询 token
   */
  search(queryTokens: readonly string[], limit = 40): Bm25Hit[] {
    if (this.docIds.length === 0 || queryTokens.length === 0) {
      return []
    }

    const totalDocs = this.docIds.length
    const scores = new Float64Array(totalDocs)

    for (const token of queryTokens) {
      const posting = this.postings.get(token)
      if (!posting || posting.size === 0) {
        continue
      }
      const docFrequency = posting.size
      // 加 1 的平滑版本，保证 idf 恒为正，避免常见词贡献负分
      const idf = Math.log(1 + (totalDocs - docFrequency + 0.5) / (docFrequency + 0.5))
      for (const [docIndex, termFrequency] of posting) {
        const length = this.docLengths[docIndex] ?? 0
        const lengthRatio = this.avgLength > 0 ? length / this.avgLength : 0
        const denominator = termFrequency + this.k1 * (1 - this.b + this.b * lengthRatio)
        const contribution = (idf * (termFrequency * (this.k1 + 1))) / denominator
        scores[docIndex] = (scores[docIndex] ?? 0) + contribution
      }
    }

    const hits: Bm25Hit[] = []
    for (let docIndex = 0; docIndex < totalDocs; docIndex++) {
      const score = scores[docIndex] ?? 0
      if (score > 0) {
        hits.push({ id: this.docIds[docIndex] ?? '', score })
      }
    }
    hits.sort((a, b) => b.score - a.score)
    return hits.slice(0, Math.max(1, limit))
  }
}

/** 便于测试与外部复用的单次打分入口。 */
export function bm25Search(
  documents: readonly Bm25Document[],
  query: string,
  limit = 40,
  options: Bm25Options = {},
): Bm25Hit[] {
  const index = new Bm25Index(documents, options)
  return index.search(tokenize(query), limit)
}
