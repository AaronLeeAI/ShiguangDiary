/**
 * TTS 客户端：把文本合成语音
 *
 * 协议兼容 OpenAI Audio Speech（/v1/audio/speech），对接：
 * - edge-tts-skills 同款服务（微软 Edge 神经音色，默认 https://tts.4321024.xyz/v1）
 * - 或任意 OpenAI 兼容 TTS 网关 / 自建 edge-tts 服务
 *
 * 输出为音频文件的本地 URI，交给 RN 播放器（项目已有 react-native-sound / expo-av / react-native-tts）。
 */
import { llmConfig } from '../config'
import type { TTSConfig, TTSRequest, TTSVoice } from './types'
import { DEFAULT_VOICE } from './types'

/** 默认走 edge-tts-skills 同款服务，可用 configureTTS 覆盖 */
const defaultConfig: TTSConfig = {
  baseURL: 'https://tts.4321024.xyz/v1',
  apiKey: '', // 运行时用 configureTTS 注入
  model: 'tts-1',
  maxChars: 120000,
}

let runtime: Partial<TTSConfig> = {}
export function configureTTS(patch: Partial<TTSConfig>) {
  runtime = { ...runtime, ...patch }
}

function cfg(): TTSConfig {
  return {
    ...defaultConfig,
    ...runtime,
    apiKey: runtime.apiKey || defaultConfig.apiKey || llmConfig.apiKey,
  }
}

export interface SpeechResult {
  /** 本地音频文件 URI，可直接喂给播放器 */
  uri: string
  mimeType: string
  bytes: number
}

/**
 * 合成语音，写入临时文件并返回本地 URI。
 * 在 RN 中用 RNFS 写文件；如项目未装 RNFS，可改为返回 base64 交给播放器。
 */
export async function synthesize(
  req: TTSRequest,
  writeFile: (base64: string, ext: string) => Promise<string>,
): Promise<SpeechResult> {
  const c = cfg()
  const voice: TTSVoice = req.voice ?? DEFAULT_VOICE
  const res = await fetch(`${c.baseURL}/audio/speech`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${c.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: req.model ?? c.model,
      voice: voice.id,
      input: req.text.slice(0, c.maxChars ?? 120000),
      speed: req.speed ?? 1.0,
      pitch: req.pitch ?? 1.0,
      ...(req.style ? { style: req.style } : {}),
      response_format: req.format ?? 'mp3',
      stream: false,
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`TTS 请求失败 ${res.status}: ${detail.slice(0, 160)}`)
  }

  // 以 base64 取回，交给上层写文件（避免 RN fetch 流式写文件的兼容问题）
  const buf = await res.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  const base64 = typeof btoa === 'function' ? btoa(bin) : ''
  const ext = req.format ?? 'mp3'
  const uri = await writeFile(base64, ext)

  return { uri, mimeType: `audio/${ext === 'mp3' ? 'mpeg' : ext}`, bytes: bytes.length }
}
