import { createToolExecutor } from '../../src/agent/tools/definitions'
import type { DiaryRecord, DiaryRepositoryAdapter } from '../../src/agent/tools/context'
import type { MemoryRepositoryAdapter } from '../../src/agent/memory'

const records: DiaryRecord[] = [
  {
    id: '1',
    title: '周末散步',
    content: '今天去了公园。',
    mood: 'happy',
    createdAt: Date.now(),
  },
  {
    id: '2',
    title: '工作记录',
    content: '完成了项目复盘。',
    mood: 'calm',
    createdAt: Date.now() - 86400000,
  },
]

function createRepo(): DiaryRepositoryAdapter {
  return {
    list: jest.fn(async () => records),
    findById: jest.fn(async id => records.find(item => item.id === id) ?? null),
    create: jest.fn(async _diary => 'new-id'),
    update: jest.fn(async (_id, _patch) => undefined),
    remove: jest.fn(async _id => undefined),
  }
}

describe('Agent tools', () => {
  it('按关键词检索并只返回匹配的日记摘要', async () => {
    const execute = createToolExecutor(createRepo())

    await expect(execute('search_diaries', { keyword: '公园' })).resolves.toMatchObject({
      count: 1,
      diaries: [{ id: '1', title: '周末散步' }],
    })
  })

  it('汇总最近的心情统计', async () => {
    const execute = createToolExecutor(createRepo())

    await expect(execute('mood_statistics', { days: 7 })).resolves.toMatchObject({
      total: 2,
      byMood: { happy: 1, calm: 1 },
    })
  })

  it('通过仓库创建日记', async () => {
    const repo = createRepo()
    const execute = createToolExecutor(repo)

    await expect(
      execute('create_diary', { title: '新日记', content: '新的内容' }),
    ).resolves.toEqual({ created: true, id: 'new-id' })
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: '新日记', content: '新的内容' }),
    )
  })

  it('限制一次返回给模型的日记数量', async () => {
    const execute = createToolExecutor(createRepo(), undefined, { maxDiaryResults: 1 })

    await expect(execute('search_diaries', { limit: 100 })).resolves.toMatchObject({
      count: 1,
    })
  })

  it('通过本地 RAG 适配器执行语义检索', async () => {
    const rag = {
      search: jest.fn(async () => ({
        available: true,
        retrieval: 'local_semantic' as const,
        query: '工作压力',
        count: 1,
        diaries: [
          {
            id: '2',
            title: '工作记录',
            content: '完成了项目复盘。',
            createdAt: new Date(records[1].createdAt).toISOString(),
            score: 0.88,
            chunkIndex: 0,
          },
        ],
        indexedDiaries: 2,
        indexedChunks: 2,
      })),
      getStatus: jest.fn(),
      prepare: jest.fn(),
      clearIndex: jest.fn(),
    }
    const execute = createToolExecutor(createRepo(), undefined, { rag })

    await expect(execute('semantic_search_diaries', { query: '工作压力' })).resolves.toMatchObject({
      retrieval: 'local_semantic',
      diaries: [{ id: '2' }],
    })
    expect(rag.search).toHaveBeenCalledWith(
      '工作压力',
      records,
      expect.objectContaining({ limit: 6 }),
      undefined,
    )
  })

  it('只把用户确认后的事实写入长期记忆', async () => {
    const memory: MemoryRepositoryAdapter = {
      list: jest.fn(async () => []),
      create: jest.fn(async () => 'memory-1'),
      update: jest.fn(async () => undefined),
      remove: jest.fn(async () => undefined),
    }
    const execute = createToolExecutor(createRepo(), undefined, { memory })

    await expect(
      execute('remember_user_fact', {
        content: '我希望每周跑步三次',
        category: 'goal',
      }),
    ).resolves.toMatchObject({ saved: true, id: 'memory-1' })
    expect(memory.create).toHaveBeenCalledWith({
      content: '我希望每周跑步三次',
      category: 'goal',
      sourceDiaryId: null,
    })
  })
})
