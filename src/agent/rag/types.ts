import type { DiaryRecord } from '../tools/context'

export type RagProgressPhase = 'download' | 'load' | 'index'

export interface RagProgress {
  phase: RagProgressPhase
  completed: number
  total: number
  percent: number
  message: string
}

export interface LocalRagStatus {
  state: 'not_installed' | 'ready' | 'working' | 'error'
  modelId: string
  modelBytes: number
  indexedDiaries: number
  indexedChunks: number
  message?: string
}

export interface SemanticSearchOptions {
  limit?: number
  minScore?: number
  mood?: string
  startDate?: string
  endDate?: string
  /**
   * 开启多问法召回：先用规则把口语外壳/时间状语去掉、拆复合句，再对每种问法各检索一次，
   * 结果一起做 RRF 融合。适合"首次检索结果太少或明显跑偏"的追问。
   */
  multiQuery?: boolean
  /** MMR 多样性强度，0 = 只按相关性，1 = 只按多样性，默认 0.75 */
  mmrLambda?: number
  /**
   * 检索模式：hybrid（默认）= 向量 + BM25 + RRF；dense = 只走向量。
   * 保留 dense 主要是为了评测时做 A/B 对照，以及低端机上临时降级。
   */
  retrievalMode?: 'dense' | 'hybrid'
}

/** 单条命中在各路召回里的原始信号，便于解释"为什么是它"以及排查检索质量。 */
export interface RetrievalSignals {
  /** 向量余弦相似度（-1..1） */
  dense: number
  /** BM25 分数（无上界，仅用于比较） */
  sparse: number
  /** RRF 融合分（多路名次累加） */
  fused: number
  /** 时间新鲜度 0..1 */
  recency: number
}

export interface SemanticSearchHit {
  id: string
  title: string
  content: string
  mood?: string | null
  createdAt: string
  score: number
  chunkIndex: number
  signals?: RetrievalSignals
}

export interface SemanticSearchResponse {
  available: boolean
  retrieval: 'local_semantic' | 'local_hybrid'
  /** dense = 仅向量；hybrid = 向量 + BM25 + RRF 融合 */
  mode?: 'dense' | 'hybrid'
  query: string
  /** 多问法召回时实际使用的问法（第一条为原始查询） */
  variants?: string[]
  count: number
  diaries: SemanticSearchHit[]
  indexedDiaries: number
  indexedChunks: number
  /**
   * 置信度门控：最强证据的向量相似度偏低且 BM25 也没命中时置 true。
   * Agent 应据此如实说明"没找到很相关的记录"，而不是硬编故事。
   */
  lowConfidence?: boolean
  reason?: 'MODEL_NOT_INSTALLED'
  message?: string
}

export interface EmbeddingProvider {
  readonly modelId: string
  readonly modelBytes: number
  isInstalled(): Promise<boolean>
  install(onProgress?: (progress: RagProgress) => void): Promise<void>
  embed(text: string): Promise<Float32Array>
}

export interface RagIndexEntry {
  diaryId: string
  chunkIndex: number
  modelId: string
  sourceHash: string
  sourceUpdatedAt: number
  vector: string
}

export interface RagIndexStore {
  list(modelId: string): Promise<RagIndexEntry[]>
  replaceDiary(
    modelId: string,
    diaryId: string,
    sourceHash: string,
    sourceUpdatedAt: number,
    vectors: readonly string[],
  ): Promise<void>
  removeDiary(modelId: string, diaryId: string): Promise<void>
  clear(modelId: string): Promise<void>
}

export interface SemanticRagAdapter {
  getStatus(): Promise<LocalRagStatus>
  prepare(
    diaries: readonly DiaryRecord[],
    onProgress?: (progress: RagProgress) => void,
  ): Promise<LocalRagStatus>
  search(
    query: string,
    diaries: readonly DiaryRecord[],
    options?: SemanticSearchOptions,
    onProgress?: (progress: RagProgress) => void,
  ): Promise<SemanticSearchResponse>
  clearIndex(): Promise<void>
}
