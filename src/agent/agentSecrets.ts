/** Agent LLM 凭据的系统安全存储。 */
import * as Keychain from 'react-native-keychain'
import { mmkvStorage } from '@storage/mmkvStorage'

const KEYCHAIN_SERVICE = 'com.shiguangdiary.agent.llm'
const KEYCHAIN_ACCOUNT = 'llm-credentials'

// 旧版本曾把凭据放在 MMKV；仅用于一次性迁移，迁移成功后立即删除。
const K_API_KEY = 'agent.llm.apiKey'
const K_BASE_URL = 'agent.llm.baseURL'
const K_MODEL = 'agent.llm.model'

export interface LLMCredentials {
  apiKey: string
  baseURL?: string
  model?: string
}

function readLegacy(name: string): string | null {
  const v = mmkvStorage.getItem(name)
  if (v && typeof (v as Promise<string | null>).then === 'function') {
    return null
  }
  return (v as string | null) ?? null
}

function clearLegacy(): void {
  mmkvStorage.removeItem(K_API_KEY)
  mmkvStorage.removeItem(K_BASE_URL)
  mmkvStorage.removeItem(K_MODEL)
}

function parseCredentials(value: string): LLMCredentials | null {
  try {
    const parsed = JSON.parse(value) as Partial<LLMCredentials>
    if (typeof parsed.apiKey !== 'string' || !parsed.apiKey.trim()) {
      return null
    }
    return {
      apiKey: parsed.apiKey,
      ...(typeof parsed.baseURL === 'string' ? { baseURL: parsed.baseURL } : {}),
      ...(typeof parsed.model === 'string' ? { model: parsed.model } : {}),
    }
  } catch {
    return null
  }
}

/** 保存到 iOS Keychain / Android Keystore 加密存储。 */
export async function saveLLMCredentials(c: LLMCredentials): Promise<void> {
  const credentials: LLMCredentials = {
    apiKey: c.apiKey.trim(),
    ...(c.baseURL?.trim() ? { baseURL: c.baseURL.trim() } : {}),
    ...(c.model?.trim() ? { model: c.model.trim() } : {}),
  }
  if (!credentials.apiKey) {
    throw new Error('API Key 不能为空')
  }
  await Keychain.setGenericPassword(KEYCHAIN_ACCOUNT, JSON.stringify(credentials), {
    service: KEYCHAIN_SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
  })
}

/** 读取凭据；若发现旧版 MMKV 数据则安全迁移一次。 */
export async function loadLLMCredentials(): Promise<LLMCredentials | null> {
  try {
    const stored = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE })
    if (stored) {
      return parseCredentials(stored.password)
    }
  } catch {
    // 继续尝试旧数据迁移；没有旧数据时按未配置处理。
  }

  const apiKey = readLegacy(K_API_KEY)
  if (!apiKey) {
    return null
  }
  const legacy: LLMCredentials = {
    apiKey,
    ...(readLegacy(K_BASE_URL) ? { baseURL: readLegacy(K_BASE_URL) as string } : {}),
    ...(readLegacy(K_MODEL) ? { model: readLegacy(K_MODEL) as string } : {}),
  }
  await saveLLMCredentials(legacy)
  clearLegacy()
  return legacy
}

export async function getLLMApiKey(): Promise<string | null> {
  return (await loadLLMCredentials())?.apiKey ?? null
}

export async function getLLMBaseURL(): Promise<string | null> {
  return (await loadLLMCredentials())?.baseURL ?? null
}

export async function getLLMModel(): Promise<string | null> {
  return (await loadLLMCredentials())?.model ?? null
}

/** 清除凭据（退出登录 / 换账号）。 */
export async function clearLLMCredentials(): Promise<void> {
  await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE })
  clearLegacy()
}
