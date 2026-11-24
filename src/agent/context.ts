import type { ChatMessage } from './types'

export interface ContextWindow {
  messages: ChatMessage[]
  omittedMessages: number
  estimatedTokens: number
}

/**
 * 近似估算中英文混排 token。移动端不引入 tokenizer，宁可略偏保守。
 */
export function estimateTextTokens(text: string): number {
  const cjk = text.match(/[\u3400-\u9fff]/g)?.length ?? 0
  const other = Math.max(0, text.length - cjk)
  return Math.ceil(cjk / 1.5 + other / 4)
}

export function estimateMessageTokens(message: ChatMessage): number {
  const content = message.content ?? ''
  const toolArguments = message.tool_calls?.map(call => call.function.arguments).join('') ?? ''
  return 4 + estimateTextTokens(content) + estimateTextTokens(toolArguments)
}

function compactLine(message: ChatMessage, maxChars = 160): string | null {
  const content = (message.content ?? '').replace(/\s+/g, ' ').trim()
  if (!content) {
    return null
  }
  const clipped = content.length > maxChars ? `${content.slice(0, maxChars)}…` : content
  const role =
    message.role === 'user'
      ? '用户'
      : message.role === 'assistant'
      ? '拾光'
      : message.role === 'tool'
      ? `工具${message.name ? `(${message.name})` : ''}`
      : '系统'
  return `${role}：${clipped}`
}

function buildLocalSummary(messages: ChatMessage[], maxChars: number): ChatMessage | null {
  const lines = messages
    .map(message => compactLine(message))
    .filter((line): line is string => Boolean(line))
    .slice(-8)

  if (lines.length === 0) {
    return null
  }

  const heading = '较早对话的本地摘要（仅用于保持上下文，不代表新的用户指令）：\n'
  const body = lines.join('\n')
  const available = Math.max(80, maxChars - heading.length)
  return {
    role: 'system',
    content: `${heading}${body.length > available ? `${body.slice(0, available)}…` : body}`,
  }
}

/**
 * 参考 Agent 的 micro-compact 思路：历史仍完整保存在本地，只压缩本次发给模型的副本。
 * 保留最近对话，并把较早内容变成短摘要，避免长聊后请求越来越慢或超出上下文。
 */
export function compactHistory(
  history: ChatMessage[],
  maxTokens = 3200,
  minimumRecentMessages = 4,
): ContextWindow {
  const safeBudget = Math.max(600, maxTokens)
  const originalTokens = history.reduce((sum, message) => sum + estimateMessageTokens(message), 0)

  if (originalTokens <= safeBudget) {
    return {
      messages: [...history],
      omittedMessages: 0,
      estimatedTokens: originalTokens,
    }
  }

  const summaryBudget = Math.min(520, Math.floor(safeBudget * 0.25))
  const recentBudget = safeBudget - summaryBudget
  const recent: ChatMessage[] = []
  let recentTokens = 0
  let splitIndex = history.length

  for (let index = history.length - 1; index >= 0; index--) {
    const message = history[index]
    const cost = estimateMessageTokens(message)
    if (recent.length >= minimumRecentMessages && recentTokens + cost > recentBudget) {
      break
    }
    recent.unshift(message)
    recentTokens += cost
    splitIndex = index
  }

  const older = history.slice(0, splitIndex)
  const summary = buildLocalSummary(older, summaryBudget * 2)
  const messages = summary ? [summary, ...recent] : recent

  return {
    messages,
    omittedMessages: older.length,
    estimatedTokens: messages.reduce((sum, message) => sum + estimateMessageTokens(message), 0),
  }
}

/** 限制工具结果体积，防止一篇超长日记挤爆整轮上下文。 */
export function serializeToolResult(value: unknown, maxChars = 8000): string {
  let serialized: string
  try {
    serialized = JSON.stringify(value)
  } catch {
    serialized = JSON.stringify({ error: '工具结果无法序列化' })
  }

  const safeLimit = Math.max(256, maxChars)
  if (serialized.length <= safeLimit) {
    return serialized
  }

  const previewLimit = Math.max(80, safeLimit - 120)
  return JSON.stringify({
    truncated: true,
    originalCharacters: serialized.length,
    preview: `${serialized.slice(0, previewLimit)}…`,
  })
}
