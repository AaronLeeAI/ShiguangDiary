/**
 * Agent 配置
 * 生产环境请把 apiKey 放到安全存储（MMKV / Keychain），调用 configureLLM 注入，
 * 不要硬编码进包体。RN 无 process.env，因此以运行时注入为准。
 */
import type { LLMConfig } from './types'

declare const __DEV__: boolean | undefined

const defaults: LLMConfig = {
  baseURL: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
  temperature: 0.4,
  maxTokens: 1024,
}

let current: LLMConfig = { ...defaults }

/** 运行时覆盖配置（推荐：App 启动时从 MMKV/Keychain 读取后调用） */
export function configureLLM(patch: Partial<LLMConfig>) {
  current = { ...current, ...patch }
}

/** 供各模块读取的当前配置（ getter 保证 configure 后生效） */
export function getLLMConfig(): LLMConfig {
  return current
}

/** 兼容旧引用：静态快照（在 configureLLM 之前读取会拿到默认值） */
export const llmConfig: LLMConfig = new Proxy(defaults, {
  get: (t, k) => current[k as keyof LLMConfig],
})

/** 调试日志开关（RN 全局 __DEV__，缺省 false） */
export const AGENT_DEBUG = typeof __DEV__ !== 'undefined' ? __DEV__ : false
