/**
 * TTSAdapter 的 RN 实现
 *
 * 默认用项目已有的 react-native-tts（端侧系统音色，零新增依赖、离线可用）。
 * 网络 edge-tts 神经音色作为可选增强：需自行提供 fileWriter + player。
 */
import { synthesize } from './client'
import { VOICES } from './types'
import type { TTSAdapter } from '../tools/context'

/** 由上层注入：写 base64 音频到临时文件（网络 TTS 用） */
export type FileWriter = (base64: string, ext: string) => Promise<string>
/** 由上层注入：播放本地音频 uri（网络 TTS 用） */
export type Player = (uri: string) => Promise<void>

/**
 * 默认适配器：用 react-native-tts 朗读（无需网络、无需新依赖）
 */
export function createTTSAdapter(): TTSAdapter {
  let ready = false
  let tts: typeof import('react-native-tts').default | null = null

  const getTTS = async () => {
    if (!tts) {
      const module = await import('react-native-tts')
      tts = module.default
    }
    return tts
  }

  const ensureInit = async () => {
    if (ready) {
      return
    }
    const systemTTS = await getTTS()
    await systemTTS.setDefaultLanguage('zh-CN')
    await systemTTS.setDefaultRate(0)
    ready = true
  }

  return {
    async speak(text, opts) {
      if (!text.trim()) {
        return { ok: false, message: '没有可朗读的内容' }
      }
      try {
        await ensureInit()
        const systemTTS = await getTTS()
        if (typeof opts?.speed === 'number') {
          await systemTTS.setDefaultRate(Math.max(-1, Math.min(1, opts.speed - 1)))
        }
        await systemTTS.speak(text.slice(0, 5000))
        return { ok: true, message: '已开始朗读' }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        return { ok: false, message: `朗读失败：${msg}` }
      }
    },
  }
}

/**
 * 可选：网络 edge-tts 神经音色（更自然，需网络 + 播放器）
 * 本项目未装音频播放库时，请直接用上面的 createTTSAdapter()。
 */
export function createNetworkTTSAdapter(fileWriter: FileWriter, player: Player): TTSAdapter {
  return {
    async speak(text, opts) {
      if (!text.trim()) {
        return { ok: false, message: '没有可朗读的内容' }
      }
      try {
        const voice = VOICES.find(v => v.id === opts?.voice) ?? VOICES[0]
        const { uri } = await synthesize({ text, voice, speed: opts?.speed ?? 1 }, fileWriter)
        await player(uri)
        return { ok: true, uri, message: '已开始朗读（神经音色）' }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        return { ok: false, message: `网络朗读失败：${msg}，可降级用系统音色` }
      }
    },
  }
}
