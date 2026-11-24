import { Bm25Index, bm25Search } from '../../src/agent/rag/bm25'
import { mmrSelect, reciprocalRankFusion, recencyWeight } from '../../src/agent/rag/fusion'
import { queryVariants } from '../../src/agent/rag/queryVariants'
import { tokenize, tokenizeQuery } from '../../src/agent/rag/tokenize'

describe('分词', () => {
  it('中文按 2-gram 切分，保证任意双字词都能被命中', () => {
    expect(tokenize('安静的咖啡馆')).toEqual(['安静', '静的', '的咖', '咖啡', '啡馆'])
  })

  it('单字虚词不单独成词，实词保留', () => {
    expect(tokenize('猫')).toEqual(['猫'])
    expect(tokenize('的')).toEqual([])
  })

  it('中英混排分别处理，英文转小写并去停用词', () => {
    const tokens = tokenize('用 iPhone 拍 livehouse 的 the 照片')
    expect(tokens).toContain('livehouse')
    expect(tokens).toContain('iphone')
    expect(tokens).not.toContain('the')
    expect(tokens).toContain('照片')
  })

  it('查询 token 去重，避免同一词重复加权', () => {
    expect(tokenizeQuery('咖啡咖啡')).toEqual(['咖啡', '啡咖'])
  })
})

describe('BM25', () => {
  const documents = [
    { id: 'd1', text: '加班到凌晨，项目终于上线' },
    { id: 'd2', text: '在公园散步，风吹得很舒服' },
    { id: 'd3', text: '去环球影城排队两小时，过山车很刺激' },
  ]

  it('字面精确命中排在第一位', () => {
    const hits = bm25Search(documents, '环球影城')
    expect(hits[0]?.id).toBe('d3')
    expect(hits[0]?.score).toBeGreaterThan(0)
  })

  it('完全无关的查询不返回结果', () => {
    expect(bm25Search(documents, '量子纠缠')).toEqual([])
  })

  it('IDF 会压低高频通用词的权重', () => {
    const index = new Bm25Index(documents)
    const [specific] = index.search(tokenizeQuery('过山车'), 1)
    const broad = index.search(tokenizeQuery('的'), 1)
    expect(specific?.score).toBeGreaterThan(0)
    expect(broad).toEqual([])
  })
})

describe('RRF 名次融合', () => {
  it('同一结果出现在多路中会累加分数', () => {
    const fused = reciprocalRankFusion([
      ['a', 'b'],
      ['b', 'c'],
    ])
    expect(fused.get('b')).toBeGreaterThan(fused.get('a') ?? 0)
    expect(fused.get('b')).toBeGreaterThan(fused.get('c') ?? 0)
  })

  it('不使用绝对分数，名次相同则贡献相同', () => {
    const fused = reciprocalRankFusion([['a'], ['b']])
    expect(fused.get('a')).toBeCloseTo(fused.get('b') ?? 0, 10)
  })
})

describe('MMR 多样性', () => {
  const items = [
    { id: 'a', relevance: 1, vector: [1, 0] },
    { id: 'b', relevance: 0.95, vector: [0.99, 0.01] },
    { id: 'c', relevance: 0.8, vector: [0, 1] },
  ]
  const cosine = (left: number[], right: number[]) => {
    const dot = left.reduce((sum, value, index) => sum + value * (right[index] ?? 0), 0)
    return Math.max(0, Math.min(1, dot))
  }

  it('第二条会避开与第一条几乎重复的候选', () => {
    const selected = mmrSelect(items, {
      limit: 2,
      lambda: 0.5,
      relevanceOf: item => item.relevance,
      similarity: (a, b) => cosine(a.vector, b.vector),
    })
    expect(selected.map(item => item.id)).toEqual(['a', 'c'])
  })

  it('lambda=1 时退化为纯相关性排序', () => {
    const selected = mmrSelect(items, {
      limit: 2,
      lambda: 1,
      relevanceOf: item => item.relevance,
      similarity: (a, b) => cosine(a.vector, b.vector),
    })
    expect(selected.map(item => item.id)).toEqual(['a', 'b'])
  })
})

describe('时间衰减', () => {
  it('越新的日记权重越高，且不超过 1', () => {
    const now = Date.UTC(2026, 2, 1)
    const fresh = recencyWeight(now, now)
    const halfYear = recencyWeight(now - 180 * 86400000, now)
    const old = recencyWeight(now - 720 * 86400000, now)

    expect(fresh).toBe(1)
    expect(halfYear).toBeCloseTo(0.5, 3)
    expect(old).toBeLessThan(halfYear)
    expect(old).toBeGreaterThan(0)
  })
})

describe('多问法改写', () => {
  it('去掉提问外壳和语气词', () => {
    const [original, stripped] = queryVariants('你还记得我上次去哪里玩吗')
    expect(original).toBe('你还记得我上次去哪里玩吗')
    expect(stripped).toBe('我上次去哪里玩')
  })

  it('去掉时间状语，但保留原始查询', () => {
    const variants = queryVariants('前段时间我去环球影城那次')
    expect(variants[0]).toContain('环球影城')
    expect(variants.some(variant => !variant.includes('前段时间'))).toBe(true)
  })

  it('复合问句拆成子问题', () => {
    const variants = queryVariants('我最近心情怎么样，还有运动记录如何')
    expect(variants.length).toBeGreaterThan(1)
    expect(variants.length).toBeLessThanOrEqual(3)
  })

  it('空查询返回空数组', () => {
    expect(queryVariants('   ')).toEqual([])
  })
})
