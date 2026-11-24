/**
 * Agent 数据访问适配层
 *
 * 作用：把 Agent 模块与拾光日记的 diaryRepository 解耦。
 * 集成时只需在 index.ts 里注入真实的 repository 方法即可（见 INTEGRATION.md）。
 *
 * 这样设计的好处：
 * 1. Agent 核心可独立单元测试（mock 这个 adapter）
 * 2. 不侵入现有数据库层
 */
import type { DiaryExcerpt } from '../types'

/**
 * 与项目真实 DiaryModel 对齐的最小字段集（见 src/database/models）
 * 注意：createdAt/updatedAt 在真实模型中是 number（毫秒时间戳）
 */
export interface DiaryRecord {
  id: string
  title: string
  content: string
  mood?: string | null
  weather?: string | null
  location?: string | null
  createdAt: number
  updatedAt?: number
  notebookId?: string | null
  /** 加密日记默认不进入本地语义索引。 */
  isEncrypted?: boolean
}

export interface DiaryRepositoryAdapter {
  /** 拉取全部日记（Agent 在内存中做检索/统计，数据量小时足够） */
  list(): Promise<DiaryRecord[]>
  findById(id: string): Promise<DiaryRecord | null>
  create(diary: Partial<DiaryRecord> & { title: string; content: string }): Promise<string>
  update(id: string, patch: Partial<DiaryRecord>): Promise<void>
  remove(id: string): Promise<void>
}

/**
 * 语音输出适配器（可选注入）。
 * Agent 需要"朗读"时，通过它把文本变成音频并播放，核心不依赖具体播放器/RNFS。
 */
export interface TTSAdapter {
  /** 把文本合成为语音并（可选）播放，返回给模型的结果描述 */
  speak(
    text: string,
    opts?: { voice?: string; speed?: number },
  ): Promise<{ ok: boolean; uri?: string; message: string }>
}

/** 把完整记录压成给 LLM 看的摘要，控制上下文体积 */
export function toExcerpt(d: DiaryRecord, maxLen = 400): DiaryExcerpt {
  const content = d.content ?? ''
  return {
    id: d.id,
    title: d.title ?? '',
    content: content.length > maxLen ? `${content.slice(0, maxLen)}…` : content,
    mood: d.mood,
    weather: d.weather,
    location: d.location,
    // 毫秒时间戳 → ISO 字符串，方便 LLM 理解日期
    createdAt: new Date(d.createdAt).toISOString(),
  }
}

/** 把 number 时间戳或 YYYY-MM-DD 字符串统一转成毫秒，供工具层比较 */
export function toMillis(v: unknown): number {
  if (typeof v === 'number') {
    return v
  }
  if (typeof v === 'string') {
    const n = Number(v)
    if (!Number.isNaN(n) && v.length >= 10) {
      return n < 1e12 ? n * 1000 : n
    }
    return new Date(v).getTime()
  }
  return NaN
}
