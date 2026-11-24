import { clearAgentSession, loadAgentSession, saveAgentSession } from '../../src/agent/session'
import type { ChatMessage } from '../../src/agent/types'

const TEST_KEY = 'agent.chat.session.test'

describe('Agent local session', () => {
  beforeEach(async () => {
    await clearAgentSession(TEST_KEY)
  })

  it('只持久化最近的用户与助手消息', async () => {
    const messages: ChatMessage[] = [
      { role: 'system', content: '系统提示' },
      { role: 'tool', name: 'search_diaries', tool_call_id: '1', content: '{}' },
      ...Array.from({ length: 46 }, (_, index) => ({
        role: index % 2 === 0 ? ('user' as const) : ('assistant' as const),
        content: `消息 ${index}`,
      })),
    ]

    await saveAgentSession(messages, TEST_KEY)
    const restored = await loadAgentSession(TEST_KEY)

    expect(restored).toHaveLength(40)
    expect(restored.every(item => item.role === 'user' || item.role === 'assistant')).toBe(true)
    expect(restored.at(-1)?.content).toBe('消息 45')
  })

  it('可以清空本地会话', async () => {
    await saveAgentSession([{ role: 'user', content: '待清空' }], TEST_KEY)
    await clearAgentSession(TEST_KEY)

    await expect(loadAgentSession(TEST_KEY)).resolves.toEqual([])
  })

  it('恢复助手回答所引用的日记，但不把来源挂到用户消息', async () => {
    const source = {
      id: 'diary-1',
      title: '午后咖啡',
      createdAt: '2026-11-11T08:00:00.000Z',
      excerpt: '靠窗的位置很安静。',
    }
    await saveAgentSession(
      [
        { role: 'user', content: '哪里适合放松？', sources: [source] },
        { role: 'assistant', content: '找到了。', sources: [source] },
      ],
      TEST_KEY,
    )

    await expect(loadAgentSession(TEST_KEY)).resolves.toEqual([
      { role: 'user', content: '哪里适合放松？' },
      { role: 'assistant', content: '找到了。', sources: [source] },
    ])
  })
})
