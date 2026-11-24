/**
 * 检索相关测试的共用替身。
 *
 * 说明：真实 embedding 模型有 130 MiB、需要原生推理，不能进单测。
 * 这里用一个"按主题簇映射到固定维度"的确定性假模型，验证的是
 * 融合 / 排序 / 过滤 / 门控这套逻辑，不是模型本身的质量。
 */
import type {
  EmbeddingProvider,
  RagIndexEntry,
  RagIndexStore,
  RagProgress,
} from '../../src/agent/rag/types'

export class MemoryIndexStore implements RagIndexStore {
  entries: RagIndexEntry[] = []

  async list(modelId: string) {
    return this.entries.filter(entry => entry.modelId === modelId)
  }

  async replaceDiary(
    modelId: string,
    diaryId: string,
    sourceHash: string,
    sourceUpdatedAt: number,
    vectors: readonly string[],
  ) {
    this.entries = this.entries.filter(
      entry => entry.modelId !== modelId || entry.diaryId !== diaryId,
    )
    this.entries.push(
      ...vectors.map((vector, chunkIndex) => ({
        diaryId,
        chunkIndex,
        modelId,
        sourceHash,
        sourceUpdatedAt,
        vector,
      })),
    )
  }

  async removeDiary(modelId: string, diaryId: string) {
    this.entries = this.entries.filter(
      entry => entry.modelId !== modelId || entry.diaryId !== diaryId,
    )
  }

  async clear(modelId: string) {
    this.entries = this.entries.filter(entry => entry.modelId !== modelId)
  }
}

/**
 * 主题簇。刻意不包含专有名词（环球影城 / 人类简史 / livehouse），
 * 用来模拟"小模型对生僻实体不敏感"这一真实缺陷——这类查询必须靠 BM25 兜底。
 */
const TOPIC_CLUSTERS: readonly (readonly string[])[] = [
  ['发呆', '安静', '轻松', '消磨', '午后', '咖啡', '平静', '放松'],
  ['家人', '奶奶', '红烧肉', '火锅', '老王', '吃饭', '温暖', '老家'],
  ['跑步', '心率', '五公里', '运动', '腿'],
  ['焦虑', '汇报', '手心', '紧张', '不安'],
  ['加班', '项目', '凌晨', '疲惫', '改稿'],
  ['搬家', '窗外', '梧桐', '新家'],
]

const DIMENSIONS = TOPIC_CLUSTERS.length + 1

/** 未知主题统一落到最后一维，制造"多个实体挤在同一桶"的退化情况。 */
export class TopicClusterEmbeddingProvider implements EmbeddingProvider {
  readonly modelId = 'fake-topic-clusters-v1'
  readonly modelBytes = 1024
  installed = true
  embedCalls = 0

  async isInstalled() {
    return this.installed
  }

  async install(onProgress?: (progress: RagProgress) => void) {
    this.installed = true
    onProgress?.({
      phase: 'download',
      completed: 1,
      total: 1,
      percent: 100,
      message: 'ready',
    })
  }

  async embed(text: string) {
    this.embedCalls++
    const vector = new Float32Array(DIMENSIONS)
    let matched = false
    TOPIC_CLUSTERS.forEach((keywords, index) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        vector[index] = 1
        matched = true
      }
    })
    if (!matched) {
      vector[DIMENSIONS - 1] = 1
    }
    return vector
  }
}
