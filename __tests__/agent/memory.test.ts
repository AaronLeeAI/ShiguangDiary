import { normalizeMemoryCategory } from '../../src/agent/memory'
import { buildSystemPrompt } from '../../src/agent/prompts'

describe('Agent long-term memory', () => {
  it('只接受受支持的记忆分类', () => {
    expect(normalizeMemoryCategory('goal')).toBe('goal')
    expect(normalizeMemoryCategory('unknown')).toBe('context')
  })

  it('把用户确认过的记忆注入系统上下文', () => {
    const prompt = buildSystemPrompt([
      {
        id: 'memory-1',
        content: '今年希望坚持每周跑步三次',
        category: 'goal',
        createdAt: 1,
        updatedAt: 1,
      },
    ])

    expect(prompt).toContain('用户已确认的长期记忆')
    expect(prompt).toContain('[长期目标|id=memory-1] 今年希望坚持每周跑步三次')
    expect(prompt).toContain('禁止从单篇日记推断人格')
  })
})
