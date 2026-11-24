export { chunkDiary, diarySourceHash, normalizeDiaryContent } from './chunking'
export { LocalSemanticRagService } from './service'
export { encodeVector, normalizeVector, similarityToEncodedVector } from './vectors'
export type {
  EmbeddingProvider,
  LocalRagStatus,
  RagIndexEntry,
  RagIndexStore,
  RagProgress,
  RagProgressPhase,
  SemanticRagAdapter,
  SemanticSearchHit,
  SemanticSearchOptions,
  SemanticSearchResponse,
} from './types'
