import { mmkvStorage } from '@storage/mmkvStorage'
import type { ChatMessage } from './types'

export const AGENT_SESSION_KEY = 'agent.chat.session.v1'
const SESSION_VERSION = 1
const MAX_STORED_MESSAGES = 40
const MAX_MESSAGE_CHARS = 12000
const MAX_STORED_SOURCES = 6

interface StoredSession {
  version: number
  updatedAt: number
  messages: ChatMessage[]
}

function sanitizeMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .filter(
      message =>
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string' &&
        message.content.trim().length > 0,
    )
    .slice(-MAX_STORED_MESSAGES)
    .map(message => {
      const sources = (message.sources ?? [])
        .filter(source => source?.id && source?.title && source?.createdAt)
        .slice(0, MAX_STORED_SOURCES)
        .map(source => ({
          id: String(source.id),
          title: String(source.title).slice(0, 160),
          createdAt: String(source.createdAt),
          ...(source.excerpt ? { excerpt: String(source.excerpt).slice(0, 360) } : {}),
          ...(source.mood == null ? {} : { mood: String(source.mood).slice(0, 40) }),
          ...(typeof source.score === 'number' ? { score: source.score } : {}),
        }))
      return {
        role: message.role,
        content:
          message.content!.length > MAX_MESSAGE_CHARS
            ? `${message.content!.slice(0, MAX_MESSAGE_CHARS)}…`
            : message.content,
        ...(message.role === 'assistant' && sources.length > 0 ? { sources } : {}),
      }
    })
}

/** 读取仅保存在本机的最近对话；损坏数据会自动视为空会话。 */
export async function loadAgentSession(key = AGENT_SESSION_KEY): Promise<ChatMessage[]> {
  const raw = await Promise.resolve(mmkvStorage.getItem(key))
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredSession>
    if (parsed.version !== SESSION_VERSION || !Array.isArray(parsed.messages)) {
      return []
    }
    return sanitizeMessages(parsed.messages)
  } catch {
    return []
  }
}

export async function saveAgentSession(
  messages: ChatMessage[],
  key = AGENT_SESSION_KEY,
): Promise<void> {
  const payload: StoredSession = {
    version: SESSION_VERSION,
    updatedAt: Date.now(),
    messages: sanitizeMessages(messages),
  }
  await Promise.resolve(mmkvStorage.setItem(key, JSON.stringify(payload)))
}

export async function clearAgentSession(key = AGENT_SESSION_KEY): Promise<void> {
  await Promise.resolve(mmkvStorage.removeItem(key))
}
