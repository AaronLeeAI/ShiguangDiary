import { EVAL_DIARIES, EVAL_QUERIES } from '../../src/agent/rag/eval/dataset'
import { aggregateScores, formatScore } from '../../src/agent/rag/eval/metrics'
import type { RetrievalScore } from '../../src/agent/rag/eval/metrics'
import { LocalSemanticRagService } from '../../src/agent/rag/service'
import type { DiaryRecord } from '../../src/agent/tools/context'
import { MemoryIndexStore, TopicClusterEmbeddingProvider } from '../fixtures/retrieval'

const K = 5

async function runEval(mode: 'dense' | 'hybrid') {
  const rag = new LocalSemanticRagService(
    new TopicClusterEmbeddingProvider(),
    new MemoryIndexStore(),
  )
  await rag.prepare(EVAL_DIARIES)

  const perQuery: Array<{ query: string; ranked: string[]; relevant: string[]; kind: string }> = []
  for (const item of EVAL_QUERIES) {
    const response = await rag.search(item.query, EVAL_DIARIES, { limit: K, retrievalMode: mode })
    perQuery.push({
      query: item.query,
      ranked: response.diaries.map(hit => hit.id),
      relevant: item.relevant,
      kind: item.kind,
    })
  }

  const scores: RetrievalScore = aggregateScores(perQuery, K)
  return { scores, perQuery }
}

describe('检索质量门禁', () => {
  it('混合检索在黄金集上达到基线，且优于纯向量', async () => {
    const dense = await runEval('dense')
    const hybrid = await runEval('hybrid')

    // 输出指标，便于在 CI 日志里对比历史
    console.log(`[rag-eval] dense  @${K} ${formatScore(dense.scores)}`)
    console.log(`[rag-eval] hybrid @${K} ${formatScore(hybrid.scores)}`)

    // 绝对基线：黄金集上的正确日记必须基本都能进 top5
    expect(hybrid.scores.recall).toBeGreaterThanOrEqual(0.9)
    expect(hybrid.scores.ndcg).toBeGreaterThanOrEqual(0.85)

    // 相对收益：加入 BM25 后排序质量不应下降
    expect(hybrid.scores.recall).toBeGreaterThanOrEqual(dense.scores.recall)
    expect(hybrid.scores.ndcg).toBeGreaterThanOrEqual(dense.scores.ndcg)
  })

  it('字面类查询靠 BM25 把实体日记顶到第一位', async () => {
    const { perQuery } = await runEval('hybrid')
    const lexical = perQuery.filter(item => item.kind === 'lexical')

    expect(lexical.length).toBeGreaterThan(0)
    for (const item of lexical) {
      expect(item.ranked[0]).toBe(item.relevant[0])
    }
  })
})

describe('混合检索行为', () => {
  const diaries: DiaryRecord[] = [
    ...EVAL_DIARIES,
    {
      id: 'd-secret',
      title: '加密日记',
      content: '这篇加密日记不应该进入检索结果。',
      createdAt: EVAL_DIARIES[0]!.createdAt,
      isEncrypted: true,
    },
  ]

  const createService = async () => {
    const rag = new LocalSemanticRagService(
      new TopicClusterEmbeddingProvider(),
      new MemoryIndexStore(),
    )
    await rag.prepare(diaries)
    return rag
  }

  it('返回融合信号，且标记 hybrid 模式', async () => {
    const rag = await createService()
    const response = await rag.search('环球影城', diaries, { limit: 3 })

    expect(response.mode).toBe('hybrid')
    expect(response.retrieval).toBe('local_hybrid')
    expect(response.diaries[0]).toMatchObject({ id: 'd-universal' })
    const signals = response.diaries[0]?.signals
    expect(signals?.sparse).toBeGreaterThan(0)
    expect(signals?.dense).toBeGreaterThan(0)
    expect(signals?.fused).toBeGreaterThan(0)
    // 相对融合分：榜首应为 1
    expect(response.diaries[0]?.score).toBe(1)
  })

  it('dense 模式只走向量，sparse 信号为 0', async () => {
    const rag = await createService()
    const response = await rag.search('环球影城', diaries, {
      limit: 3,
      retrievalMode: 'dense',
    })

    expect(response.mode).toBe('dense')
    expect(response.diaries.every(hit => (hit.signals?.sparse ?? 0) === 0)).toBe(true)
  })

  it('加密日记不会出现在检索结果里', async () => {
    const rag = await createService()
    const response = await rag.search('加密日记', diaries, { limit: 10 })
    expect(response.diaries.some(hit => hit.id === 'd-secret')).toBe(false)
  })

  it('筛选条件排除全部日记时，明确返回低置信度而不是空转', async () => {
    const rag = await createService()
    const response = await rag.search('环球影城', diaries, { limit: 3, mood: '不存在的情绪' })

    expect(response.count).toBe(0)
    expect(response.lowConfidence).toBe(true)
    expect(response.message).toContain('没有可检索的日记')
  })

  it('multiQuery 会给出实际使用的多种问法', async () => {
    const rag = await createService()
    const response = await rag.search('你还记得前段时间我在环球影城排队那次吗', diaries, {
      limit: 3,
      multiQuery: true,
    })

    expect(response.variants?.length).toBeGreaterThan(1)
    expect(response.variants?.[0]).toBe('你还记得前段时间我在环球影城排队那次吗')
    expect(response.diaries[0]?.id).toBe('d-universal')
  })

  it('同一篇日记只返回一次，避免相邻段落占满结果', async () => {
    const longDiary: DiaryRecord = {
      id: 'd-long',
      title: '很长的日记',
      content: '咖啡店很安静。'.repeat(80),
      createdAt: EVAL_DIARIES[0]!.createdAt,
    }
    const rag = new LocalSemanticRagService(
      new TopicClusterEmbeddingProvider(),
      new MemoryIndexStore(),
    )
    await rag.prepare([longDiary, ...EVAL_DIARIES])
    const response = await rag.search('安静的咖啡店', [longDiary, ...EVAL_DIARIES], { limit: 6 })

    const ids = response.diaries.map(hit => hit.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
