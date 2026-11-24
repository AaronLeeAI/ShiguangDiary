/**
 * Agent 初始化（在 App 启动时调用一次）
 *
 * App.tsx 里已有：
 *   import { initAgent } from '@/agent/setup'
 *   initAgent()
 *
 * 凭据优先级：opts 传入 > 系统 Keychain / Keystore > 公共默认配置
 * 首次配置 key（异步）：
 *   import { saveLLMCredentials } from '@/agent/agentSecrets'
 *   await saveLLMCredentials({ apiKey: 'sk-xxx', baseURL: '...', model: 'hy4-flash' })
 */
import { configureLLM } from './config'
import { configureTTS } from './tts/client'
import { LLM_DEFAULTS } from './defaults'
import { loadLLMCredentials } from './agentSecrets'

export interface AgentInitOptions {
  /** OpenAI 兼容 LLM 网关 */
  llmBaseURL?: string
  llmApiKey?: string
  llmModel?: string
  /** 可选：网络 TTS 神经音色服务（不配则用 react-native-tts 系统音色） */
  ttsBaseURL?: string
  ttsApiKey?: string
}

export async function initAgent(opts: AgentInitOptions = {}): Promise<void> {
  const stored = await loadLLMCredentials()
  const base = opts.llmBaseURL ?? stored?.baseURL ?? LLM_DEFAULTS.baseURL
  const apiKey = opts.llmApiKey ?? stored?.apiKey ?? ''
  const model = opts.llmModel ?? stored?.model ?? LLM_DEFAULTS.model

  configureLLM({ baseURL: base, apiKey, model })

  if (opts.ttsBaseURL) {
    configureTTS({
      baseURL: opts.ttsBaseURL,
      ...(opts.ttsApiKey ? { apiKey: opts.ttsApiKey } : {}),
    })
  }
  // 未配置网络 TTS 时，createTTSAdapter() 默认走 react-native-tts（离线可用）
}
