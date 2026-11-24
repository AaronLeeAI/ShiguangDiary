import { LocalSemanticRagService } from './service'
import { onnxMultilingualEmbeddingProvider } from './onnxEmbedder'
import { sqliteRagIndexStore } from './sqliteStore'

export const localSemanticRag = new LocalSemanticRagService(
  onnxMultilingualEmbeddingProvider,
  sqliteRagIndexStore,
)
