/**
 * Agent 模块通用类型定义
 * 与拾光日记现有数据模型对齐（见 src/database/models 的 DiaryModel）
 */

/** 对话消息角色 */
export type Role = 'system' | 'user' | 'assistant' | 'tool'

/** 一条 LLM 消息 */
export interface ChatMessage {
  role: Role
  content: string | null
  /** assistant 发起工具调用时携带 */
  tool_calls?: ToolCall[]
  /** role=tool 时，标记对应的工具调用 id */
  tool_call_id?: string
  name?: string
  /** 仅用于本地会话恢复；发送模型前会剥离。 */
  sources?: DiarySource[]
}

/** 模型发起的一次工具调用 */
export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    /** JSON 字符串形式的参数 */
    arguments: string
  }
}

/** 工具定义（传给 LLM 的 function schema） */
export interface ToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    /** JSON Schema */
    parameters: {
      type: 'object'
      properties: Record<string, unknown>
      required?: string[]
    }
  }
}

/** 工具执行结果 */
export interface ToolResult {
  tool_call_id: string
  name: string
  /** 序列化后回传给 LLM 的结果 */
  content: string
  ok: boolean
}

/** 助手回答所依据的原始日记，用于在界面上展示可点击引用。 */
export interface DiarySource {
  id: string
  title: string
  createdAt: string
  excerpt?: string
  mood?: string | null
  score?: number
}

/** 写操作执行前展示给用户的确认信息 */
export interface ToolApprovalRequest {
  name: string
  args: Record<string, unknown>
  description: string
}

/** Agent 单步事件，用于驱动 UI（流式 + 过程可见） */
export type AgentEvent =
  | { type: 'token'; text: string }
  | { type: 'tool_start'; name: string; args: Record<string, unknown> }
  | { type: 'tool_end'; name: string; ok: boolean; preview: string; sources?: DiarySource[] }
  | { type: 'approval_required'; name: string; description: string }
  | { type: 'approval_result'; name: string; approved: boolean }
  | { type: 'context_compacted'; omittedMessages: number }
  | {
      type: 'rag_progress'
      phase: 'download' | 'load' | 'index'
      completed: number
      total: number
      percent: number
      message: string
    }
  | { type: 'thinking' }
  | { type: 'done'; answer: string; steps: number }
  | { type: 'error'; message: string }

/** 日记精简视图（喂给 LLM，避免把整库原文塞进上下文） */
export interface DiaryExcerpt {
  id: string
  title: string
  /** 正文截断 */
  content: string
  mood?: string | null
  weather?: string | null
  location?: string | null
  createdAt: string
  tags?: string[]
}

/** LLM 配置 */
export interface LLMConfig {
  baseURL: string
  apiKey: string
  model: string
  temperature?: number
  maxTokens?: number
}

/** Agent 运行配置 */
export interface AgentRunOptions {
  /** 最多工具调用轮次，防止死循环 */
  maxToolRounds?: number
  /** 单次上下文最多携带的日记摘要条数 */
  maxContextDiaries?: number
  /** 历史对话在单次请求中占用的近似 token 上限 */
  maxHistoryTokens?: number
  /** 单个工具结果回灌给模型前的最大字符数 */
  maxToolResultChars?: number
  /** 新建/修改日记等写操作执行前必须由 UI 明确确认 */
  confirmTool?: (request: ToolApprovalRequest) => Promise<boolean>
  signal?: AbortSignal
}
