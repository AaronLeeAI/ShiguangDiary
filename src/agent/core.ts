/**
 * Agent 核心循环（Tool-Calling / ReAct 编排）
 *
 * 流程：用户问题 → LLM 决定是否调工具 → 执行工具 → 把结果喂回 LLM → 循环 → 最终回答
 * 过程通过 onEvent 流式暴露给 UI（token / 工具调用 / 结束 / 错误）。
 */
import { llmConfig } from './config'
import { compactHistory, serializeToolResult } from './context'
import {
  detectInstructionOverride,
  verifyAnswerGrounding,
  wrapUntrustedEvidence,
} from './guardrails'
import { complete, streamComplete } from './llm/client'
import { toolDefinitions, createToolExecutor } from './tools/definitions'
import type { DiaryRepositoryAdapter, TTSAdapter } from './tools/context'
import type { SemanticRagAdapter } from './rag/types'
import type { MemoryRepositoryAdapter } from './memory'
import { describeToolAction, isConcurrencySafeTool, toolNeedsConfirmation } from './tools/policy'
import { buildSystemPrompt } from './prompts'
import type {
  AgentEvent,
  AgentRunOptions,
  ChatMessage,
  DiarySource,
  ToolCall,
  ToolResult,
} from './types'

export interface AgentDeps {
  repo: DiaryRepositoryAdapter
  /** 对话历史（不含 system），由上层 store 管理 */
  history: ChatMessage[]
  /** 可选：语音输出能力，注入后 Agent 可用 read_aloud 工具 */
  tts?: TTSAdapter
  /** 可选：设备端语义向量检索。 */
  rag?: SemanticRagAdapter
  /** 可选：用户明确确认过的长期记忆。 */
  memory?: MemoryRepositoryAdapter
}

function toSource(value: unknown): DiarySource | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const item = value as Record<string, unknown>
  if (!item.id || !item.title || !item.createdAt) {
    return null
  }
  const rawCreatedAt = item.createdAt
  const numericCreatedAt = Number(rawCreatedAt)
  const date =
    Number.isFinite(numericCreatedAt) && String(rawCreatedAt).trim() !== ''
      ? new Date(numericCreatedAt < 1e12 ? numericCreatedAt * 1000 : numericCreatedAt)
      : new Date(String(rawCreatedAt))
  return {
    id: String(item.id),
    title: String(item.title),
    createdAt: Number.isNaN(date.getTime()) ? String(rawCreatedAt) : date.toISOString(),
    ...(item.content ? { excerpt: String(item.content).slice(0, 180) } : {}),
    ...(item.mood == null ? {} : { mood: String(item.mood) }),
    ...(typeof item.score === 'number' ? { score: item.score } : {}),
  }
}

/** 返回日记原文的工具：结果需要按"不可信证据"处理，并做注入探测。 */
const EVIDENCE_TOOLS = new Set(['search_diaries', 'semantic_search_diaries', 'get_diary'])

function extractDiarySources(toolName: string, data: unknown): DiarySource[] | undefined {
  if (
    toolName !== 'search_diaries' &&
    toolName !== 'semantic_search_diaries' &&
    toolName !== 'get_diary'
  ) {
    return undefined
  }
  if (!data || typeof data !== 'object') {
    return undefined
  }
  const value = data as Record<string, unknown>
  const raw = Array.isArray(value.diaries) ? value.diaries : [value]
  const sources = raw.map(toSource).filter((item): item is DiarySource => Boolean(item))
  return sources.length > 0 ? sources : undefined
}

/**
 * 运行一次 Agent 对话。
 * @param question 本轮用户输入
 * @param deps 数据依赖 + 历史
 * @param onEvent 事件回调（驱动 UI）
 */
export async function runAgent(
  question: string,
  deps: AgentDeps,
  onEvent: (e: AgentEvent) => void,
  options: AgentRunOptions = {},
): Promise<string> {
  const maxRounds = options.maxToolRounds ?? 5
  const execute = createToolExecutor(deps.repo, deps.tts, {
    maxDiaryResults: options.maxContextDiaries,
    rag: deps.rag,
    memory: deps.memory,
    onRagProgress: progress => onEvent({ type: 'rag_progress', ...progress }),
  })
  const context = compactHistory(deps.history, options.maxHistoryTokens)
  const memories = deps.memory ? await deps.memory.list().catch(() => []) : []
  const modelHistory = context.messages.map(message => {
    if (!message.sources) {
      return message
    }
    const copy = { ...message }
    delete copy.sources
    return copy
  })
  const messages: ChatMessage[] = [
    { role: 'system', content: buildSystemPrompt(memories) },
    ...modelHistory,
    { role: 'user', content: question },
  ]

  if (context.omittedMessages > 0) {
    onEvent({ type: 'context_compacted', omittedMessages: context.omittedMessages })
  }

  type PreparedCall = {
    call: ToolCall
    args: Record<string, unknown>
  }

  /** 本轮实际召回过的来源，用于回答生成后的接地校验。 */
  const collectedSources: DiarySource[] = []

  const executeOne = async ({ call, args }: PreparedCall): Promise<ToolResult> => {
    const name = call.function.name

    if (toolNeedsConfirmation(name)) {
      const description = describeToolAction(name, args)
      onEvent({ type: 'approval_required', name, description })
      const approved = options.confirmTool
        ? await options.confirmTool({ name, args, description })
        : false
      onEvent({ type: 'approval_result', name, approved })
      if (!approved) {
        const content = JSON.stringify({ denied: true, reason: '用户未确认此写操作' })
        onEvent({ type: 'tool_end', name, ok: false, preview: '用户已取消' })
        return { tool_call_id: call.id, name, content, ok: false }
      }
    }

    onEvent({ type: 'tool_start', name, args })
    try {
      const data = await execute(name, args)
      const serialized = serializeToolResult(data, options.maxToolResultChars)
      const sources = extractDiarySources(name, data)

      // 日记正文属于"用户数据"，可能被粘贴进看起来像指令的文字。
      // 包上边界标记 + 探测命中情况，避免模型把内容当指令执行。
      let content = serialized
      if (EVIDENCE_TOOLS.has(name)) {
        const signal = detectInstructionOverride(serialized)
        if (signal.suspected) {
          onEvent({ type: 'prompt_injection_suspected', tool: name, matches: signal.matches })
        }
        content = wrapUntrustedEvidence(serialized, `${name} 结果`)
      }
      if (sources) {
        collectedSources.push(...sources)
      }

      onEvent({
        type: 'tool_end',
        name,
        ok: true,
        preview: serialized.slice(0, 80),
        sources,
      })
      return { tool_call_id: call.id, name, content, ok: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      onEvent({ type: 'tool_end', name, ok: false, preview: message })
      return {
        tool_call_id: call.id,
        name,
        content: JSON.stringify({ error: message }),
        ok: false,
      }
    }
  }

  try {
    let round = 0
    while (round < maxRounds) {
      round++
      onEvent({ type: 'thinking' })

      // 最后一轮禁止再调工具，强制产出文本答案
      const forceText = round >= maxRounds
      const tools = forceText ? undefined : toolDefinitions

      // 中间轮用非流式（要完整 tool_calls）；最终轮用流式输出体验更好
      const isFinalLikely = forceText
      let assistantMsg: ChatMessage
      let finishReason: string

      if (isFinalLikely) {
        const res = await streamComplete(
          llmConfig,
          { messages, tools, signal: options.signal },
          token => onEvent({ type: 'token', text: token }),
        )
        assistantMsg = res.message
        finishReason = res.finishReason
      } else {
        const res = await complete(llmConfig, { messages, tools, signal: options.signal })
        assistantMsg = res.message
        finishReason = res.finishReason
      }

      messages.push(assistantMsg)
      const calls = assistantMsg.tool_calls ?? []

      // 没有工具调用 → 本轮即为最终答案
      if (finishReason !== 'tool_calls' || calls.length === 0) {
        const answer = assistantMsg.content ?? ''
        // 生成侧接地校验：答案里写了检索结果里不存在的完整日期时提醒用户核对。
        const grounding = verifyAnswerGrounding(answer, collectedSources)
        if (grounding.checked && grounding.unsupportedDates.length > 0) {
          onEvent({
            type: 'grounding_report',
            unsupportedDates: grounding.unsupportedDates,
            citedTitles: grounding.citedTitles,
          })
        }
        onEvent({ type: 'done', answer, steps: round })
        return answer
      }

      // 先解析全部调用；只读工具可并行，写工具始终串行并等待用户确认。
      const prepared: PreparedCall[] = calls.map(call => {
        let args: Record<string, unknown>
        try {
          args = JSON.parse(call.function.arguments || '{}')
        } catch {
          args = {}
        }
        return { call, args }
      })

      const batches: Array<{ concurrent: boolean; calls: PreparedCall[] }> = []
      for (const item of prepared) {
        const concurrent = isConcurrencySafeTool(item.call.function.name)
        const previous = batches[batches.length - 1]
        if (concurrent && previous?.concurrent) {
          previous.calls.push(item)
        } else {
          batches.push({ concurrent, calls: [item] })
        }
      }

      const results: ToolResult[] = []
      for (const batch of batches) {
        if (batch.concurrent) {
          results.push(...(await Promise.all(batch.calls.map(executeOne))))
        } else {
          for (const item of batch.calls) {
            results.push(await executeOne(item))
          }
        }
      }

      for (const r of results) {
        messages.push({
          role: 'tool',
          tool_call_id: r.tool_call_id,
          name: r.name,
          content: r.content,
        })
      }
    }

    // 兜底（正常不会走到）
    const fallback = '抱歉，我没能完成这个请求，请再试一次。'
    onEvent({ type: 'done', answer: fallback, steps: round })
    return fallback
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    onEvent({ type: 'error', message })
    throw err
  }
}
