/**
 * 语音叙事能力：周报播报 / 日记朗读
 * 组合「周报/日记文本」+「TTS」，体现多模态输出。
 */
import { weeklyReport } from './insights'
import type { DiaryRepositoryAdapter } from '../tools/context'
import type { TTSAdapter } from '../tools/context'

/** 生成并朗读本周回顾，返回文本 + 播放结果 */
export async function narrateWeeklyReport(
  repo: DiaryRepositoryAdapter,
  tts: TTSAdapter,
): Promise<{ text: string; spoken: boolean; uri?: string }> {
  const text = await weeklyReport(repo)
  const r = await tts.speak(text)
  return { text, spoken: r.ok, ...(r.uri ? { uri: r.uri } : {}) }
}

/** 朗读指定日记（先取全文，转成适合朗读的口播文本） */
export async function narrateDiary(
  repo: DiaryRepositoryAdapter,
  tts: TTSAdapter,
  id: string,
): Promise<{ text: string; spoken: boolean }> {
  const d = await repo.findById(id)
  if (!d) {
    return { text: '没找到这篇日记', spoken: false }
  }
  const text = `《${d.title}》。${d.content ?? ''}`
  const r = await tts.speak(text)
  return { text, spoken: r.ok }
}
