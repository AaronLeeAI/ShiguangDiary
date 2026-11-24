/** TTS 相关类型与音色表 */

export interface TTSConfig {
  baseURL: string
  apiKey: string
  model: string
  /** 单次最大字符数 */
  maxChars?: number
}

export interface TTSVoice {
  /** 传给 API 的 voice id */
  id: string
  /** 展示名 */
  label: string
  lang: 'zh' | 'en'
  gender: 'female' | 'male'
  desc?: string
}

/** 常用 Edge 神经音色（完整表见服务方文档） */
export const VOICES: TTSVoice[] = [
  {
    id: 'zh-CN-XiaoxiaoMultilingualNeural',
    label: '晓晓·多语种',
    lang: 'zh',
    gender: 'female',
    desc: '默认，中英文均可',
  },
  { id: 'zh-CN-YunxiNeural', label: '云希', lang: 'zh', gender: 'male' },
  { id: 'zh-CN-XiaoyiNeural', label: '晓伊', lang: 'zh', gender: 'female' },
  { id: 'zh-CN-YunjianNeural', label: '云健', lang: 'zh', gender: 'male' },
  { id: 'en-US-AriaNeural', label: 'Aria', lang: 'en', gender: 'female' },
  { id: 'en-US-GuyNeural', label: 'Guy', lang: 'en', gender: 'male' },
]

export const DEFAULT_VOICE = VOICES[0]

export interface TTSRequest {
  text: string
  voice?: TTSVoice
  /** 语速 0.25–2.0 */
  speed?: number
  /** 音调 0.5–1.5 */
  pitch?: number
  /** 风格：general / chat / newscast / affectionate 等 */
  style?: string
  format?: 'mp3' | 'opus' | 'aac' | 'wav' | 'flac' | 'pcm'
  model?: string
}
