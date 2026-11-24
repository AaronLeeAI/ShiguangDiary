import type { DiaryRecord } from '../tools/context'
import { Bm25Index } from './bm25'
import type { Bm25Document } from './bm25'
import { chunkDiary, diarySourceHash } from './chunking'
import { mmrSelect, reciprocalRankFusion, recencyWeight } from './fusion'
import { queryVariants } from './queryVariants'
import { tokenizeQuery } from './tokenize'
import type {
  EmbeddingProvider,
  LocalRagStatus,
  RagIndexEntry,
  RagIndexStore,
  RagProgress,
  SemanticRagAdapter,
  SemanticSearchHit,
  SemanticSearchOptions,
  SemanticSearchResponse,
} from './types'
import {
  cosineSimilarity01,
  decodeVector,
  encodeVector,
  normalizeVector,
  similarityToEncodedVector,
} from './vectors'

interface SyncSummary {
  entries: RagIndexEntry[]
  indexedDiaries: number
  indexedChunks: number
}

/** 每一路召回的候选数量。融合阶段只看名次，候选池要比最终条数大一个量级。 */
const DENSE_TOP_K = 40
const SPARSE_TOP_K = 40
/** 融合后进入 MMR 的候选倍数（limit * 该值）。 */
const CANDIDATE_MULTIPLIER = 4
/** 默认 MMR 强度：偏相关性，但抑制同一主题的重复条目。 */
const DEFAULT_MMR_LAMBDA = 0.75

/** 融合后的候选（chunk 级），带各路原始信号。 */
interface ChunkCandidate {
  key: string
  diaryId: string
  chunkIndex: number
  diary: DiaryRecord
  vector: string
  dense: number
  sparse: number
  recency: number
  fused: number
}

const toMillis = (value?: string, endOfDay = false): number | null => {
  if (!value) {
    return null
  }
  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) {
    return null
  }
  return endOfDay ? time + 86400000 : time
}

const reportProgress = (
  callback: ((progress: RagProgress) => void) | undefined,
  phase: RagProgress['phase'],
  completed: number,
  total: number,
  message: string,
) => {
  const percent = total <= 0 ? 100 : Math.round((completed / total) * 100)
  callback?.({ phase, completed, total, percent, message })
}

/** 索引条目在召回阶段的唯一键：同一篇日记的不同段落各自参与排序。 */
const entryKey = (entry: RagIndexEntry): string => `${entry.diaryId}#${entry.chunkIndex}`

/**
 * 日记快照的轻量指纹（O(n) 且只占常数内存）。
 * 用于判断 BM25 索引是否需要重建——直接拼全部 id 会产生每次检索都分配几十 KB 的字符串。
 */
function snapshotSignature(diaries: readonly DiaryRecord[]): string {
  let signature = diaries.length
  for (const diary of diaries) {
    signature = (signature * 31 + ((diary.updatedAt ?? diary.createdAt) % 1000003)) % 2147483647
    for (let index = 0; index < diary.id.length; index++) {
      signature = (signature * 33 + diary.id.charCodeAt(index)) % 2147483647
    }
  }
  return String(signature)
}

export class LocalSemanticRagService implements SemanticRagAdapter {
  private syncing: Promise<SyncSummary> | null = null
  /** BM25 索引按日记集合签名缓存，避免每次检索都重新分词全量日记。 */
  private bm25Cache: { signature: string; index: Bm25Index } | null = null

  constructor(
    private readonly embedding: EmbeddingProvider,
    private readonly store: RagIndexStore,
  ) {}

  /** 用日记快照构建 / 复用 BM25 索引（chunk 级）。 */
  private getBm25Index(diaries: readonly DiaryRecord[]): Bm25Index {
    const signature = snapshotSignature(diaries)
    if (this.bm25Cache?.signature === signature) {
      return this.bm25Cache.index
    }

    const documents: Bm25Document[] = []
    for (const diary of diaries) {
      for (const chunk of chunkDiary(diary)) {
        documents.push({
          id: `${diary.id}#${chunk.chunkIndex}`,
          // 标题参与匹配：很多日记正文只写"今天很累"，主题在标题里
          text: `${diary.title} ${chunk.content}`,
        })
      }
    }
    const index = new Bm25Index(documents)
    this.bm25Cache = { signature, index }
    return index
  }

  async getStatus(): Promise<LocalRagStatus> {
    const installed = await this.embedding.isInstalled()
    if (!installed) {
      return {
        state: 'not_installed',
        modelId: this.embedding.modelId,
        modelBytes: this.embedding.modelBytes,
        indexedDiaries: 0,
        indexedChunks: 0,
      }
    }
    const entries = await this.store.list(this.embedding.modelId)
    return {
      state: 'ready',
      modelId: this.embedding.modelId,
      modelBytes: this.embedding.modelBytes,
      indexedDiaries: new Set(entries.map(entry => entry.diaryId)).size,
      indexedChunks: entries.length,
    }
  }

  async prepare(
    diaries: readonly DiaryRecord[],
    onProgress?: (progress: RagProgress) => void,
  ): Promise<LocalRagStatus> {
    await this.embedding.install(onProgress)
    await this.syncIndex(diaries, onProgress)
    return this.getStatus()
  }

  async search(
    query: string,
    diaries: readonly DiaryRecord[],
    options: SemanticSearchOptions = {},
    onProgress?: (progress: RagProgress) => void,
  ): Promise<SemanticSearchResponse> {
    const cleanQuery = query.trim()
    if (!(await this.embedding.isInstalled())) {
      return {
        available: false,
        retrieval: 'local_semantic',
        query: cleanQuery,
        count: 0,
        diaries: [],
        indexedDiaries: 0,
        indexedChunks: 0,
        reason: 'MODEL_NOT_INSTALLED',
        message: '本地语义模型尚未启用，请先在助手页面启用本地语义检索。',
      }
    }

    const summary = await this.syncIndex(diaries, onProgress)
    if (!cleanQuery || summary.entries.length === 0) {
      return {
        available: true,
        retrieval: 'local_semantic',
        query: cleanQuery,
        count: 0,
        diaries: [],
        indexedDiaries: summary.indexedDiaries,
        indexedChunks: summary.indexedChunks,
      }
    }

    const start = toMillis(options.startDate)
    const end = toMillis(options.endDate, true)
    const mood = options.mood?.trim().toLowerCase()
    const retrievalMode = options.retrievalMode ?? 'hybrid'
    const eligible = new Map(
      diaries
        .filter(diary => !diary.isEncrypted)
        .filter(diary => start == null || diary.createdAt >= start)
        .filter(diary => end == null || diary.createdAt < end)
        .filter(diary => !mood || (diary.mood ?? '').toLowerCase() === mood)
        .map(diary => [diary.id, diary]),
    )
    const eligibleEntries = summary.entries.filter(entry => eligible.has(entry.diaryId))
    if (eligibleEntries.length === 0) {
      return {
        available: true,
        retrieval: 'local_hybrid',
        mode: retrievalMode,
        query: cleanQuery,
        count: 0,
        diaries: [],
        indexedDiaries: summary.indexedDiaries,
        indexedChunks: summary.indexedChunks,
        lowConfidence: true,
        message: '当前筛选条件下没有可检索的日记。',
      }
    }

    // 多问法召回：仅在模型明确要求或首次检索不理想时开启，避免每次都付多一次推理成本。
    const variants = options.multiQuery ? queryVariants(cleanQuery, 3) : [cleanQuery]

    reportProgress(onProgress, 'load', 0, variants.length, '正在理解问题…')

    // 第一路：向量召回（语义相近）。多问法时每种问法各召回一次。
    const denseLists: string[][] = []
    const bestDense = new Map<string, number>()
    for (let index = 0; index < variants.length; index++) {
      const queryVector = normalizeVector(
        await this.embedding.embed(variants[index].slice(0, 1000)),
      )
      reportProgress(onProgress, 'load', index + 1, variants.length, '正在理解问题…')

      const ranked: Array<{ key: string; score: number }> = []
      for (const entry of eligibleEntries) {
        const score = similarityToEncodedVector(queryVector, entry.vector)
        if (score == null) {
          continue
        }
        ranked.push({ key: entryKey(entry), score })
      }
      ranked.sort((a, b) => b.score - a.score)
      const top = ranked.slice(0, DENSE_TOP_K)
      for (const item of top) {
        const previous = bestDense.get(item.key)
        if (previous == null || item.score > previous) {
          bestDense.set(item.key, item.score)
        }
      }
      denseLists.push(top.map(item => item.key))
    }

    reportProgress(onProgress, 'load', variants.length, variants.length, '正在匹配本地日记…')

    // 第二路：BM25 字面召回（人名、地名、专有名词靠它兜底）。
    const useSparse = (options.retrievalMode ?? 'hybrid') === 'hybrid'
    const bm25 = useSparse ? this.getBm25Index([...eligible.values()]) : null
    const sparseLists: string[][] = []
    const bestSparse = new Map<string, number>()
    if (bm25) {
      for (const variant of variants) {
        const hits = bm25.search(tokenizeQuery(variant), SPARSE_TOP_K)
        for (const hit of hits) {
          const previous = bestSparse.get(hit.id)
          if (previous == null || hit.score > previous) {
            bestSparse.set(hit.id, hit.score)
          }
        }
        sparseLists.push(hits.map(hit => hit.id))
      }
    }

    // 融合：只看名次不看绝对分数，天然规避两种分数的量纲差异。
    const fused = reciprocalRankFusion([...denseLists, ...sparseLists])
    const entryByKey = new Map(eligibleEntries.map(entry => [entryKey(entry), entry]))

    const candidates: ChunkCandidate[] = []
    for (const [key, fusedScore] of fused) {
      const entry = entryByKey.get(key)
      if (!entry) {
        continue
      }
      const diary = eligible.get(entry.diaryId)
      if (!diary) {
        continue
      }
      candidates.push({
        key,
        diaryId: entry.diaryId,
        chunkIndex: entry.chunkIndex,
        diary,
        vector: entry.vector,
        dense: bestDense.get(key) ?? 0,
        sparse: bestSparse.get(key) ?? 0,
        recency: recencyWeight(diary.updatedAt ?? diary.createdAt),
        fused: fusedScore,
      })
    }

    if (candidates.length === 0) {
      return {
        available: true,
        retrieval: retrievalMode === 'hybrid' ? 'local_hybrid' : 'local_semantic',
        mode: retrievalMode,
        query: cleanQuery,
        ...(options.multiQuery ? { variants } : {}),
        count: 0,
        diaries: [],
        indexedDiaries: summary.indexedDiaries,
        indexedChunks: summary.indexedChunks,
        lowConfidence: true,
        message: '没有找到相关的日记片段，可以换个说法再试一次。',
      }
    }

    const limit = Math.max(1, Math.min(20, Math.floor(options.limit ?? 6)))
    const minScore = Math.max(-1, Math.min(1, options.minScore ?? 0.25))

    // 同一篇日记只保留最强的那个 chunk：用户要的是"哪几篇日记"，
    // 不是同一篇日记的 5 个相邻段落。
    const bestByDiary = new Map<string, ChunkCandidate>()
    for (const candidate of candidates) {
      const previous = bestByDiary.get(candidate.diaryId)
      if (
        !previous ||
        candidate.fused > previous.fused ||
        (candidate.fused === previous.fused && candidate.recency > previous.recency)
      ) {
        bestByDiary.set(candidate.diaryId, candidate)
      }
    }

    const shortlist = [...bestByDiary.values()]
      .sort((a, b) => b.fused - a.fused || b.recency - a.recency)
      .slice(0, limit * CANDIDATE_MULTIPLIER)

    // 再在日记之间做一次 MMR，避免 TOP-K 全是同一主题的近似重复内容。
    const decoded = new Map<string, ReturnType<typeof decodeVector>>()
    const vectorOf = (candidate: ChunkCandidate) => {
      if (!decoded.has(candidate.key)) {
        decoded.set(candidate.key, decodeVector(candidate.vector))
      }
      return decoded.get(candidate.key) ?? null
    }
    const selected = mmrSelect(shortlist, {
      limit,
      lambda: options.mmrLambda ?? DEFAULT_MMR_LAMBDA,
      relevanceOf: candidate => candidate.fused,
      similarity: (a, b) => cosineSimilarity01(vectorOf(a), vectorOf(b)),
    }).sort((a, b) => b.fused - a.fused || b.recency - a.recency)

    const maxFused = selected[0]?.fused ?? 0
    const hits: SemanticSearchHit[] = selected.map(candidate => {
      const chunk = chunkDiary(candidate.diary)[candidate.chunkIndex]
      return {
        id: candidate.diary.id,
        title: candidate.diary.title,
        content: chunk?.content.slice(0, 520) ?? candidate.diary.content.slice(0, 520),
        mood: candidate.diary.mood,
        createdAt: new Date(candidate.diary.createdAt).toISOString(),
        // 相对融合分：1 = 本轮最强证据，便于 UI/日志直观比较
        score: maxFused > 0 ? Number((candidate.fused / maxFused).toFixed(3)) : 0,
        chunkIndex: candidate.chunkIndex,
        signals: {
          dense: Number(candidate.dense.toFixed(3)),
          sparse: Number(candidate.sparse.toFixed(3)),
          fused: Number(candidate.fused.toFixed(4)),
          recency: Number(candidate.recency.toFixed(3)),
        },
      }
    })

    const strongestDense = hits.reduce((max, hit) => Math.max(max, hit.signals?.dense ?? 0), 0)
    const strongestSparse = hits.reduce((max, hit) => Math.max(max, hit.signals?.sparse ?? 0), 0)
    // 置信度门控：两条路都没给出像样证据时，宁可让模型说"没找到"。
    const lowConfidence = hits.length === 0 || (strongestDense < minScore && strongestSparse <= 0)

    return {
      available: true,
      retrieval: retrievalMode === 'hybrid' ? 'local_hybrid' : 'local_semantic',
      mode: retrievalMode,
      query: cleanQuery,
      ...(options.multiQuery ? { variants } : {}),
      count: hits.length,
      diaries: hits,
      indexedDiaries: summary.indexedDiaries,
      indexedChunks: summary.indexedChunks,
      ...(lowConfidence
        ? { lowConfidence: true, message: '相关度偏低，建议换个说法或放宽时间范围。' }
        : {}),
    }
  }

  async clearIndex(): Promise<void> {
    await this.store.clear(this.embedding.modelId)
  }

  private async syncIndex(
    diaries: readonly DiaryRecord[],
    onProgress?: (progress: RagProgress) => void,
  ): Promise<SyncSummary> {
    if (this.syncing) {
      return this.syncing
    }
    this.syncing = this.performSync(diaries, onProgress).finally(() => {
      this.syncing = null
    })
    return this.syncing
  }

  private async performSync(
    diaries: readonly DiaryRecord[],
    onProgress?: (progress: RagProgress) => void,
  ): Promise<SyncSummary> {
    const modelId = this.embedding.modelId
    const eligible = diaries.filter(
      diary => !diary.isEncrypted && Boolean((diary.title || diary.content).trim()),
    )
    const existing = await this.store.list(modelId)
    const byDiary = new Map<string, RagIndexEntry[]>()
    for (const entry of existing) {
      const group = byDiary.get(entry.diaryId) ?? []
      group.push(entry)
      byDiary.set(entry.diaryId, group)
    }

    const currentIds = new Set(eligible.map(diary => diary.id))
    for (const diaryId of byDiary.keys()) {
      if (!currentIds.has(diaryId)) {
        await this.store.removeDiary(modelId, diaryId)
      }
    }

    const pending = eligible.filter(diary => {
      const hash = diarySourceHash(diary)
      const chunks = chunkDiary(diary)
      const indexed = byDiary.get(diary.id) ?? []
      return indexed.length !== chunks.length || indexed.some(entry => entry.sourceHash !== hash)
    })

    reportProgress(
      onProgress,
      'index',
      0,
      pending.length,
      pending.length ? '正在建立本地语义索引…' : '本地语义索引已是最新',
    )
    for (let index = 0; index < pending.length; index++) {
      const diary = pending[index]
      const chunks = chunkDiary(diary)
      const vectors: string[] = []
      try {
        for (const chunk of chunks) {
          vectors.push(encodeVector(await this.embedding.embed(chunk.embeddingText)))
        }
      } catch (error) {
        throw new Error(`第 ${index + 1} 篇日记的本地向量生成失败：${describeError(error)}`, {
          cause: error,
        })
      }
      try {
        await this.store.replaceDiary(
          modelId,
          diary.id,
          diarySourceHash(diary),
          diary.updatedAt ?? diary.createdAt,
          vectors,
        )
      } catch (error) {
        throw new Error(`第 ${index + 1} 篇日记的本地索引保存失败：${describeError(error)}`, {
          cause: error,
        })
      }
      reportProgress(
        onProgress,
        'index',
        index + 1,
        pending.length,
        `正在索引日记（${index + 1}/${pending.length}）`,
      )
    }

    const entries = await this.store.list(modelId)
    return {
      entries,
      indexedDiaries: new Set(entries.map(entry => entry.diaryId)).size,
      indexedChunks: entries.length,
    }
  }
}

function describeError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === 'object' && error !== null) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
    try {
      return JSON.stringify(error)
    } catch {
      return '未知错误'
    }
  }
  return String(error)
}
