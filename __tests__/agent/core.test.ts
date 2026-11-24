import { runAgent } from '../../src/agent/core'
import { complete, streamComplete } from '../../src/agent/llm/client'
import type { DiaryRepositoryAdapter } from '../../src/agent/tools/context'
import type { AgentEvent } from '../../src/agent/types'
import type { MemoryRepositoryAdapter } from '../../src/agent/memory'

jest.mock('../../src/agent/llm/client', () => ({
  complete: jest.fn(),
  streamComplete: jest.fn(),
}))

const mockedComplete = complete as jest.Mock
const mockedStreamComplete = streamComplete as jest.Mock

function createRepo(): DiaryRepositoryAdapter {
  return {
    list: jest.fn(async () => []),
    findById: jest.fn(async () => null),
    create: jest.fn(async () => 'new-id'),
    update: jest.fn(async () => undefined),
    remove: jest.fn(async () => undefined),
  }
}

describe('Agent core orchestration', () => {
  beforeEach(() => {
    mockedComplete.mockReset()
    mockedStreamComplete.mockReset()
  })

  it('没有用户确认时拒绝日记写操作', async () => {
    const repo = createRepo()
    const events: AgentEvent[] = []
    mockedComplete
      .mockResolvedValueOnce({
        message: {
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              id: 'write-1',
              type: 'function',
              function: {
                name: 'create_diary',
                arguments: JSON.stringify({ title: '测试', content: '内容' }),
              },
            },
          ],
        },
        finishReason: 'tool_calls',
      })
      .mockResolvedValueOnce({
        message: { role: 'assistant', content: '已取消写入。' },
        finishReason: 'stop',
      })

    await runAgent('帮我写一篇日记', { repo, history: [] }, event => events.push(event))

    expect(repo.create).not.toHaveBeenCalled()
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'approval_required', name: 'create_diary' }),
    )
    expect(events).toContainEqual({
      type: 'approval_result',
      name: 'create_diary',
      approved: false,
    })
  })

  it('并行执行同一轮的多个只读工具', async () => {
    let active = 0
    let maxActive = 0
    const repo = createRepo()
    repo.list = jest.fn(
      () =>
        new Promise(resolve => {
          active += 1
          maxActive = Math.max(maxActive, active)
          setTimeout(() => {
            active -= 1
            resolve([])
          }, 10)
        }),
    )
    mockedComplete
      .mockResolvedValueOnce({
        message: {
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              id: 'read-1',
              type: 'function',
              function: { name: 'search_diaries', arguments: '{}' },
            },
            {
              id: 'read-2',
              type: 'function',
              function: { name: 'mood_statistics', arguments: '{}' },
            },
          ],
        },
        finishReason: 'tool_calls',
      })
      .mockResolvedValueOnce({
        message: { role: 'assistant', content: '整理完成。' },
        finishReason: 'stop',
      })

    await runAgent('回顾并统计', { repo, history: [] }, () => undefined)

    expect(repo.list).toHaveBeenCalledTimes(2)
    expect(maxActive).toBe(2)
  })

  it('把确认过的长期记忆放进系统提示词', async () => {
    const memory: MemoryRepositoryAdapter = {
      list: jest.fn(async () => [
        {
          id: 'memory-1',
          content: '小王是我的大学同学',
          category: 'person' as const,
          createdAt: 1,
          updatedAt: 1,
        },
      ]),
      create: jest.fn(async () => 'memory-2'),
      update: jest.fn(async () => undefined),
      remove: jest.fn(async () => undefined),
    }
    mockedComplete.mockResolvedValueOnce({
      message: { role: 'assistant', content: '我记得。' },
      finishReason: 'stop',
    })

    await runAgent('你记得小王吗？', { repo: createRepo(), history: [], memory }, () => undefined)

    const request = mockedComplete.mock.calls[0][1]
    expect(request.messages[0].content).toContain('小王是我的大学同学')
  })

  it('把检索到的原始日记作为结构化来源事件交给界面', async () => {
    const repo = createRepo()
    repo.list = jest.fn(async () => [
      {
        id: 'diary-1',
        title: '午后咖啡',
        content: '很安静，适合发呆。',
        createdAt: 1700000000000,
      },
    ])
    const events: AgentEvent[] = []
    mockedComplete
      .mockResolvedValueOnce({
        message: {
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              id: 'search-1',
              type: 'function',
              function: {
                name: 'search_diaries',
                arguments: JSON.stringify({ keyword: '安静' }),
              },
            },
          ],
        },
        finishReason: 'tool_calls',
      })
      .mockResolvedValueOnce({
        message: { role: 'assistant', content: '找到了午后咖啡。' },
        finishReason: 'stop',
      })

    await runAgent('哪里适合发呆？', { repo, history: [] }, event => events.push(event))

    expect(events).toContainEqual(
      expect.objectContaining({
        type: 'tool_end',
        name: 'search_diaries',
        sources: [expect.objectContaining({ id: 'diary-1', title: '午后咖啡' })],
      }),
    )
  })
})
