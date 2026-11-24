import { keywordSearchDiaries } from '../../src/agent/tools/keywordSearch'
import type { DiaryRecord } from '../../src/agent/tools/context'

const BASE = Date.UTC(2026, 2, 1)
const DAY = 86400000

const diary = (
  id: string,
  title: string,
  content: string,
  mood: string,
  dayOffset: number,
): DiaryRecord => ({
  id,
  title,
  content,
  mood,
  createdAt: BASE + dayOffset * DAY,
  updatedAt: BASE + dayOffset * DAY,
})

const diaries: DiaryRecord[] = [
  diary('cafe', '午后咖啡', '在一家很安静的咖啡店发呆，什么也没做。', '平静', 0),
  diary('hotpot', '和老王吃火锅', '和老王约了火锅，聊到店里打烊。', '开心', 3),
  diary('work', '赶项目', '连夜赶项目，咖啡喝了两杯，还是困。', '疲惫', 6),
  diary('cat', '楼下的猫', '楼下有只橘猫，每天蹲在便利店门口。', '平静', 9),
]

describe('关键词检索（BM25）', () => {
  it('中文不需要空格，也能用部分词命中', () => {
    const result = keywordSearchDiaries(diaries, { keyword: '咖啡', limit: 5 })

    expect(result.mode).toBe('ranked')
    expect(result.diaries.map(item => item.id)).toContain('cafe')
    expect(result.diaries.map(item => item.id)).toContain('work')
  })

  it('多词查询按相关性排序，而不是按时间倒序', () => {
    const result = keywordSearchDiaries(diaries, { keyword: '火锅 老王', limit: 5 })

    expect(result.diaries[0]?.id).toBe('hotpot')
    expect(result.matched).toBe(1)
  })

  it('标题命中的权重高于正文顺带提到', () => {
    // "咖啡" 在 cafe 标题里，在 work 正文里
    const result = keywordSearchDiaries(diaries, { keyword: '咖啡', limit: 5 })
    const cafeIndex = result.diaries.findIndex(item => item.id === 'cafe')
    const workIndex = result.diaries.findIndex(item => item.id === 'work')

    expect(cafeIndex).toBeGreaterThanOrEqual(0)
    expect(cafeIndex).toBeLessThan(workIndex)
  })

  it('没有关键词时按时间倒序返回最近日记', () => {
    const result = keywordSearchDiaries(diaries, { limit: 2 })

    expect(result.mode).toBe('recent')
    expect(result.diaries.map(item => item.id)).toEqual(['cat', 'work'])
  })

  it('单字查询退回子串匹配，保持旧行为', () => {
    const result = keywordSearchDiaries(diaries, { keyword: '猫', limit: 5 })

    expect(result.diaries.map(item => item.id)).toEqual(['cat'])
  })

  it('情绪与时间筛选在排序前生效', () => {
    const calm = keywordSearchDiaries(diaries, { keyword: '咖啡', mood: '平静', limit: 5 })
    expect(calm.diaries.map(item => item.id)).toEqual(['cafe'])

    const recentOnly = keywordSearchDiaries(diaries, {
      keyword: '咖啡',
      startDate: '2026-03-05',
      limit: 5,
    })
    expect(recentOnly.diaries.map(item => item.id)).toEqual(['work'])
  })

  it('完全没命中时返回空列表而不是全部日记', () => {
    const result = keywordSearchDiaries(diaries, { keyword: '量子力学', limit: 5 })

    expect(result.diaries).toEqual([])
    expect(result.matched).toBe(0)
  })

  it('limit 生效且结果不重复', () => {
    const result = keywordSearchDiaries(diaries, { keyword: '咖啡', limit: 1 })
    expect(result.diaries).toHaveLength(1)
    expect(new Set(result.diaries.map(item => item.id)).size).toBe(result.diaries.length)
  })
})
