/**
 * LLM 客户端
 * - 兼容 OpenAI Chat Completions 协议（可对接 OpenAI / 兼容网关 / 自建服务）
 * - 支持 SSE 流式输出与 function calling
 * - 用项目已有的 axios，不引入新网络库
 */
import axios from 'axios'
import type { ChatMessage, ToolDefinition, LLMConfig } from '../types'

export interface CompletionRequest {
  messages: ChatMessage[]
  tools?: ToolDefinition[]
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } }
  signal?: AbortSignal
}

export interface CompletionResponse {
  message: ChatMessage
  finishReason: string
  usage?: { prompt_tokens: number; completion_tokens: number }
}

/** 单次（非流式）请求：用于需要拿完整 tool_calls 的轮次 */
export async function complete(
  config: LLMConfig,
  req: CompletionRequest,
): Promise<CompletionResponse> {
  const { data } = await axios.post(
    `${config.baseURL}/chat/completions`,
    {
      model: config.model,
      messages: req.messages,
      temperature: config.temperature ?? 0.4,
      max_tokens: config.maxTokens ?? 1024,
      ...(req.tools?.length ? { tools: req.tools, tool_choice: req.toolChoice ?? 'auto' } : {}),
    },
    {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: req.signal,
      timeout: 60000,
    },
  )
  const choice = data.choices?.[0]
  return {
    message: choice.message as ChatMessage,
    finishReason: choice.finish_reason,
    usage: data.usage,
  }
}

/**
 * 流式请求：逐 token 回调。
 * 在 React Native 中需设置 axios responseType='stream' 不适合，这里用 fetch + ReadableStream
 * 解析 SSE，兼容 RN 的 fetch（0.72+ 支持流式读取）。
 */
export async function streamComplete(
  config: LLMConfig,
  req: CompletionRequest,
  onToken: (text: string) => void,
): Promise<CompletionResponse> {
  const res = await fetch(`${config.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: req.signal,
    body: JSON.stringify({
      model: config.model,
      messages: req.messages,
      temperature: config.temperature ?? 0.4,
      max_tokens: config.maxTokens ?? 1024,
      stream: true,
      ...(req.tools?.length ? { tools: req.tools, tool_choice: req.toolChoice ?? 'auto' } : {}),
    }),
  })

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '')
    throw new Error(`LLM 请求失败 ${res.status}: ${detail.slice(0, 200)}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let content = ''
  const toolCalls: NonNullable<ChatMessage['tool_calls']> = []
  let finishReason = 'stop'

  for (;;) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    buffer += decoder.decode(value, { stream: true })

    // SSE 以空行分隔事件
    const lines = buffer.split('\n\n')
    buffer = lines.pop() ?? ''
    for (const block of lines) {
      const line = block.split('\n').find(l => l.startsWith('data: '))
      if (!line) {
        continue
      }
      const payload = line.slice(6).trim()
      if (payload === '[DONE]') {
        continue
      }
      try {
        const json = JSON.parse(payload)
        const delta = json.choices?.[0]?.delta ?? {}
        if (delta.content) {
          content += delta.content
          onToken(delta.content)
        }
        // 流式下的工具调用是分片返回的，按 index 累积
        for (const tc of delta.tool_calls ?? []) {
          const i = tc.index ?? 0
          if (!toolCalls[i]) {
            toolCalls[i] = {
              id: tc.id ?? '',
              type: 'function',
              function: { name: '', arguments: '' },
            }
          }
          if (tc.id) {
            toolCalls[i].id = tc.id
          }
          if (tc.function?.name) {
            toolCalls[i].function.name += tc.function.name
          }
          if (tc.function?.arguments) {
            toolCalls[i].function.arguments += tc.function.arguments
          }
        }
        if (json.choices?.[0]?.finish_reason) {
          finishReason = json.choices[0].finish_reason
        }
      } catch {
        // 忽略无法解析的片段
      }
    }
  }

  const message: ChatMessage = {
    role: 'assistant',
    content: content || null,
    ...(toolCalls.length ? { tool_calls: toolCalls.filter(Boolean) } : {}),
  }
  return { message, finishReason }
}
