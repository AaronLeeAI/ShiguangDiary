import type { DiaryRecord } from '../tools/context'
import { chunkDiary, diarySourceHash } from './chunking'
import type {
  EmbeddingProvider,
  LocalRagStatus,
  RagIndexEntry,
  RagIndexStore,
  RagProgress,
  SemanticRagAdapter,
  SemanticSearchOptions,
  SemanticSearchResponse,
} from './types'
import { encodeVector, normalizeVector, similarityToEncodedVector } from './vectors'

interface SyncSummary {
  entries: RagIndexEntry[]
  indexedDiaries: number
  indexedChunks: number
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

export class LocalSemanticRagService implements SemanticRagAdapter {
  private syncing: Promise<SyncSummary> | null = null

  constructor(
    private readonly embedding: EmbeddingProvider,
    private readonly store: RagIndexStore,
  ) {}

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

    reportProgress(onProgress, 'load', 0, 1, '正在理解问题…')
    const queryVector = normalizeVector(await this.embedding.embed(cleanQuery.slice(0, 1000)))
    reportProgress(onProgress, 'load', 1, 1, '正在匹配本地日记…')

    const start = toMillis(options.startDate)
    const end = toMillis(options.endDate, true)
    const mood = options.mood?.trim().toLowerCase()
    const eligible = new Map(
      diaries
        .filter(diary => !diary.isEncrypted)
        .filter(diary => start == null || diary.createdAt >= start)
        .filter(diary => end == null || diary.createdAt < end)
        .filter(diary => !mood || (diary.mood ?? '').toLowerCase() === mood)
        .map(diary => [diary.id, diary]),
    )

    const bestByDiary = new Map<
      string,
      { entry: RagIndexEntry; score: number; diary: DiaryRecord }
    >()
    for (const entry of summary.entries) {
      const diary = eligible.get(entry.diaryId)
      if (!diary) {
        continue
      }
      const score = similarityToEncodedVector(queryVector, entry.vector)
      if (score == null) {
        continue
      }
      const previous = bestByDiary.get(entry.diaryId)
      if (!previous || score > previous.score) {
        bestByDiary.set(entry.diaryId, { entry, score, diary })
      }
    }

    const limit = Math.max(1, Math.min(20, Math.floor(options.limit ?? 6)))
    const minScore = Math.max(-1, Math.min(1, options.minScore ?? 0.25))
    const hits = [...bestByDiary.values()]
      .filter(item => item.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => {
        const chunk = chunkDiary(item.diary)[item.entry.chunkIndex]
        return {
          id: item.diary.id,
          title: item.diary.title,
          content: chunk?.content.slice(0, 520) ?? item.diary.content.slice(0, 520),
          mood: item.diary.mood,
          createdAt: new Date(item.diary.createdAt).toISOString(),
          score: Number(item.score.toFixed(3)),
          chunkIndex: item.entry.chunkIndex,
        }
      })

    return {
      available: true,
      retrieval: 'local_semantic',
      query: cleanQuery,
      count: hits.length,
      diaries: hits,
      indexedDiaries: summary.indexedDiaries,
      indexedChunks: summary.indexedChunks,
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
