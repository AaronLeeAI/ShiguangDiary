/**
 * Agent 模块统一出口
 * 上层（页面 / store）只从这里 import
 */
export { runAgent } from './core'
export {
  compactHistory,
  estimateMessageTokens,
  estimateTextTokens,
  serializeToolResult,
} from './context'
export { llmConfig, configureLLM, getLLMConfig } from './config'
export { toolDefinitions, createToolExecutor } from './tools/definitions'
export {
  describeToolAction,
  getToolPolicy,
  isConcurrencySafeTool,
  toolNeedsConfirmation,
} from './tools/policy'
export { AGENT_SESSION_KEY, clearAgentSession, loadAgentSession, saveAgentSession } from './session'
export type { DiaryRepositoryAdapter, DiaryRecord, TTSAdapter } from './tools/context'
export type {
  LocalRagStatus,
  RagProgress,
  SemanticRagAdapter,
  SemanticSearchHit,
  SemanticSearchOptions,
  SemanticSearchResponse,
} from './rag/types'
export { toExcerpt, toMillis } from './tools/context'
export { repoAdapter } from './adapter'
export { memoryAdapter, normalizeMemoryCategory } from './memory'
export type { AgentMemory, MemoryCategory, MemoryRepositoryAdapter } from './memory'
export { analyzeMood, autoTag, weeklyReport } from './features/insights'
export { narrateWeeklyReport, narrateDiary } from './features/narration'
// 凭据安全存储
export {
  getLLMApiKey,
  loadLLMCredentials,
  saveLLMCredentials,
  clearLLMCredentials,
} from './agentSecrets'
export type { LLMCredentials } from './agentSecrets'
// TTS 语音能力
export { synthesize, configureTTS } from './tts/client'
export { createTTSAdapter, createNetworkTTSAdapter } from './tts/adapter'
export type { FileWriter, Player } from './tts/adapter'
export { VOICES, DEFAULT_VOICE } from './tts/types'
export type { TTSConfig, TTSRequest, TTSVoice } from './tts/types'
export type {
  AgentEvent,
  ChatMessage,
  AgentRunOptions,
  DiaryExcerpt,
  DiarySource,
  ToolApprovalRequest,
} from './types'
