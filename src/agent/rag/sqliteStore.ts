import { diaryEmbeddingRepository } from '../../database/repository'
import type { RagIndexStore } from './types'

export const sqliteRagIndexStore: RagIndexStore = {
  async list(modelId) {
    return diaryEmbeddingRepository.listByModel(modelId)
  },

  async replaceDiary(modelId, diaryId, sourceHash, sourceUpdatedAt, vectors) {
    await diaryEmbeddingRepository.replaceDiary(
      modelId,
      diaryId,
      sourceHash,
      sourceUpdatedAt,
      vectors,
    )
  },

  async removeDiary(modelId, diaryId) {
    await diaryEmbeddingRepository.removeDiary(modelId, diaryId)
  },

  async clear(modelId) {
    await diaryEmbeddingRepository.clear(modelId)
  },
}
