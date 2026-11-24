import { EVAL_DIARIES } from '../../src/agent/rag/eval/dataset'
import {
  buildSelfCheckQueries,
  formatSelfCheckReport,
  runSelfCheck,
} from '../../src/agent/rag/eval/selfCheck'
import { LocalSemanticRagService } from '../../src/agent/rag/service'
import type { DiaryRecord } from '../../src/agent/tools/context'
import { MemoryIndexStore, TopicClusterEmbeddingProvider } from '../fixtures/retrieval'

const createService = async (diaries: readonly DiaryRecord[] = EVAL_DIARIES) => {
  const rag = new LocalSemanticRagService(
    new TopicClusterEmbeddingProvider(),
    new MemoryIndexStore(),
  )
  await rag.prepare(diaries)
  return rag
}

describe('体检样本构造', () => {
  it('跳过加密、标题过短、正文为空的日记', () => {
    const diaries: DiaryRecord[] = [
      ...EVAL_DIARIES.slice(0, 2),
      {
        id: 'enc',
        title: '加密日记',
        content: '内容',
        createdAt: EVAL_DIARIES[0]!.createdAt,
        isEncrypted: true,
      },
      { id: 'short', title: '猫', content: '内容', createdAt: EVAL_DIARIES[0]!.createdAt },
      { id: 'empty', title: '没有正文', content: '   ', createdAt: EVAL_DIARIES[0]!.createdAt },
    ]

    const { queries, skipped } = buildSelfCheckQueries(diaries)

    expect(queries).toHaveLength(2)
    expect(skipped).toBe(3)
    expect(queries.every(item => item.query === item.query.trim())).toBe(true)
  })

  it('同名日记只保留一篇，避免无法判断召回的是不是自己', () => {
    const base = EVAL_DIARIES[0]!
    const { queries, skipped } = buildSelfCheckQueries([
      { ...base, id: 'a' },
      { ...base, id: 'b' },
      base,
    ])

    expect(queries).toHaveLength(1)
    expect(skipped).toBe(2)
  })
})

describe('检索体检', () => {
  it('真机可跑的代理指标：标题自询的 recall / MRR', async () => {
    const rag = await createService()
    const progress: number[] = []

    const report = await runSelfCheck(rag, EVAL_DIARIES, {
      k: 5,
      onProgress: item => progress.push(item.completed),
    })

    expect(report.queries).toBe(EVAL_DIARIES.length)
    expect(report.k).toBe(5)
    // 标题自询本质上是字面命中，混合召回不应低于纯向量
    expect(report.hybrid.recall).toBeGreaterThanOrEqual(report.dense.recall)
    expect(report.hybrid.mrr).toBeGreaterThan(0)
    expect(report.hybridMs).toBeGreaterThanOrEqual(0)
    expect(progress).toHaveLength(report.queries)
    expect(progress[progress.length - 1]).toBe(report.queries)
  })

  it('maxQueries 限制体检耗时', async () => {
    const rag = await createService()
    const report = await runSelfCheck(rag, EVAL_DIARIES, { k: 3, maxQueries: 4 })

    expect(report.queries).toBe(4)
    expect(report.skipped).toBe(0)
  })

  it('没有可体检日记时不抛错', async () => {
    const rag = await createService([])
    const report = await runSelfCheck(rag, [], { k: 5 })

    expect(report.queries).toBe(0)
    expect(formatSelfCheckReport(report)).toContain('暂时没有可体检的日记')
  })
})

describe('体检结果文案', () => {
  it('包含两种模式的指标与样本量', () => {
    const text = formatSelfCheckReport({
      k: 5,
      queries: 12,
      skipped: 2,
      dense: { recall: 0.83, mrr: 0.75, ndcg: 0.8 },
      hybrid: { recall: 0.92, mrr: 0.9, ndcg: 0.91 },
      hybridTop1Wins: 3,
      denseMs: 31,
      hybridMs: 44,
    })

    expect(text).toContain('12 篇')
    expect(text).toContain('跳过 2 篇')
    expect(text).toContain('recall@5 0.92')
    expect(text).toContain('recall@5 0.83')
    expect(text).toContain('31ms')
    expect(text).toContain('44ms')
  })
})
