import type { DiaryModel } from '../../src/database/models'
import { repoAdapter } from '../../src/agent/adapter'

const mockList = jest.fn()
const mockFindById = jest.fn()

jest.mock('../../src/database/repository', () => ({
  diaryRepository: {
    list: () => mockList(),
    findById: (id: string) => mockFindById(id),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}))

const diary = (overrides: Partial<DiaryModel> = {}): DiaryModel => ({
  id: 'diary-1',
  notebookId: null,
  title: '普通日记',
  content: '正文',
  cover: null,
  weather: null,
  location: null,
  mood: null,
  isPinned: 0,
  isEncrypted: 0,
  isDraft: 0,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  deletedAt: null,
  ...overrides,
})

describe('Agent diary adapter privacy boundary', () => {
  beforeEach(() => {
    mockList.mockReset()
    mockFindById.mockReset()
  })

  it('不会把加密或已删除日记放进 Agent 上下文', async () => {
    mockList.mockResolvedValue([
      diary(),
      diary({ id: 'secret', isEncrypted: 1 }),
      diary({ id: 'deleted', deletedAt: 1700000001000 }),
    ])

    await expect(repoAdapter.list()).resolves.toEqual([
      expect.objectContaining({ id: 'diary-1', title: '普通日记' }),
    ])
  })

  it('直接按 id 读取时也拒绝返回加密日记', async () => {
    mockFindById.mockResolvedValue(diary({ id: 'secret', isEncrypted: 1 }))

    await expect(repoAdapter.findById('secret')).resolves.toBeNull()
  })

  it('把早期数据中的 Unix 秒时间戳统一成毫秒', async () => {
    mockList.mockResolvedValue([diary({ createdAt: 1794369748, updatedAt: 1794369748 })])

    await expect(repoAdapter.list()).resolves.toEqual([
      expect.objectContaining({
        createdAt: 1794369748000,
        updatedAt: 1794369748000,
      }),
    ])
  })
})
