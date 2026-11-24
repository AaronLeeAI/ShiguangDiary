import { compactHistory, estimateTextTokens, serializeToolResult } from '../../src/agent/context'
import type { ChatMessage } from '../../src/agent/types'

describe('Agent context management', () => {
  it('在预算内保留原始历史', () => {
    const history: ChatMessage[] = [
      { role: 'user', content: '你好' },
      { role: 'assistant', content: '你好，我是拾光。' },
    ]

    const result = compactHistory(history, 1000)

    expect(result.omittedMessages).toBe(0)
    expect(result.messages).toEqual(history)
  })

  it('压缩较早消息但保留最近对话', () => {
    const history: ChatMessage[] = Array.from({ length: 20 }, (_, index) => ({
      role: index % 2 === 0 ? 'user' : 'assistant',
      content: `第 ${index} 条消息：${'很长的日记上下文'.repeat(30)}`,
    }))

    const result = compactHistory(history, 600, 4)

    expect(result.omittedMessages).toBeGreaterThan(0)
    expect(result.messages[0]).toMatchObject({ role: 'system' })
    expect(result.messages.at(-1)?.content).toBe(history.at(-1)?.content)
    expect(result.estimatedTokens).toBeLessThan(
      history.reduce((sum, message) => sum + estimateTextTokens(message.content ?? ''), 0),
    )
  })

  it('截断过大的工具结果并保留可读预览', () => {
    const serialized = serializeToolResult({ content: '日记'.repeat(5000) }, 500)
    const parsed = JSON.parse(serialized)

    expect(parsed.truncated).toBe(true)
    expect(parsed.originalCharacters).toBeGreaterThan(500)
    expect(parsed.preview).toContain('日记')
  })
})
