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
}

export interface SemanticSearchHit {
  id: string
  title: string
  content: string
  mood?: string | null
  createdAt: string
  score: number
  chunkIndex: number
}

export interface SemanticSearchResponse {
  available: boolean
  retrieval: 'local_semantic'
  query: string
  count: number
  diaries: SemanticSearchHit[]
  indexedDiaries: number
  indexedChunks: number
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
