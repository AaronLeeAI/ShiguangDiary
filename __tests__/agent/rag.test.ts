import { chunkDiary } from '../../src/agent/rag/chunking'
import { LocalSemanticRagService } from '../../src/agent/rag/service'
import { meanPoolLastHiddenState } from '../../src/agent/rag/pooling'
import type {
  EmbeddingProvider,
  RagIndexEntry,
  RagIndexStore,
  RagProgress,
} from '../../src/agent/rag/types'
import {
  encodeVector,
  normalizeVector,
  similarityToEncodedVector,
} from '../../src/agent/rag/vectors'
import type { DiaryRecord } from '../../src/agent/tools/context'

class MemoryIndexStore implements RagIndexStore {
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

class FakeEmbeddingProvider implements EmbeddingProvider {
  readonly modelId = 'fake-semantic-v1'
  readonly modelBytes = 10
  installed = true
  embedCalls = 0

  async isInstalled() {
    return this.installed
  }

  async install(onProgress?: (progress: RagProgress) => void) {
    this.installed = true
    onProgress?.({
      phase: 'download',
      completed: 10,
      total: 10,
      percent: 100,
      message: 'ready',
    })
  }

  async embed(text: string) {
    this.embedCalls++
    if (/加班|项目|职场|工作压力/.test(text)) {
      return new Float32Array([1, 0, 0])
    }
    if (/公园|散步|户外|放松/.test(text)) {
      return new Float32Array([0, 1, 0])
    }
    return new Float32Array([0, 0, 1])
  }
}

const diaries: DiaryRecord[] = [
  {
    id: 'work',
    title: '忙碌的一天',
    content: '连续加班到深夜，项目终于提交了。',
    mood: '疲惫',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'park',
    title: '周末',
    content: '下午去公园散步，吹风以后轻松了许多。',
    mood: '开心',
    createdAt: 1700100000000,
    updatedAt: 1700100000000,
  },
  {
    id: 'secret',
    title: '私密工作记录',
    content: '这篇加密日记不应建立语义索引。',
    createdAt: 1700200000000,
    updatedAt: 1700200000000,
    isEncrypted: true,
  },
]

describe('Local semantic RAG', () => {
  it('把长日记稳定切成有重叠的片段', () => {
    const diary: DiaryRecord = {
      id: 'long',
      title: '长文',
      content: `${'第一段内容。'.repeat(30)}${'第二段内容。'.repeat(30)}`,
      createdAt: 1700000000000,
    }
    const chunks = chunkDiary(diary, { maxChars: 120, overlapChars: 20 })

    expect(chunks.length).toBeGreaterThan(2)
    expect(chunks.map(chunk => chunk.chunkIndex)).toEqual(chunks.map((_, index) => index))
    expect(chunks.every(chunk => chunk.embeddingText.includes('标题：长文'))).toBe(true)
  })

  it('量化后的向量仍保持接近的余弦分数', () => {
    const source = normalizeVector(new Float32Array([0.8, 0.6, 0]))
    const score = similarityToEncodedVector(source, encodeVector(source))

    expect(score).not.toBeNull()
    expect(score as number).toBeGreaterThan(0.99)
  })

  it('把模型的 token 隐状态平均成固定维度句向量', () => {
    const pooled = meanPoolLastHiddenState(new Float32Array([1, 2, 3, 3, 4, 5]), [1, 2, 3])

    expect(Array.from(pooled)).toEqual([2, 3, 4])
    expect(() => meanPoolLastHiddenState(new Float32Array([1, 2]), [1, 2, 3])).toThrow(
      '模型输出向量长度不正确',
    )
  })

  it('没有相同关键词也能召回语义相关日记，并跳过加密日记', async () => {
    const provider = new FakeEmbeddingProvider()
    const store = new MemoryIndexStore()
    const rag = new LocalSemanticRagService(provider, store)

    await rag.prepare(diaries)
    const result = await rag.search('最近有什么职场压力？', diaries)

    expect(result.available).toBe(true)
    expect(result.diaries[0]).toMatchObject({ id: 'work', title: '忙碌的一天' })
    expect(result.diaries.some(item => item.id === 'secret')).toBe(false)
    expect(new Set(store.entries.map(entry => entry.diaryId))).toEqual(new Set(['work', 'park']))
  })

  it('只为新增或变更的日记重建向量', async () => {
    const provider = new FakeEmbeddingProvider()
    const rag = new LocalSemanticRagService(provider, new MemoryIndexStore())

    await rag.prepare(diaries)
    const firstCalls = provider.embedCalls
    await rag.prepare(diaries)
    expect(provider.embedCalls).toBe(firstCalls)

    const changed = diaries.map(diary =>
      diary.id === 'park'
        ? { ...diary, content: `${diary.content} 下次还想去户外。`, updatedAt: 1700300000000 }
        : diary,
    )
    await rag.prepare(changed)
    expect(provider.embedCalls).toBe(firstCalls + 1)
  })

  it('模型未安装时不会偷偷联网下载', async () => {
    const provider = new FakeEmbeddingProvider()
    provider.installed = false
    const rag = new LocalSemanticRagService(provider, new MemoryIndexStore())

    await expect(rag.search('工作压力', diaries)).resolves.toMatchObject({
      available: false,
      reason: 'MODEL_NOT_INSTALLED',
    })
    expect(provider.embedCalls).toBe(0)
  })
})
